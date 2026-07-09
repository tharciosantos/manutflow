import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

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

    if (!id) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço não informado.' },
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

    if (!id) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço não informado.' },
            { status: 400 },
        );
    }

    const body = await request.json().catch(() => null);

    const status = typeof body?.status === 'string' ? body.status : '';

    if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
            { error: 'Status inválido.' },
            { status: 400 },
        );
    }

    const { data: currentServiceOrder, error: currentServiceOrderError } =
        await supabase
            .from('service_orders')
            .select('id, status')
            .eq('id', id)
            .eq("user_id", user.id)
            .maybeSingle();

    if (currentServiceOrderError) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'PATCH', error: currentServiceOrderError.message });

        return NextResponse.json(
            { error: 'Erro ao buscar ordem de serviço atual.' },
            { status: 500 },
        );
    }

    if (!currentServiceOrder) {
        return NextResponse.json(
            { error: 'Ordem de serviço não encontrada.' },
            { status: 404 },
        );
    }

    // Inserir histórico PRIMEIRO para garantir atomicidade
    // Se o histórico falhar, o status permanece inalterado
    if (currentServiceOrder.status !== status) {
        const { error: historyError } = await supabase
            .from('service_order_history')
            .insert({
                service_order_id: id,
                user_id: user.id,
                event_type: 'status_changed',
                previous_status: currentServiceOrder.status,
                new_status: status,
                description: `Status alterado de ${currentServiceOrder.status} para ${status}.`,
            });

        if (historyError) {
            logger('error', 'api.error', { route: 'service-orders/[id]', method: 'PATCH', error: historyError.message });

            return NextResponse.json(
                { error: 'Erro ao registrar histórico. Status não foi alterado.' },
                { status: 500 },
            );
        }
    }

    // Atualizar status DEPOIS de inserir o histórico
    const { data, error } = await supabase
        .from('service_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) {
        logger('error', 'api.error', { route: 'service-orders/[id]', method: 'PATCH', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao atualizar status da ordem de serviço.' },
            { status: 500 },
        );
    }

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

    if (!id) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço não informado.' },
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