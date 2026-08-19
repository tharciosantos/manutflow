'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/ui/status-card';
import { ServiceOrderDeadlineBadge } from '@/features/service-orders/service-order-deadline-badge';
import { serviceOrderPriorityLabels } from '@/features/service-orders/service-order-config';
import type {
    ServiceOrderPriority,
    ServiceOrderStatus,
} from '@/types/service-order';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

type RecentOrder = {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    equipment: { name: string } | { name: string }[];
};

type RecentEquipment = {
    id: string;
    name: string;
    patrimony_code: string;
    status: string;
    created_at: string;
};

type MonthlyData = {
    month: string;
    count: number;
};

type UrgentOrder = {
    id: string;
    title: string;
    status: ServiceOrderStatus;
    priority: ServiceOrderPriority;
    due_date: string;
    equipment: { name: string } | { name: string }[];
};

type DashboardSummary = {
    totalEquipments: number;
    totalServiceOrders: number;
    openServiceOrders: number;
    inProgressServiceOrders: number;
    closedServiceOrders: number;
    lowPriorityServiceOrders: number;
    mediumPriorityServiceOrders: number;
    highPriorityServiceOrders: number;
    criticalPriorityServiceOrders: number;
    overdueServiceOrders: number;
    dueTodayServiceOrders: number;
    dueNextSevenDaysServiceOrders: number;
    completionRate: number;
    recentOrders: RecentOrder[];
    recentEquipments: RecentEquipment[];
    urgentOrders: UrgentOrder[];
    ordersByMonth: MonthlyData[];
};

async function fetchDashboardSummary(): Promise<DashboardSummary> {
    const response = await fetchWithRetry('/api/dashboard-summary');

    if (!response.ok) {
        throw new Error('Erro ao carregar resumo do dashboard.');
    }

    return response.json();
}

const priorityConfig: Record<string, { label: string; color: string; barColor: string }> = {
    low: { label: 'Baixa', color: 'text-slate-600 dark:text-slate-400', barColor: '#64748b' },
    medium: { label: 'Média', color: 'text-amber-600 dark:text-amber-400', barColor: '#f59e0b' },
    high: { label: 'Alta', color: 'text-orange-600 dark:text-orange-400', barColor: '#f97316' },
    critical: { label: 'Crítica', color: 'text-red-600 dark:text-red-400', barColor: '#ef4444' },
};

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
      setErrorMessage('');
    } catch {
      setErrorMessage('Não foi possível carregar os indicadores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadDashboardSummary() {
      try {
        const data = await fetchDashboardSummary();

        if (ignore) {
          return;
        }

        setSummary(data);
        setErrorMessage('');
      } catch {
        if (!ignore) {
          setErrorMessage('Não foi possível carregar os indicadores.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardSummary();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void loadDashboardSummary();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ignore = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="mt-2 h-3 w-32 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/70 mt-0.5">
                            Ocorreu uma instabilidade temporária na consulta dos indicadores.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => void loadData()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 active:scale-95 transition-all shadow-xs dark:border-red-500/40 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Tentar novamente</span>
                </button>
            </div>
        );
    }

    const s = summary!;

    return (
        <div className="space-y-3.5">
            {/* 3 Stat Cards Principais */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <StatusCard
                    title="Equipamentos"
                    value={String(s.totalEquipments)}
                    description="Ativos cadastrados"
                    valueClassName="text-slate-900 dark:text-slate-100"
                />

                <StatusCard
                    title="Abertas"
                    value={String(s.openServiceOrders)}
                    description="Aguardando atendimento"
                    trend={s.criticalPriorityServiceOrders > 0 ? `${s.criticalPriorityServiceOrders} críticas` : ''}
                    trendUp={false}
                    valueClassName="text-amber-600 dark:text-amber-400"
                />

                <StatusCard
                    title="Concluídas"
                    value={String(s.closedServiceOrders)}
                    description={`${s.completionRate}% taxa de resolução`}
                    trend={s.totalServiceOrders > 0 ? `${s.totalServiceOrders} total` : ''}
                    trendUp
                    valueClassName="text-emerald-600 dark:text-emerald-400"
                />
            </div>

            {/* Prazos das Ordens */}
            <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Prazos das ordens</h2>
                    <Link
                        href="/ordens"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                        <span>Ver todas</span>
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    <Link
                        href="/ordens?deadline=overdue"
                        className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3 transition-colors hover:border-red-500/50 hover:bg-red-50/50 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Atrasadas</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-slate-500">SLA expirado</span>
                        </div>
                        <strong className={`mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums ${s.overdueServiceOrders > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {s.overdueServiceOrders}
                        </strong>
                    </Link>

                    <Link
                        href="/ordens?deadline=today"
                        className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3 transition-colors hover:border-amber-500/50 hover:bg-amber-50/50 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Vencem hoje</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-slate-500">Ação imediata</span>
                        </div>
                        <strong className={`mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums ${s.dueTodayServiceOrders > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'}`}>
                            {s.dueTodayServiceOrders}
                        </strong>
                    </Link>

                    <Link
                        href="/ordens?deadline=next_7_days"
                        className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3 transition-colors hover:border-sky-500/50 hover:bg-sky-50/50 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Próximos 7 dias</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-slate-500">Programadas</span>
                        </div>
                        <strong className={`mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums ${s.dueNextSevenDaysServiceOrders > 0 ? 'text-sky-600 dark:text-sky-300' : 'text-slate-400 dark:text-slate-500'}`}>
                            {s.dueNextSevenDaysServiceOrders}
                        </strong>
                    </Link>
                </div>
            </section>

            {/* Grid Principal: Gráfico + Prioridades & Ordens Urgentes */}
            <div className="grid gap-3.5 lg:grid-cols-3">
                {/* Coluna Esquerda (2/3): Gráfico + Ordens com Prazo Urgente */}
                <div className="space-y-3.5 lg:col-span-2 flex flex-col justify-between">
                    {/* Gráfico de ordens por mês */}
                    <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Ordens nos últimos 6 meses</h3>
                            <span className="text-[10px] font-mono text-slate-500">Histórico</span>
                        </div>

                        <div className="h-36 sm:h-40">
                            {s.ordersByMonth.some((m) => m.count > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={s.ordersByMonth} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={30} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                borderColor: '#334155',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#f8fafc',
                                            }}
                                            formatter={(value) => [`${value ?? 0} ordens`, 'Total']}
                                        />
                                        <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    Nenhuma ordem registrada no período.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Ordens com Prazo Urgente */}
                    <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Ordens com prazo mais urgente</h3>
                            <Link
                                href="/ordens?sort=due_asc"
                                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                            >
                                Ver por prazo
                            </Link>
                        </div>

                        <div className="space-y-1.5">
                            {s.urgentOrders.length === 0 ? (
                                <p className="text-xs text-slate-500 py-1 font-mono">Nenhum prazo urgente no momento.</p>
                            ) : (
                                s.urgentOrders.slice(0, 3).map((order) => {
                                    const equipmentName = Array.isArray(order.equipment)
                                        ? order.equipment[0]?.name
                                        : order.equipment?.name;

                                    return (
                                        <Link
                                            key={order.id}
                                            href={`/ordens/${order.id}`}
                                            className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 transition-colors hover:border-teal-500/40 hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200">
                                                    {order.title}
                                                </p>
                                                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                                    {`${equipmentName ?? 'Equipamento não informado'} · ${serviceOrderPriorityLabels[order.priority]}`}
                                                </p>
                                            </div>

                                            <ServiceOrderDeadlineBadge
                                                dueDate={order.due_date}
                                                status={order.status}
                                            />
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>

                {/* Coluna Direita (1/3): Prioridades + Últimas Atividades */}
                <div className="space-y-3.5 flex flex-col justify-between">
                    {/* Prioridades */}
                    <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-2.5">Por Prioridade</h3>

                        <div className="space-y-2">
                            {(['critical', 'high', 'medium', 'low'] as const).map((priorityKey) => {
                                const config = priorityConfig[priorityKey];
                                const count =
                                    priorityKey === 'critical'
                                        ? s.criticalPriorityServiceOrders
                                        : priorityKey === 'high'
                                            ? s.highPriorityServiceOrders
                                            : priorityKey === 'medium'
                                                ? s.mediumPriorityServiceOrders
                                                : s.lowPriorityServiceOrders;

                                const percent = s.totalServiceOrders > 0
                                    ? Math.round((count / s.totalServiceOrders) * 100)
                                    : 0;

                                return (
                                    <div key={priorityKey} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={`font-semibold ${config.color}`}>{config.label}</span>
                                            <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                                {count} <span className="text-slate-400">({percent}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{ width: `${percent}%`, backgroundColor: config.barColor }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Últimas Atividades */}
                    <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Últimas Atividades</h3>
                            <span className="text-[10px] font-mono text-slate-500">Recentes</span>
                        </div>

                        <div className="space-y-2">
                            {s.recentOrders.length === 0 ? (
                                <p className="text-xs text-slate-500 py-1 font-mono">Nenhuma atividade recente.</p>
                            ) : (
                                s.recentOrders.slice(0, 3).map((order) => {
                                    const equipmentName = Array.isArray(order.equipment)
                                        ? order.equipment[0]?.name
                                        : order.equipment?.name;

                                    return (
                                        <div key={order.id} className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-200">
                                                    {order.title}
                                                </p>
                                                <p className="truncate text-[10px] text-slate-500">
                                                    {equipmentName ?? 'Equipamento'}
                                                </p>
                                            </div>
                                            <span className="font-mono text-[10px] text-slate-500 shrink-0">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}