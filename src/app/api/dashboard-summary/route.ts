import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {

    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

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
        recentOrdersResult,
        recentEquipmentsResult,
        ordersByMonthResult,
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
            .eq("user_id", user.id)
            .eq('status', 'open'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('status', 'in_progress'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('status', 'closed'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('priority', 'low'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('priority', 'medium'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('priority', 'high'),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq("user_id", user.id)
            .eq('priority', 'critical'),

        // Últimas 5 ordens para atividade recente
        supabase
            .from('service_orders')
            .select(`
                id,
                title,
                status,
                priority,
                created_at,
                equipment:equipments ( name )
            `)
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(5),

        // Últimos 5 equipamentos
        supabase
            .from('equipments')
            .select('id, name, patrimony_code, status, created_at')
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(5),

        // Ordens agrupadas por mês (últimos 6 meses)
        supabase
            .from('service_orders')
            .select('created_at')
            .eq("user_id", user.id)
            .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: true }),
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
        criticalPriorityOrdersResult.error ||
        recentOrdersResult.error ||
        recentEquipmentsResult.error ||
        ordersByMonthResult.error;

    // Processar ordens por mês (últimos 6 meses)
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyData.push({
            month: monthNames[d.getMonth()],
            count: 0,
        });
    }

    if (ordersByMonthResult.data) {
        for (const order of ordersByMonthResult.data as { created_at: string }[]) {
            const date = new Date(order.created_at);
            for (const entry of monthlyData) {
                const entryMonth = monthNames.indexOf(entry.month);
                if (entryMonth === date.getMonth()) {
                    entry.count++;
                    break;
                }
            }
        }
    }

    const total = serviceOrdersResult.count ?? 0;
    const closed = closedOrdersResult.count ?? 0;
    const completionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    const responseBody = {
        totalEquipments: equipmentsResult.count ?? 0,
        totalServiceOrders: total,
        openServiceOrders: openOrdersResult.count ?? 0,
        inProgressServiceOrders: inProgressOrdersResult.count ?? 0,
        closedServiceOrders: closed,
        lowPriorityServiceOrders: lowPriorityOrdersResult.count ?? 0,
        mediumPriorityServiceOrders: mediumPriorityOrdersResult.count ?? 0,
        highPriorityServiceOrders: highPriorityOrdersResult.count ?? 0,
        criticalPriorityServiceOrders: criticalPriorityOrdersResult.count ?? 0,
        completionRate,
        recentOrders: recentOrdersResult.data ?? [],
        recentEquipments: recentEquipmentsResult.data ?? [],
        ordersByMonth: monthlyData,
    };

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
            recentOrdersError: recentOrdersResult.error,
            recentEquipmentsError: recentEquipmentsResult.error,
            ordersByMonthError: ordersByMonthResult.error,
        });

        return NextResponse.json(
            { error: 'Erro ao carregar resumo do dashboard.' },
            { status: 500 },
        );
    }

    return NextResponse.json(responseBody);
}