'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
    serviceOrderPriorityLabels,
    serviceOrderPriorityStyles,
    serviceOrderStatusLabels,
    serviceOrderStatusStyles,
} from '@/features/service-orders/service-order-config';
import type { ServiceOrder } from '@/types/service-order';
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
} from '@/features/equipments/equipment-status-config';
import { ServiceOrderDeadlineBadge } from '@/features/service-orders/service-order-deadline-badge';
import { formatDateOnlyPtBr } from '@/features/service-orders/service-order-deadline';
import { 
    ClipboardList, 
    History, 
    Cpu, 
    Tag, 
    MapPin, 
    ArrowUpRight, 
    CalendarClock,
    ArrowRight,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

type ServiceOrderDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

type ServiceOrderDetailsResponse = {
    serviceOrder?: ServiceOrder;
    error?: string;
};

function getHistoryDescription(item: ServiceOrder['history'][number]) {
    if (item.previous_status && item.new_status) {
        return `Status alterado de ${serviceOrderStatusLabels[item.previous_status]} para ${serviceOrderStatusLabels[item.new_status]}.`;
    }

    return item.description ?? 'Alteração registrada.';
}

export default function ServiceOrderDetailsPage({
    params,
}: ServiceOrderDetailsPageProps) {
    const [serviceOrderId, setServiceOrderId] = useState('');
    const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [dueDateDraft, setDueDateDraft] = useState('');
    const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
    const [deadlineError, setDeadlineError] = useState('');
    const [deadlineSuccess, setDeadlineSuccess] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadParams() {
            const { id } = await params;

            if (!ignore) {
                setServiceOrderId(id);
            }
        }

        void loadParams();

        return () => {
            ignore = true;
        };
    }, [params]);

    useEffect(() => {
        if (!serviceOrderId) {
            return;
        }

        let ignore = false;

        async function loadServiceOrderDetails() {
            setIsLoading(true);

            try {
                const response = await fetch(`/api/service-orders/${serviceOrderId}`);
                const result = (await response.json()) as ServiceOrderDetailsResponse;

                if (!response.ok) {
                    throw new Error(
                        result.error ?? 'Erro ao carregar detalhes da ordem de serviço.',
                    );
                }

                if (ignore) {
                    return;
                }

                const loadedServiceOrder = result.serviceOrder ?? null;
                setServiceOrder(loadedServiceOrder);
                setDueDateDraft(loadedServiceOrder?.due_date ?? '');
                setErrorMessage('');
            } catch (error) {
                if (ignore) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Erro inesperado ao carregar detalhes da ordem de serviço.';

                setErrorMessage(message);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadServiceOrderDetails();

        return () => {
            ignore = true;
        };
    }, [serviceOrderId]);

    async function updateDeadline(nextDueDate: string | null) {
        if (!serviceOrderId) return;

        setIsUpdatingDeadline(true);
        setDeadlineError('');
        setDeadlineSuccess('');

        try {
            const updateResponse = await fetch(`/api/service-orders/${serviceOrderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ due_date: nextDueDate }),
            });
            const updateResult = (await updateResponse.json()) as { error?: string };

            if (!updateResponse.ok) {
                throw new Error(updateResult.error ?? 'Erro ao atualizar o prazo.');
            }

            const detailsResponse = await fetch(`/api/service-orders/${serviceOrderId}`);
            const detailsResult = (await detailsResponse.json()) as ServiceOrderDetailsResponse;

            if (!detailsResponse.ok || !detailsResult.serviceOrder) {
                throw new Error(detailsResult.error ?? 'Erro ao recarregar a ordem de serviço.');
            }

            setServiceOrder(detailsResult.serviceOrder);
            setDueDateDraft(detailsResult.serviceOrder.due_date ?? '');
            setDeadlineSuccess(
                nextDueDate
                    ? 'Prazo atualizado com sucesso.'
                    : 'Prazo removido com sucesso.',
            );
        } catch (error) {
            setDeadlineError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível atualizar o prazo.',
            );
        } finally {
            setIsUpdatingDeadline(false);
        }
    }

    return (
        <AppShell>
            <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
                <Breadcrumbs
                    items={[
                        { label: "Ordens", href: "/ordens" },
                        { label: serviceOrder?.title ?? "Carregando..." },
                    ]}
                />

                {isLoading && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-8 animate-pulse text-center">
                        <p className="text-sm text-slate-400">
                            Carregando detalhes da ordem de serviço...
                        </p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h1 className="text-base font-semibold text-red-300">
                                Não foi possível carregar a ordem de serviço
                            </h1>
                            <p className="mt-1 text-sm text-red-300/80">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {!isLoading && serviceOrder && (
                    <>
                        <div className="mt-4 sm:mt-6 rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-7 shadow-sm space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-0.5 text-xs font-semibold text-teal-300">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        <span>Ordem de Serviço</span>
                                    </div>

                                    <h1 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                                        {serviceOrder.title}
                                    </h1>

                                    <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                                        {serviceOrder.description || 'Sem descrição detalhada informada.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${serviceOrderStatusStyles[serviceOrder.status]}`}
                                    >
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </span>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${serviceOrderPriorityStyles[serviceOrder.priority]}`}
                                    >
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </span>

                                    <ServiceOrderDeadlineBadge
                                        dueDate={serviceOrder.due_date}
                                        status={serviceOrder.status}
                                    />
                                </div>
                            </div>

                            {/* 4 Cards de Metadados */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-200">
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Prioridade
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-200">
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Criada em
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-200">
                                        {new Date(serviceOrder.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Prazo Limite
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-200">
                                        {serviceOrder.due_date
                                            ? formatDateOnlyPtBr(serviceOrder.due_date)
                                            : 'Não definido'}
                                    </p>
                                </div>
                            </div>

                            {/* Ajuste de Prazo */}
                            <form
                                className="border-t border-slate-800/80 pt-5"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void updateDeadline(dueDateDraft || null);
                                }}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="w-full sm:max-w-xs">
                                        <label
                                            htmlFor="service-order-due-date"
                                            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300"
                                        >
                                            <CalendarClock className="h-3.5 w-3.5 text-teal-400" />
                                            <span>Ajustar prazo de execução</span>
                                        </label>
                                        <input
                                            id="service-order-due-date"
                                            type="date"
                                            value={dueDateDraft}
                                            onChange={(event) => setDueDateDraft(event.target.value)}
                                            disabled={isUpdatingDeadline}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 outline-none transition focus:border-teal-500 disabled:opacity-60 [color-scheme:dark]"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {serviceOrder.due_date && (
                                            <button
                                                type="button"
                                                onClick={() => void updateDeadline(null)}
                                                disabled={isUpdatingDeadline}
                                                className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                                            >
                                                Remover prazo
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isUpdatingDeadline}
                                            className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-900/30 transition-all hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
                                        >
                                            {isUpdatingDeadline ? 'Salvando...' : 'Salvar prazo'}
                                        </button>
                                    </div>
                                </div>

                                {deadlineError && (
                                    <p className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-2.5 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{deadlineError}</span>
                                    </p>
                                )}

                                {deadlineSuccess && (
                                    <p className="mt-3 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                        <span>{deadlineSuccess}</span>
                                    </p>
                                )}
                            </form>
                        </div>

                        {/* Seção do Equipamento Vinculado */}
                        <section className="mt-6 rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300 mb-1.5">
                                        <Cpu className="h-3.5 w-3.5" />
                                        <span>Equipamento Vinculado</span>
                                    </div>

                                    <h2 className="text-lg font-bold text-white sm:text-xl">
                                        {serviceOrder.equipment.name}
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Ativo e localização associados a esta solicitação.
                                    </p>
                                </div>

                                <Link
                                    href={`/equipamentos/${serviceOrder.equipment.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 transition hover:bg-teal-500/20"
                                >
                                    <span>Ver Equipamento</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                                    <Tag className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Patrimônio</p>
                                        <p className="font-mono text-xs font-bold text-slate-200">
                                            {serviceOrder.equipment.patrimony_code}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                                    <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Localização</p>
                                        <p className="text-xs font-bold text-slate-200">
                                            {serviceOrder.equipment.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                                    <Cpu className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Status Ativo</p>
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${equipmentStatusStyles[serviceOrder.equipment.status]}`}>
                                            {equipmentStatusLabels[serviceOrder.equipment.status]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Seção do Histórico da Ordem */}
                        <section className="mt-6 rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300 mb-1.5">
                                    <History className="h-3.5 w-3.5" />
                                    <span>Auditoria & Histórico</span>
                                </div>

                                <h2 className="text-lg font-bold text-white sm:text-xl">
                                    Alterações Registradas
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Rastreabilidade das mudanças de status e prazos desta ordem.
                                </p>
                            </div>

                            {serviceOrder.history.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                                    Nenhuma alteração registrada até o momento.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {serviceOrder.history.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                                        >
                                            <div>
                                                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                                                    {getHistoryDescription(item)}
                                                </p>
                                                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                                    {new Date(item.created_at).toLocaleString('pt-BR')}
                                                </p>
                                            </div>

                                            {item.previous_status && item.new_status && (
                                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceOrderStatusStyles[item.previous_status]}`}>
                                                        {serviceOrderStatusLabels[item.previous_status]}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3 text-slate-500" />
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceOrderStatusStyles[item.new_status]}`}>
                                                        {serviceOrderStatusLabels[item.new_status]}
                                                    </span>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>
        </AppShell>
    );
}
