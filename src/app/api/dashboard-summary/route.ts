import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import {
    addDaysToDateOnly,
    getDateOnlyInTimeZone,
} from '@/features/service-orders/service-order-deadline';
import {
    countOrdersByMonth,
    getMonthShortName,
    getMonthlyBuckets,
    getMonthlyWindowStart,
} from '@/lib/orders-by-month';

export const dynamic = "force-dynamic";

export async function GET() {

    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const today = getDateOnlyInTimeZone();
    const nextSevenDays = addDaysToDateOnly(today, 7);
    // AUD-10: a janela do gráfico começa no dia 1º do mês mais antigo, não
    // 180 dias atrás — a janela móvel truncava o mês do corte.
    const monthlyWindowStart = getMonthlyWindowStart();

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
        overdueOrdersResult,
        dueTodayOrdersResult,
        dueNextSevenDaysOrdersResult,
        urgentOrdersResult,
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

        // Ordens agrupadas por mês (os 6 meses do gráfico, desde o dia 1º do
        // primeiro deles). O limite de data entra como meia-noite de Brasília.
        supabase
            .from('service_orders')
            .select('created_at')
            .eq("user_id", user.id)
            .gte('created_at', `${monthlyWindowStart}T00:00:00-03:00`)
            .order('created_at', { ascending: true }),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'closed')
            .lt('due_date', today),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'closed')
            .eq('due_date', today),

        supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'closed')
            .gt('due_date', today)
            .lte('due_date', nextSevenDays),

        supabase
            .from('service_orders')
            .select(`
                id,
                title,
                status,
                priority,
                due_date,
                equipment:equipments ( name )
            `)
            .eq('user_id', user.id)
            .neq('status', 'closed')
            .lte('due_date', nextSevenDays)
            .order('due_date', { ascending: true })
            .limit(5),
    ]);

    // AUD-29: erro sem mensagem (ex.: abort) antes virava objeto truthy e
    // derrubava o dashboard com 500 silencioso. Agora conta como falha só
    // quando há mensagem, e o logger registra o que de fato falhou.
    const queryErrors = (
        [
            ['equipments', equipmentsResult],
            ['serviceOrders', serviceOrdersResult],
            ['openOrders', openOrdersResult],
            ['inProgressOrders', inProgressOrdersResult],
            ['closedOrders', closedOrdersResult],
            ['lowPriorityOrders', lowPriorityOrdersResult],
            ['mediumPriorityOrders', mediumPriorityOrdersResult],
            ['highPriorityOrders', highPriorityOrdersResult],
            ['criticalPriorityOrders', criticalPriorityOrdersResult],
            ['recentOrders', recentOrdersResult],
            ['recentEquipments', recentEquipmentsResult],
            ['ordersByMonth', ordersByMonthResult],
            ['overdueOrders', overdueOrdersResult],
            ['dueTodayOrders', dueTodayOrdersResult],
            ['dueNextSevenDaysOrders', dueNextSevenDaysOrdersResult],
            ['urgentOrders', urgentOrdersResult],
        ] as const
    ).flatMap(([name, result]) =>
        result.error?.message ? [name] : [],
    );

    const hasError = queryErrors.length > 0;

    // AUD-10: agrupa por chave `YYYY-MM` no fuso do domínio. Antes o mês do
    // servidor (UTC no deploy) decidia o balde, não o de Brasília.
    const monthlyData = countOrdersByMonth(
        (ordersByMonthResult.data ?? []) as { created_at: string }[],
        getMonthlyBuckets(),
    ).map((bucket) => ({
        month: getMonthShortName(bucket.monthKey),
        count: bucket.count,
    }));

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
        overdueServiceOrders: overdueOrdersResult.count ?? 0,
        dueTodayServiceOrders: dueTodayOrdersResult.count ?? 0,
        dueNextSevenDaysServiceOrders: dueNextSevenDaysOrdersResult.count ?? 0,
        completionRate,
        recentOrders: recentOrdersResult.data ?? [],
        recentEquipments: recentEquipmentsResult.data ?? [],
        urgentOrders: urgentOrdersResult.data ?? [],
        ordersByMonth: monthlyData,
    };

    if (hasError) {
        logger('error', 'api.error', {
            route: 'dashboard-summary',
            method: 'GET',
            failedQueries: queryErrors,
        });

        return NextResponse.json(
            { error: 'Erro ao carregar resumo do dashboard.' },
            { status: 500 },
        );
    }

    return NextResponse.json(responseBody);
}
