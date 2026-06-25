import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const allowedStatuses = ['open', 'in_progress', 'closed'];

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
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
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar ordem de serviço:', error);

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

    return NextResponse.json({
        serviceOrder: data,
    });
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

    const { data, error } = await supabase
        .from('service_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) {
        console.error('Erro ao atualizar status da ordem de serviço:', error);

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
        .select('id')
        .maybeSingle();

    if (error) {
        console.error('Erro ao excluir ordem de serviço:', error);

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