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
import { ArrowUpRight } from 'lucide-react';

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
    const response = await fetch('/api/dashboard-summary');

    if (!response.ok) {
        throw new Error('Erro ao carregar resumo do dashboard.');
    }

    return response.json();
}

const priorityConfig: Record<string, { label: string; color: string; barColor: string }> = {
    low: { label: 'Baixa', color: 'text-slate-400', barColor: '#64748b' },
    medium: { label: 'Média', color: 'text-amber-400', barColor: '#f59e0b' },
    high: { label: 'Alta', color: 'text-orange-400', barColor: '#f97316' },
    critical: { label: 'Crítica', color: 'text-red-400', barColor: '#ef4444' },
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
                        <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                            <div className="h-3 w-20 rounded bg-slate-800" />
                            <div className="mt-3 h-8 w-16 rounded bg-slate-800" />
                            <div className="mt-2 h-3 w-32 rounded bg-slate-800/60" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-xs sm:text-sm text-red-300">{errorMessage}</p>
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
                    valueClassName="text-slate-100"
                />

                <StatusCard
                    title="Abertas"
                    value={String(s.openServiceOrders)}
                    description="Aguardando atendimento"
                    trend={s.criticalPriorityServiceOrders > 0 ? `${s.criticalPriorityServiceOrders} críticas` : ''}
                    trendUp={false}
                    valueClassName="text-amber-400"
                />

                <StatusCard
                    title="Concluídas"
                    value={String(s.closedServiceOrders)}
                    description={`${s.completionRate}% taxa de resolução`}
                    trend={s.totalServiceOrders > 0 ? `${s.totalServiceOrders} total` : ''}
                    trendUp
                    valueClassName="text-emerald-400"
                />
            </div>

            {/* Prazos das Ordens */}
            <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prazos das ordens</h2>
                    <Link
                        href="/ordens"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:underline"
                    >
                        <span>Ver todas</span>
                        <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    <Link
                        href="/ordens?deadline=overdue"
                        className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 sm:p-3 transition-colors hover:border-red-500/50 hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Atrasadas</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-red-400/80">SLA expirado</span>
                        </div>
                        <strong className="mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums text-red-300">
                            {s.overdueServiceOrders}
                        </strong>
                    </Link>

                    <Link
                        href="/ordens?deadline=today"
                        className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 sm:p-3 transition-colors hover:border-amber-500/50 hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Vencem hoje</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-amber-400/80">Ação imediata</span>
                        </div>
                        <strong className="mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums text-amber-300">
                            {s.dueTodayServiceOrders}
                        </strong>
                    </Link>

                    <Link
                        href="/ordens?deadline=next_7_days"
                        className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 sm:p-3 transition-colors hover:border-sky-500/50 hover:bg-slate-900/80"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Próximos 7 dias</span>
                            <span className="hidden sm:inline text-[9px] font-mono text-sky-400/80">Programadas</span>
                        </div>
                        <strong className="mt-0.5 block font-mono text-lg sm:text-xl font-bold tabular-nums text-sky-300">
                            {s.dueNextSevenDaysServiceOrders}
                        </strong>
                    </Link>
                </div>
            </section>

            {/* Grid Principal: Gráfico + Prioridades & Ordens Urgentes */}
            <div className="grid gap-3.5 lg:grid-cols-3">
                {/* Coluna Esquerda (2/3): Gráfico + Ordens com Prazo Urgente */}
                <div className="space-y-3.5 lg:col-span-2">
                    {/* Gráfico de ordens por mês */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Ordens nos últimos 6 meses</h3>
                            <span className="text-[10px] font-mono text-slate-500">Histórico</span>
                        </div>

                        <div className="h-36 sm:h-40">
                            {s.ordersByMonth.some((m) => m.count > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={s.ordersByMonth} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            axisLine={{ stroke: '#334155' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            axisLine={{ stroke: '#334155' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                            contentStyle={{ 
                                                backgroundColor: '#090d16', 
                                                border: '1px solid #334155', 
                                                borderRadius: '6px', 
                                                fontSize: '11px',
                                                padding: '6px 10px'
                                            }}
                                            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                                            itemStyle={{ color: '#2dd4bf' }}
                                            formatter={(value) => [`${value} ordem${Number(value) !== 1 ? 'ns' : ''}`, 'Total']}
                                        />
                                        <Bar dataKey="count" fill="#14b8a6" radius={[3, 3, 0, 0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500 font-mono">
                                    Nenhuma ordem registrada no período.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Ordens com Prazo Urgente */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Ordens com prazo mais urgente</h3>
                            <Link
                                href="/ordens?sort=due_asc"
                                className="text-[11px] font-semibold text-teal-400 hover:underline"
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
                                            className="flex flex-col gap-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5 transition-colors hover:border-slate-700 hover:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-slate-200">
                                                    {order.title}
                                                </p>
                                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
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
                <div className="space-y-3.5">
                    {/* Prioridades */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">Por Prioridade</h3>

                        <div className="space-y-2">
                            {(['critical', 'high', 'medium', 'low'] as const).map((key) => {
                                const count =
                                    key === 'critical' ? s.criticalPriorityServiceOrders
                                    : key === 'high' ? s.highPriorityServiceOrders
                                    : key === 'medium' ? s.mediumPriorityServiceOrders
                                    : s.lowPriorityServiceOrders;

                                const config = priorityConfig[key];
                                const maxCount = Math.max(s.criticalPriorityServiceOrders, s.highPriorityServiceOrders, s.mediumPriorityServiceOrders, s.lowPriorityServiceOrders, 1);
                                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                return (
                                    <div key={key} className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className={`font-medium ${config.color}`}>{config.label}</span>
                                            <span className="font-mono font-bold text-slate-200">{count}</span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                                            <div 
                                                className="h-full rounded-full" 
                                                style={{ width: `${barWidth}%`, backgroundColor: config.barColor }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Atividades Recentes */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 sm:p-4 space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Atividades Recentes</h3>

                        <div className="space-y-1.5">
                            {s.recentOrders.length === 0 && s.recentEquipments.length === 0 ? (
                                <p className="text-xs text-slate-500 py-1 font-mono">Nenhuma atividade recente.</p>
                            ) : (
                                <>
                                    {s.recentOrders.slice(0, 2).map((order) => {
                                        const equipName = Array.isArray(order.equipment)
                                            ? order.equipment[0]?.name
                                            : (order.equipment as { name: string })?.name;

                                        return (
                                            <div key={order.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-950/40 px-2.5 py-1.5">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-slate-200">{order.title}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">
                                                        {equipName ?? 'OS'} · {priorityConfig[order.priority as keyof typeof priorityConfig]?.label ?? order.priority}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 font-mono text-[9px] text-slate-500">{formatDate(order.created_at)}</span>
                                            </div>
                                        );
                                    })}

                                    {s.recentEquipments.slice(0, 2).map((equipment) => (
                                        <div key={equipment.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-950/40 px-2.5 py-1.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium text-slate-200">{equipment.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400 truncate">
                                                    {equipment.patrimony_code}
                                                </p>
                                            </div>
                                            <span className="shrink-0 font-mono text-[9px] text-slate-500">{formatDate(equipment.created_at)}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
