import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type RouteParams = {
    params: Promise<{
        id: string;
    }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: 'ID da ordem de serviço não informado.' },
            { status: 400 },
        );
    }

    const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir ordem de serviço:', error);

        return NextResponse.json(
            { error: 'Erro ao excluir ordem de serviço.' },
            { status: 500 },
        );
    }

    return NextResponse.json({
        message: 'Ordem de serviço excluída com sucesso.',
    });
}