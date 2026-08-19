'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
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
import { ArrowRight } from 'lucide-react';

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
                const response = await fetchWithRetry(`/api/service-orders/${serviceOrderId}`);
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
            <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Ordens", href: "/ordens" },
                        { label: serviceOrder?.title ?? "Carregando..." },
                    ]}
                />

                {isLoading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 animate-pulse text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="text-xs text-slate-500 font-mono dark:text-slate-400">
                            Carregando detalhes da ordem de serviço...
                        </p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                        <h1 className="text-sm font-semibold text-red-600 dark:text-red-300">
                            Não foi possível carregar a ordem de serviço
                        </h1>
                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/80">{errorMessage}</p>
                    </div>
                )}

                {!isLoading && serviceOrder && (
                    <>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
                                <div className="space-y-1">
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl dark:text-slate-100">
                                        {serviceOrder.title}
                                    </h1>

                                    {serviceOrder.description && (
                                        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed dark:text-slate-400">
                                            {serviceOrder.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                    <span
                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${serviceOrderStatusStyles[serviceOrder.status]}`}
                                    >
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${serviceOrderPriorityStyles[serviceOrder.priority]}`}
                                    >
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </span>

                                    <ServiceOrderDeadlineBadge
                                        dueDate={serviceOrder.due_date}
                                        status={serviceOrder.status}
                                    />
                                </div>
                            </div>

                            {/* 4 Métricas Técnicas */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </p>
                                    <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Prioridade
                                    </p>
                                    <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Criada em
                                    </p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                        {new Date(serviceOrder.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Prazo Limite
                                    </p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {serviceOrder.due_date
                                            ? formatDateOnlyPtBr(serviceOrder.due_date)
                                            : 'Não definido'}
                                    </p>
                                </div>
                            </div>

                            {/* Ajuste de Prazo */}
                            <form
                                className="border-t border-slate-200 pt-4 dark:border-slate-800/80"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void updateDeadline(dueDateDraft || null);
                                }}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="w-full sm:max-w-xs space-y-1">
                                        <label
                                            htmlFor="service-order-due-date"
                                            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                        >
                                            Ajustar prazo de execução
                                        </label>
                                        <input
                                            id="service-order-due-date"
                                            type="date"
                                            value={dueDateDraft}
                                            onChange={(event) => setDueDateDraft(event.target.value)}
                                            disabled={isUpdatingDeadline}
                                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-teal-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {serviceOrder.due_date && (
                                            <button
                                                type="button"
                                                onClick={() => void updateDeadline(null)}
                                                disabled={isUpdatingDeadline}
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                                            >
                                                Remover prazo
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isUpdatingDeadline}
                                            className="rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-teal-400 disabled:opacity-60 cursor-pointer shadow-xs"
                                        >
                                            {isUpdatingDeadline ? 'Salvando...' : 'Salvar prazo'}
                                        </button>
                                    </div>
                                </div>

                                {deadlineError && (
                                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                        {deadlineError}
                                    </p>
                                )}

                                {deadlineSuccess && (
                                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                        {deadlineSuccess}
                                    </p>
                                )}
                            </form>
                        </div>

                        {/* Seção do Equipamento Vinculado */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Equipamento Vinculado
                                    </h2>
                                </div>

                                <Link
                                    href={`/equipamentos/${serviceOrder.equipment.id}`}
                                    className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                                >
                                    Ver Detalhes do Ativo
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Nome</p>
                                    <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-200">{serviceOrder.equipment.name}</p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Patrimônio</p>
                                    <p className="font-mono text-slate-900 mt-0.5 dark:text-slate-200">{serviceOrder.equipment.patrimony_code}</p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Localização / Status</p>
                                    <p className="text-slate-900 mt-0.5 flex items-center gap-1.5 dark:text-slate-200">
                                        <span>{serviceOrder.equipment.location}</span>
                                        <span>·</span>
                                        <span className={equipmentStatusStyles[serviceOrder.equipment.status]}>
                                            {equipmentStatusLabels[serviceOrder.equipment.status]}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Seção do Histórico da Ordem */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Histórico de Alterações ({serviceOrder.history.length})
                                </h2>
                            </div>

                            {serviceOrder.history.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">
                                    Nenhuma alteração registrada até o momento.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {serviceOrder.history.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 dark:border-slate-800/70 dark:bg-slate-950/40"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                                                    {getHistoryDescription(item)}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                                                    {new Date(item.created_at).toLocaleString('pt-BR')}
                                                </p>
                                            </div>

                                            {item.previous_status && item.new_status && (
                                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${serviceOrderStatusStyles[item.previous_status]}`}>
                                                        {serviceOrderStatusLabels[item.previous_status]}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${serviceOrderStatusStyles[item.new_status]}`}>
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
