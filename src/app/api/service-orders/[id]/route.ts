import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { isValidDateOnly } from '@/features/service-orders/service-order-deadline';
import { isUuid } from '@/lib/validation';

export const dynamic = "force-dynamic";

const allowedStatuses = ['open', 'in_progress', 'closed'];

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;
    const { id } = await params;

    // Um ID fora do formato UUID não é "não encontrado": é inválido. Sem esta
    // checagem o PostgREST devolve 22P02 e a rota responde 500.
    if (!isUuid(id)) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço inválido.' },
            { status: 400 },
        );
    }

    const { data, error } = await supabase
        .from('service_orders')
        .select(`
            id,
            title,
            description,
            status,
            priority,
            equipment_id,
            due_date,
            created_at,
            equipment:equipments (
                id,
                name,
                patrimony_code,
                location,
                status
            )
        `)
        .eq('id', id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'GET', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao buscar ordem de serviço.' },
            { status: 500 },
        );
    }

    if (!data) {
        return NextResponse.json(
            { error: 'Ordem de serviço não encontrada.' },
            { status: 404 },
        );
    }

    const { data: history, error: historyError } = await supabase
        .from('service_order_history')
        .select(`
        id,
        service_order_id,
        event_type,
        previous_status,
        new_status,
        description,
        created_at
    `)
        .eq('service_order_id', id)
        .order('created_at', { ascending: false });

    if (historyError) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'GET', error: historyError.message });

        return NextResponse.json(
            { error: 'Erro ao buscar histórico da ordem.' },
            { status: 500 },
        );
    }

    return NextResponse.json({
        serviceOrder: {
            ...data,
            history: history ?? [],
        },
    });
}

export async function PATCH(request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(`service-orders:patch:${user.id}`);
    if (!allowed) {
        logger('warn', 'rate_limit.exceeded', { userId: user.id, route: 'service-orders/[id]', method: 'PATCH' });
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente mais tarde.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }

    const { id } = await params;

    // Um ID fora do formato UUID não é "não encontrado": é inválido. Sem esta
    // checagem o PostgREST devolve 22P02 e a rota responde 500.
    if (!isUuid(id)) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço inválido.' },
            { status: 400 },
        );
    }

    const body = await request.json().catch(() => null);

    const hasStatus = body !== null && Object.prototype.hasOwnProperty.call(body, 'status');
    const hasDueDate = body !== null && Object.prototype.hasOwnProperty.call(body, 'due_date');

    if (!hasStatus && !hasDueDate) {
        return NextResponse.json(
            { error: 'Nenhum campo válido para atualizar.' },
            { status: 400 },
        );
    }

    const status = hasStatus && typeof body.status === 'string' ? body.status : null;
    if (hasStatus && (!status || !allowedStatuses.includes(status))) {
        return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const dueDate = hasDueDate && (body.due_date === null || body.due_date === '')
        ? null
        : hasDueDate && typeof body.due_date === 'string'
            ? body.due_date
            : undefined;

    if (hasDueDate && dueDate !== null && (dueDate === undefined || !isValidDateOnly(dueDate))) {
        return NextResponse.json(
            { error: 'Prazo inválido. Use uma data no formato AAAA-MM-DD.' },
            { status: 400 },
        );
    }

    // AUD-04: status/prazo e histórico são gravados na MESMA transação, dentro da
    // RPC public.update_service_order. Antes, o histórico era inserido primeiro e o
    // UPDATE depois, o que permitia registrar uma mudança que não aconteceu.
    // A função também valida a titularidade (auth.uid()) e bloqueia a linha.
    const { data, error } = await supabase.rpc('update_service_order', {
        p_order_id: id,
        p_status: hasStatus ? status : null,
        p_due_date: dueDate ?? null,
        p_set_due_date: hasDueDate,
    });

    if (error) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'PATCH', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao atualizar ordem de serviço.' },
            { status: 500 },
        );
    }

    // A RPC devolve null quando a ordem não existe ou não pertence ao usuário.
    if (!data) {
        return NextResponse.json(
            { error: 'Ordem de serviço não encontrada.' },
            { status: 404 },
        );
    }

    return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(`service-orders:delete:${user.id}`);
    if (!allowed) {
        logger('warn', 'rate_limit.exceeded', { userId: user.id, route: 'service-orders/[id]', method: 'DELETE' });
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente mais tarde.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }

    const { id } = await params;

    // Um ID fora do formato UUID não é "não encontrado": é inválido. Sem esta
    // checagem o PostgREST devolve 22P02 e a rota responde 500.
    if (!isUuid(id)) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço inválido.' },
            { status: 400 },
        );
    }

    const { data: deletedServiceOrder, error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id)
        .eq("user_id", user.id)
        .select('id')
        .maybeSingle();

    if (error) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'DELETE', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao excluir ordem de serviço.' },
            { status: 500 },
        );
    }

    if (!deletedServiceOrder) {
        return NextResponse.json(
            {
                error:
                    'Ordem de serviço não foi excluída. Verifique se ela existe ou se há permissão para exclusão.',
            },
            { status: 404 },
        );
    }

    return NextResponse.json({
        message: 'Ordem de serviço excluída com sucesso.',
    });
}
