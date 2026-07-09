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

    return item.description ?? 'Alteração de status registrada.';
}

export default function ServiceOrderDetailsPage({
    params,
}: ServiceOrderDetailsPageProps) {
    const [serviceOrderId, setServiceOrderId] = useState('');
    const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

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

                setServiceOrder(result.serviceOrder ?? null);
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
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                        <p className="text-sm text-slate-400">
                            Carregando detalhes da ordem de serviço...
                        </p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                        <h1 className="text-xl font-semibold text-red-300">
                            Não foi possível carregar a ordem de serviço
                        </h1>

                        <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
                    </div>
                )}

                {!isLoading && serviceOrder && (
                    <>
                        <div className="mt-4 sm:mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-300 sm:px-3 sm:py-1 sm:text-xs">
                                        Detalhes da ordem
                                    </span>

                                    <h1 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl">
                                        {serviceOrder.title}
                                    </h1>

                                    <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
                                        {serviceOrder.description || 'Sem descrição informada.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end">
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${serviceOrderStatusStyles[serviceOrder.status]}`}
                                    >
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${serviceOrderPriorityStyles[serviceOrder.priority]}`}
                                    >
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Status
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {serviceOrderStatusLabels[serviceOrder.status]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Prioridade
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {serviceOrderPriorityLabels[serviceOrder.priority]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Criada em
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {new Date(serviceOrder.created_at).toLocaleDateString(
                                            'pt-BR',
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        ID da ordem
                                    </p>
                                    <p className="mt-1 break-all text-xs font-medium text-slate-200 sm:text-sm">
                                        {serviceOrder.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:mt-8 sm:p-6">
                            <div>
                                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-300 sm:px-3 sm:py-1 sm:text-xs">
                                    Histórico da ordem
                                </span>

                                <h2 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">
                                    Alterações registradas
                                </h2>

                                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                                    Registro das mudanças de status realizadas nesta ordem de serviço.
                                </p>
                            </div>

                            {serviceOrder.history.length === 0 ? (
                                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:mt-6 sm:p-4">
                                    <p className="text-xs text-slate-400 sm:text-sm">
                                        Nenhuma alteração de status registrada até o momento.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                                    {serviceOrder.history.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-slate-200 sm:text-sm">
                                                        {getHistoryDescription(item)}
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                                                        {new Date(item.created_at).toLocaleString(
                                                            'pt-BR',
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                    {item.previous_status && (
                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${serviceOrderStatusStyles[item.previous_status]}`}
                                                        >
                                                            {serviceOrderStatusLabels[item.previous_status]}
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] text-slate-500 sm:text-xs">→</span>

                                                    {item.new_status && (
                                                        <span
                                                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${serviceOrderStatusStyles[item.new_status]}`}
                                                        >
                                                            {serviceOrderStatusLabels[item.new_status]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:mt-8 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-300 sm:px-3 sm:py-1 sm:text-xs">
                                        Equipamento vinculado
                                    </span>

                                    <h2 className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">
                                        {serviceOrder.equipment.name}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                                        Dados do equipamento associado a esta ordem de serviço.
                                    </p>
                                </div>

                                <Link
                                    href={`/equipamentos/${serviceOrder.equipment.id}`}
                                    className="w-fit rounded-full border border-teal-500/30 px-2.5 py-1 text-[11px] font-medium text-teal-300 transition hover:bg-teal-500/10 sm:px-3 sm:py-1 sm:text-xs"
                                >
                                    Ver equipamento
                                </Link>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Patrimônio
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {serviceOrder.equipment.patrimony_code}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {serviceOrder.equipment.location}
                                    </p>
                                </div>

                                <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Status do equipamento
                                    </p>

                                    <span
                                        className={`mt-1.5 inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${equipmentStatusStyles[serviceOrder.equipment.status]}`}
                                    >
                                        {equipmentStatusLabels[serviceOrder.equipment.status]}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </section>
        </AppShell>
    );
}