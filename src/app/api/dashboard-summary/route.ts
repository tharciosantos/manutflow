import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
    const [
        equipmentsResult,
        serviceOrdersResult,
        openOrdersResult,
        inProgressOrdersResult,
        closedOrdersResult,
    ] = await Promise.all([
        supabase
            .from('equipments')
            .select('*', { count: 'exact', head: true }),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true }),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'in_progress'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'closed'),
    ]);

    const hasError =
        equipmentsResult.error ||
        serviceOrdersResult.error ||
        openOrdersResult.error ||
        inProgressOrdersResult.error ||
        closedOrdersResult.error;

    if (hasError) {
        console.error('Erro ao buscar resumo do dashboard:', {
            equipmentsError: equipmentsResult.error,
            serviceOrdersError: serviceOrdersResult.error,
            openOrdersError: openOrdersResult.error,
            inProgressOrdersError: inProgressOrdersResult.error,
            closedOrdersError: closedOrdersResult.error,
        });

        return NextResponse.json(
            { error: 'Erro ao buscar resumo do dashboard.' },
            { status: 500 },
        );
    }

    return NextResponse.json({
        totalEquipments: equipmentsResult.count ?? 0,
        totalServiceOrders: serviceOrdersResult.count ?? 0,
        openServiceOrders: openOrdersResult.count ?? 0,
        inProgressServiceOrders: inProgressOrdersResult.count ?? 0,
        closedServiceOrders: closedOrdersResult.count ?? 0,
    });
}