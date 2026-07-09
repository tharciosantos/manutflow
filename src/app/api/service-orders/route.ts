import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const allowedOrderStatuses = ['open', 'in_progress', 'closed'];

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

    // Filtro por busca textual
    if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Erro ao buscar ordens de serviço:', error);

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
    const body = await request.json().catch(() => null);

    // ⚠️ SEGURANÇA: Remove user_id do body para evitar que o cliente envie um id de outro usuário
    if (body) {
      delete body.user_id;
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : null;
    const equipmentId = typeof body?.equipment_id === 'string' ? body.equipment_id : '';
    const priority = typeof body?.priority === 'string' ? body.priority : 'medium';

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

    const { data, error } = await supabase
        .from('service_orders')
        .insert({
            title,
            description: description || null,
            equipment_id: equipmentId,
            priority,
            status: 'open',
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao cadastrar ordem de serviço:', error);

        return NextResponse.json(
            { error: 'Erro ao cadastrar ordem de serviço.' },
            { status: 500 },
        );
    }

    return NextResponse.json({ serviceOrder: data }, { status: 201 });
}