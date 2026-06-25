'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import type {
    ServiceOrder,
    ServiceOrderPriority,
    ServiceOrderStatus,
} from '@/types/service-order';
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

const statusLabels: Record<ServiceOrderStatus, string> = {
    open: 'Aberta',
    in_progress: 'Em andamento',
    closed: 'Fechada',
};

const priorityLabels: Record<ServiceOrderPriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
};

const statusStyles: Record<ServiceOrderStatus, string> = {
    open: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
    in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    closed: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
};

const priorityStyles: Record<ServiceOrderPriority, string> = {
    low: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    critical: 'border-red-500/30 bg-red-500/10 text-red-300',
};

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
            <section className="mx-auto max-w-5xl px-6 py-10">
                <Link
                    href="/ordens"
                    className="text-sm font-medium text-teal-300 transition hover:text-teal-200"
                >
                    ← Voltar para ordens
                </Link>

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
                        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                        Detalhes da ordem
                                    </span>

                                    <h1 className="mt-3 text-3xl font-bold text-white">
                                        {serviceOrder.title}
                                    </h1>

                                    <p className="mt-2 text-sm text-slate-400">
                                        {serviceOrder.description || 'Sem descrição informada.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <span
                                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[serviceOrder.status]}`}
                                    >
                                        {statusLabels[serviceOrder.status]}
                                    </span>

                                    <span
                                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${priorityStyles[serviceOrder.priority]}`}
                                    >
                                        {priorityLabels[serviceOrder.priority]}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Status
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {statusLabels[serviceOrder.status]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Prioridade
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {priorityLabels[serviceOrder.priority]}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Criada em
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {new Date(serviceOrder.created_at).toLocaleDateString(
                                            'pt-BR',
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        ID da ordem
                                    </p>
                                    <p className="mt-1 break-all text-sm font-medium text-slate-200">
                                        {serviceOrder.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                        Equipamento vinculado
                                    </span>

                                    <h2 className="mt-3 text-xl font-semibold text-white">
                                        {serviceOrder.equipment.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Dados do equipamento associado a esta ordem de serviço.
                                    </p>
                                </div>

                                <Link
                                    href={`/equipamentos/${serviceOrder.equipment.id}`}
                                    className="w-fit rounded-full border border-teal-500/30 px-3 py-1 text-xs font-medium text-teal-300 transition hover:bg-teal-500/10"
                                >
                                    Ver equipamento
                                </Link>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Patrimônio
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {serviceOrder.equipment.patrimony_code}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {serviceOrder.equipment.location}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Status do equipamento
                                    </p>

                                    <span
                                        className={`mt-2 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${equipmentStatusStyles[serviceOrder.equipment.status]}`}
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