'use client';

import { useEffect, useState } from 'react';
import { StatusCard } from '@/components/ui/status-card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

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
    completionRate: number;
    recentOrders: RecentOrder[];
    recentEquipments: RecentEquipment[];
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
    low: { label: 'Baixa', color: 'text-slate-400', barColor: '#94a3b8' },
    medium: { label: 'Média', color: 'text-yellow-300', barColor: '#fbbf24' },
    high: { label: 'Alta', color: 'text-orange-300', barColor: '#fb923c' },
    critical: { label: 'Crítica', color: 'text-red-300', barColor: '#f87171' },
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

    // Auto-refresh ao voltar para a aba
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
            <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <div className="h-4 w-20 rounded bg-slate-800" />
                            <div className="mt-3 h-8 w-16 rounded bg-slate-800" />
                            <div className="mt-2 h-3 w-32 rounded bg-slate-800/60" />
                        </div>
                    ))}
                </div>
                <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                    <div className="h-5 w-40 rounded bg-slate-800" />
                    <div className="mt-6 h-48 rounded bg-slate-800/40" />
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
        );
    }

    const s = summary!;

    return (
        <div className="mt-6 space-y-6 sm:mt-10">
            {/* Cards de status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatusCard
                    title="Equipamentos"
                    value={String(s.totalEquipments)}
                    description="Máquinas e ativos cadastrados"
                    cardClassName="border-teal-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
                    valueClassName="text-teal-300"
                    icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                        </svg>
                    }
                />

                <StatusCard
                    title="Abertas"
                    value={String(s.openServiceOrders)}
                    description="Aguardando atendimento"
                    trend={s.criticalPriorityServiceOrders > 0 ? `${s.criticalPriorityServiceOrders} críticas` : ''}
                    trendUp={false}
                    cardClassName="border-amber-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
                    valueClassName="text-amber-300"
                    icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <StatusCard
                    title="Concluídas"
                    value={String(s.closedServiceOrders)}
                    description={`${s.completionRate}% de conclusão`}
                    trend={s.totalServiceOrders > 0 ? `${s.totalServiceOrders} total` : ''}
                    trendUp
                    cardClassName="border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50"
                    valueClassName="text-emerald-300"
                    icon={
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Grid: Gráfico + Prioridades */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Gráfico de ordens por mês */}
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 lg:col-span-2">
                    <h3 className="text-sm font-medium text-slate-400">Ordens nos últimos 6 meses</h3>

                    <div className="mt-4 h-56">
                        {s.ordersByMonth.some((m) => m.count > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={s.ordersByMonth} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={{ stroke: '#334155' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={{ stroke: '#334155' }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#1e293b' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '13px' }}
                                        labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                                        itemStyle={{ color: '#cbd5e1' }}
                                        formatter={(value) => [`${value} ordem${Number(value) !== 1 ? 'ns' : ''}`, 'Total']}
                                    />
                                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                Nenhuma ordem registrada nos últimos 6 meses.
                            </div>
                        )}
                    </div>
                </section>

                {/* Prioridades */}
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                    <h3 className="text-sm font-medium text-slate-400">Ordens por Prioridade</h3>

                    <div className="mt-4 space-y-4">
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
                                <div key={key}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className={config.color}>{config.label}</span>
                                        <span className="font-medium text-slate-300">{count}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, backgroundColor: config.barColor }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Grid: Atividades Recentes */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Últimas ordens */}
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                    <h3 className="text-sm font-medium text-slate-400">Últimas Ordens de Serviço</h3>

                    <div className="mt-4 space-y-3">
                        {s.recentOrders.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhuma ordem registrada.</p>
                        ) : (
                            s.recentOrders.map((order) => {
                                const equipName = Array.isArray(order.equipment)
                                    ? order.equipment[0]?.name
                                    : (order.equipment as { name: string })?.name;

                                return (
                                    <div key={order.id} className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-3 transition hover:border-slate-700">
                                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${order.status === 'open' ? 'bg-amber-400' : order.status === 'in_progress' ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-200">{order.title}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {equipName ?? 'Equipamento não informado'}
                                                {' · '}
                                                <span className={order.priority === 'critical' ? 'text-red-400' : order.priority === 'high' ? 'text-orange-400' : 'text-slate-400'}>
                                                    {priorityConfig[order.priority as keyof typeof priorityConfig]?.label ?? order.priority}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-slate-600">{formatDate(order.created_at)}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Últimos equipamentos */}
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                    <h3 className="text-sm font-medium text-slate-400">Últimos Equipamentos Cadastrados</h3>

                    <div className="mt-4 space-y-3">
                        {s.recentEquipments.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhum equipamento cadastrado.</p>
                        ) : (
                            s.recentEquipments.map((equipment) => (
                                <div key={equipment.id} className="flex items-start gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-3 transition hover:border-slate-700">
                                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-200">{equipment.name}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {equipment.patrimony_code}
                                            {' · '}
                                            <span className={equipment.status === 'active' ? 'text-teal-400' : equipment.status === 'maintenance' ? 'text-amber-400' : 'text-slate-400'}>
                                                {equipment.status === 'active' ? 'Ativo' : equipment.status === 'maintenance' ? 'Em manutenção' : 'Inativo'}
                                            </span>
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-slate-600">{formatDate(equipment.created_at)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}