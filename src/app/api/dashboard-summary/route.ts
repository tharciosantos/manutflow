import { createClient } from "@/lib/supabase/server";
import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {

    const { user, error: authError } = await getUser();
    if (authError) return authError;

    const supabase = await createClient();

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
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id),
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