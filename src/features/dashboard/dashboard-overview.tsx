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
import { 
    Cpu, 
    Clock, 
    CheckCircle2, 
    AlertOctagon, 
    AlertTriangle, 
    CalendarClock, 
    ArrowUpRight, 
    Layers,
    BarChart3,
    Activity
} from 'lucide-react';

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

const priorityConfig: Record<string, { label: string; color: string; barColor: string; bgBadge: string }> = {
    low: { label: 'Baixa', color: 'text-slate-400', barColor: '#94a3b8', bgBadge: 'bg-slate-800/80 text-slate-300 border-slate-700' },
    medium: { label: 'Média', color: 'text-amber-300', barColor: '#f59e0b', bgBadge: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },
    high: { label: 'Alta', color: 'text-orange-300', barColor: '#f97316', bgBadge: 'bg-orange-950/40 text-orange-300 border-orange-800/50' },
    critical: { label: 'Crítica', color: 'text-red-300', barColor: '#ef4444', bgBadge: 'bg-red-950/50 text-red-300 border-red-800/60' },
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
        <div className="space-y-8">
            {/* Cards de status principais */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatusCard
                    title="Equipamentos"
                    value={String(s.totalEquipments)}
                    description="Máquinas e ativos cadastrados"
                    cardClassName="border-teal-500/25 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all"
                    valueClassName="text-teal-300"
                    icon={<Cpu className="h-5 w-5 text-teal-400" />}
                />

                <StatusCard
                    title="Abertas"
                    value={String(s.openServiceOrders)}
                    description="Aguardando atendimento"
                    trend={s.criticalPriorityServiceOrders > 0 ? `${s.criticalPriorityServiceOrders} críticas` : ''}
                    trendUp={false}
                    cardClassName="border-amber-500/25 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
                    valueClassName="text-amber-300"
                    icon={<Clock className="h-5 w-5 text-amber-400" />}
                />

                <StatusCard
                    title="Concluídas"
                    value={String(s.closedServiceOrders)}
                    description={`${s.completionRate}% de conclusão`}
                    trend={s.totalServiceOrders > 0 ? `${s.totalServiceOrders} total` : ''}
                    trendUp
                    cardClassName="border-emerald-500/25 bg-gradient-to-br from-slate-900/90 to-slate-950/80 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
                    valueClassName="text-emerald-300"
                    icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                />
            </div>

            {/* Prazos das Ordens */}
            <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-teal-400" />
                            <h2 className="text-lg font-bold text-white tracking-tight">Prazos das ordens</h2>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
                            Acompanhe vencimentos que exigem ação preventiva imediata.
                        </p>
                    </div>

                    <Link
                        href="/ordens"
                        className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-teal-400 transition hover:text-teal-300"
                    >
                        <span>Ver todas</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-3">
                    <Link
                        href="/ordens?deadline=overdue"
                        className="group rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/20 to-slate-950/70 p-4 transition-all duration-200 hover:border-red-500/50 hover:shadow-md hover:shadow-red-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-red-300">Atrasadas</span>
                            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                                <AlertOctagon className="h-4 w-4" />
                            </div>
                        </div>
                        <strong className="mt-2 block text-2xl sm:text-3xl font-extrabold text-red-200">
                            {s.overdueServiceOrders}
                        </strong>
                        <p className="mt-1 text-[11px] font-medium text-red-400/80">Prazo já expirado</p>
                    </Link>

                    <Link
                        href="/ordens?deadline=today"
                        className="group rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-slate-950/70 p-4 transition-all duration-200 hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-300">Vencem hoje</span>
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        </div>
                        <strong className="mt-2 block text-2xl sm:text-3xl font-extrabold text-amber-200">
                            {s.dueTodayServiceOrders}
                        </strong>
                        <p className="mt-1 text-[11px] font-medium text-amber-400/80">Atenção e execução hoje</p>
                    </Link>

                    <Link
                        href="/ordens?deadline=next_7_days"
                        className="group rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-950/20 to-slate-950/70 p-4 transition-all duration-200 hover:border-sky-500/50 hover:shadow-md hover:shadow-sky-500/10"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-sky-300">Próximos 7 dias</span>
                            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                                <CalendarClock className="h-4 w-4" />
                            </div>
                        </div>
                        <strong className="mt-2 block text-2xl sm:text-3xl font-extrabold text-sky-200">
                            {s.dueNextSevenDaysServiceOrders}
                        </strong>
                        <p className="mt-1 text-[11px] font-medium text-sky-400/80">Planejamento da semana</p>
                    </Link>
                </div>
            </section>

            {/* Grid: Gráfico + Prioridades */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Gráfico de ordens por mês com Gradiente */}
                <section className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 lg:col-span-2 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-teal-400" />
                            <h3 className="text-sm font-semibold text-slate-200">Ordens nos últimos 6 meses</h3>
                        </div>
                        <span className="text-xs font-mono text-slate-500">Histórico mensal</span>
                    </div>

                    <div className="mt-4 h-56">
                        {s.ordersByMonth.some((m) => m.count > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={s.ordersByMonth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="barTealGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#0f766e" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        axisLine={{ stroke: '#334155' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        axisLine={{ stroke: '#334155' }}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                        contentStyle={{ 
                                            backgroundColor: '#090d16', 
                                            border: '1px solid #334155', 
                                            borderRadius: '12px', 
                                            fontSize: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                        }}
                                        labelStyle={{ color: '#f1f5f9', fontWeight: 700 }}
                                        itemStyle={{ color: '#2dd4bf' }}
                                        formatter={(value) => [`${value} ordem${Number(value) !== 1 ? 'ns' : ''}`, 'Total']}
                                    />
                                    <Bar dataKey="count" fill="url(#barTealGradient)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs sm:text-sm text-slate-500">
                                Nenhuma ordem registrada nos últimos 6 meses.
                            </div>
                        )}
                    </div>
                </section>

                {/* Prioridades com Barra de Progresso */}
                <section className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="h-4 w-4 text-teal-400" />
                        <h3 className="text-sm font-semibold text-slate-200">Ordens por Prioridade</h3>
                    </div>

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
                                <div key={key} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${config.color}`}>{config.label}</span>
                                        <span className="font-mono font-bold text-slate-200">{count}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                                        <div 
                                            className="h-full rounded-full transition-all duration-700 ease-out" 
                                            style={{ width: `${barWidth}%`, backgroundColor: config.barColor }} 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Ordens com Prazo Urgente */}
            <section className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-sm space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Ordens com prazo mais urgente</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Atrasadas e vencimentos dos próximos 7 dias que necessitam de triagem.
                        </p>
                    </div>

                    <Link
                        href="/ordens?sort=due_asc"
                        className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-teal-400 transition hover:text-teal-300"
                    >
                        <span>Ver por prazo</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="space-y-2.5">
                    {s.urgentOrders.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs sm:text-sm text-slate-500">
                            Nenhum prazo urgente no momento. Todas as ordens estão em dia! ✨
                        </div>
                    ) : (
                        s.urgentOrders.map((order) => {
                            const equipmentName = Array.isArray(order.equipment)
                                ? order.equipment[0]?.name
                                : order.equipment?.name;

                            return (
                                <Link
                                    key={order.id}
                                    href={`/ordens/${order.id}`}
                                    className="group flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition-all duration-200 hover:border-teal-500/40 hover:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                                            {order.title}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-slate-400">
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

            {/* Grid: Atividades Recentes */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Últimas ordens */}
                <section className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Últimas Ordens de Serviço</h3>

                    <div className="space-y-2.5">
                        {s.recentOrders.length === 0 ? (
                            <p className="text-xs text-slate-500">Nenhuma ordem registrada.</p>
                        ) : (
                            s.recentOrders.map((order) => {
                                const equipName = Array.isArray(order.equipment)
                                    ? order.equipment[0]?.name
                                    : (order.equipment as { name: string })?.name;

                                return (
                                    <div key={order.id} className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 transition hover:border-slate-700">
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${order.status === 'open' ? 'bg-amber-400 ring-2 ring-amber-400/20' : order.status === 'in_progress' ? 'bg-orange-400 ring-2 ring-orange-400/20' : 'bg-emerald-400 ring-2 ring-emerald-400/20'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs sm:text-sm font-semibold text-slate-200">{order.title}</p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {equipName ?? 'Equipamento não informado'}
                                                {' · '}
                                                <span className={order.priority === 'critical' ? 'text-red-400 font-medium' : order.priority === 'high' ? 'text-orange-400 font-medium' : 'text-slate-400'}>
                                                    {priorityConfig[order.priority as keyof typeof priorityConfig]?.label ?? order.priority}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-[11px] font-mono text-slate-500">{formatDate(order.created_at)}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Últimos equipamentos */}
                <section className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Últimos Equipamentos Cadastrados</h3>

                    <div className="space-y-2.5">
                        {s.recentEquipments.length === 0 ? (
                            <p className="text-xs text-slate-500">Nenhum equipamento cadastrado.</p>
                        ) : (
                            s.recentEquipments.map((equipment) => (
                                <div key={equipment.id} className="flex items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 transition hover:border-slate-700">
                                    <div className="p-1 rounded-md bg-slate-800/80 text-teal-400 shrink-0 mt-0.5">
                                        <Cpu className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs sm:text-sm font-semibold text-slate-200">{equipment.name}</p>
                                        <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-1.5">
                                            <span className="font-mono text-slate-300">{equipment.patrimony_code}</span>
                                            <span>·</span>
                                            <span className={equipment.status === 'active' ? 'text-teal-400 font-medium' : equipment.status === 'maintenance' ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                                                {equipment.status === 'active' ? 'Ativo' : equipment.status === 'maintenance' ? 'Em manutenção' : 'Inativo'}
                                            </span>
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[11px] font-mono text-slate-500">{formatDate(equipment.created_at)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
