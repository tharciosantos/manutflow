import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
    const [
        equipmentsResult,
        serviceOrdersResult,
        openOrdersResult,
        inProgressOrdersResult,
        closedOrdersResult,
        lowPriorityOrdersResult,
        mediumPriorityOrdersResult,
        highPriorityOrdersResult,
        criticalPriorityOrdersResult,
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

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'low'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'medium'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'high'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'critical'),
    ]);

    const hasError =
        equipmentsResult.error ||
        serviceOrdersResult.error ||
        openOrdersResult.error ||
        inProgressOrdersResult.error ||
        closedOrdersResult.error ||
        lowPriorityOrdersResult.error ||
        mediumPriorityOrdersResult.error ||
        highPriorityOrdersResult.error ||
        criticalPriorityOrdersResult.error;

    if (hasError) {
        console.error('Erro ao buscar resumo do dashboard:', {
            equipmentsError: equipmentsResult.error,
            serviceOrdersError: serviceOrdersResult.error,
            openOrdersError: openOrdersResult.error,
            inProgressOrdersError: inProgressOrdersResult.error,
            closedOrdersError: closedOrdersResult.error,
            lowPriorityOrdersError: lowPriorityOrdersResult.error,
            mediumPriorityOrdersError: mediumPriorityOrdersResult.error,
            highPriorityOrdersError: highPriorityOrdersResult.error,
            criticalPriorityOrdersError: criticalPriorityOrdersResult.error,
        });

        return NextResponse.json({
            totalEquipments: equipmentsResult.count ?? 0,
            totalServiceOrders: serviceOrdersResult.count ?? 0,
            openServiceOrders: openOrdersResult.count ?? 0,
            inProgressServiceOrders: inProgressOrdersResult.count ?? 0,
            closedServiceOrders: closedOrdersResult.count ?? 0,
            lowPriorityServiceOrders: lowPriorityOrdersResult.count ?? 0,
            mediumPriorityServiceOrders: mediumPriorityOrdersResult.count ?? 0,
            highPriorityServiceOrders: highPriorityOrdersResult.count ?? 0,
            criticalPriorityServiceOrders: criticalPriorityOrdersResult.count ?? 0,
        });
    }

    return NextResponse.json({
        totalEquipments: equipmentsResult.count ?? 0,
        totalServiceOrders: serviceOrdersResult.count ?? 0,
        openServiceOrders: openOrdersResult.count ?? 0,
        inProgressServiceOrders: inProgressOrdersResult.count ?? 0,
        closedServiceOrders: closedOrdersResult.count ?? 0,
    });
}