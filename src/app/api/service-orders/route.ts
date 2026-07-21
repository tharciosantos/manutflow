import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import {
    addDaysToDateOnly,
    getDateOnlyInTimeZone,
    isValidDateOnly,
} from '@/features/service-orders/service-order-deadline';

export const dynamic = "force-dynamic";

const allowedOrderStatuses = ['open', 'in_progress', 'closed'];
const allowedDeadlineFilters = ['overdue', 'today', 'next_7_days', 'without_due_date'];

export async function GET(request: Request) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));
    const offset = (page - 1) * limit;

    const searchQuery = url.searchParams.get("q")?.trim() || "";
    const statusFilter = url.searchParams.get("status") || "";
    const priorityFilter = url.searchParams.get("priority") || "";
    const deadlineFilter = url.searchParams.get("deadline") || "";
    const sort = url.searchParams.get("sort") || "created_desc";

    // Construir query com filtros
    let query = supabase
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
    `, { count: "exact", head: false })
        .eq("user_id", user.id);

    // Filtro por status
    if (statusFilter && allowedOrderStatuses.includes(statusFilter)) {
        query = query.eq('status', statusFilter);
    }

    // Filtro por prioridade
    if (priorityFilter && allowedPriorities.includes(priorityFilter)) {
        query = query.eq('priority', priorityFilter);
    }

    if (allowedDeadlineFilters.includes(deadlineFilter)) {
        const today = getDateOnlyInTimeZone();

        if (deadlineFilter === 'overdue') {
            query = query.lt('due_date', today).neq('status', 'closed');
        } else if (deadlineFilter === 'today') {
            query = query.eq('due_date', today).neq('status', 'closed');
        } else if (deadlineFilter === 'next_7_days') {
            query = query
                .gt('due_date', today)
                .lte('due_date', addDaysToDateOnly(today, 7))
                .neq('status', 'closed');
        } else {
            query = query.is('due_date', null);
        }
    }

    // Filtro por busca textual
    if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
    }

    if (sort === 'due_asc' || sort === 'due_desc') {
        query = query
            .order('due_date', { ascending: sort === 'due_asc', nullsFirst: false })
            .order('created_at', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: sort === 'created_asc' });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
        logger('error', 'api.error', { route: 'service-orders', method: 'GET', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao buscar ordens de serviço.' },
            { status: 500 },
        );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      serviceOrders: data ?? [],
      total,
      page,
      totalPages,
    });
}


const allowedPriorities = ['low', 'medium', 'high', 'critical'];

export async function POST(request: Request) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(`service-orders:post:${user.id}`);
    if (!allowed) {
        logger('warn', 'rate_limit.exceeded', { userId: user.id, route: 'service-orders', method: 'POST' });
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente mais tarde.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }
    const body = await request.json().catch(() => null);

    // ⚠️ SEGURANÇA: Remove user_id do body para evitar que o cliente envie um id de outro usuário
    if (body) {
      delete body.user_id;
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : null;
    const equipmentId = typeof body?.equipment_id === 'string' ? body.equipment_id : '';
    const priority = typeof body?.priority === 'string' ? body.priority : 'medium';
    const hasDueDate = body !== null && Object.prototype.hasOwnProperty.call(body, 'due_date');
    const dueDate = body?.due_date === null || body?.due_date === ''
        ? null
        : typeof body?.due_date === 'string'
            ? body.due_date
            : undefined;

    if (title.length > 255) {
        return NextResponse.json(
            { error: 'O título deve ter no máximo 255 caracteres.' },
            { status: 400 },
        );
    }

    if (description && description.length > 2000) {
        return NextResponse.json(
            { error: 'A descrição deve ter no máximo 2000 caracteres.' },
            { status: 400 },
        );
    }

    if (!title) {
        return NextResponse.json(
            { error: 'O título da ordem de serviço é obrigatório.' },
            { status: 400 },
        );
    }

    if (!equipmentId) {
        return NextResponse.json(
            { error: 'Selecione um equipamento para a ordem de serviço.' },
            { status: 400 },
        );
    }

    if (!allowedPriorities.includes(priority)) {
        return NextResponse.json(
            { error: 'Prioridade inválida.' },
            { status: 400 },
        );
    }

    if (hasDueDate && (dueDate === undefined || (dueDate !== null && !isValidDateOnly(dueDate)))) {
        return NextResponse.json(
            { error: 'Prazo inválido. Use uma data no formato AAAA-MM-DD.' },
            { status: 400 },
        );
    }

    const { data, error } = await supabase
        .from('service_orders')
        .insert({
            title,
            description: description || null,
            equipment_id: equipmentId,
            priority,
            status: 'open',
            due_date: dueDate ?? null,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        logger('error', 'api.error', { route: 'service-orders', method: 'POST', error: error.message });

        return NextResponse.json(
            { error: 'Erro ao cadastrar ordem de serviço.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ serviceOrder: data }, { status: 201 });
}
