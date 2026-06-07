'use client';

import { useState } from 'react';
import type {
    ServiceOrder,
    ServiceOrderPriority,
    ServiceOrderStatus,
} from '@/types/service-order';

type ServiceOrderListProps = {
    orders: ServiceOrder[];
    isLoading: boolean;
    errorMessage: string;
    onRefresh: () => Promise<void>;
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
    open: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    closed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

const priorityStyles: Record<ServiceOrderPriority, string> = {
    low: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    critical: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export function ServiceOrderList({
    orders,
    isLoading,
    errorMessage,
    onRefresh,
}: ServiceOrderListProps) {
    const [deletingOrderId, setDeletingOrderId] = useState('');
    const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState('');

    async function handleDelete(orderId: string) {
        const confirmed = window.confirm(
            'Tem certeza que deseja excluir esta ordem de serviço?',
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingOrderId(orderId);

            const response = await fetch(`/api/service-orders/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir ordem de serviço.');
            }

            await onRefresh();
        } catch {
            window.alert('Não foi possível excluir a ordem de serviço.');
        } finally {
            setDeletingOrderId('');
        }
    }

    async function handleStatusChange(
        orderId: string,
        status: ServiceOrderStatus,
    ) {
        try {
            setUpdatingStatusOrderId(orderId);

            const response = await fetch(`/api/service-orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar status da ordem de serviço.');
            }

            await onRefresh();
        } catch (error) {
            window.alert('Não foi possível atualizar o status da ordem de serviço.');
        } finally {
            setUpdatingStatusOrderId('');
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <p className="text-sm text-slate-400">
                    Carregando ordens de serviço...
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
                <p className="text-sm text-slate-400">
                    Nenhuma ordem de serviço cadastrada ainda.
                </p>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Ordens cadastradas
                    </h2>

                    <p className="text-sm text-slate-400">
                        Acompanhe as solicitações abertas e seus equipamentos vinculados.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    {orders.length} {orders.length === 1 ? 'ordem' : 'ordens'}
                </span>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm transition hover:border-slate-700"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-base font-semibold text-white">
                                        {order.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {order.description || 'Sem descrição informada.'}
                                    </p>
                                </div>

                                <div className="grid gap-1 text-sm text-slate-400">
                                    <p>
                                        <span className="text-slate-500">Equipamento:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.name}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="text-slate-500">Patrimônio:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.patrimony_code}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="text-slate-500">Local:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.location}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                <select
                                    value={order.status}
                                    disabled={updatingStatusOrderId === order.id}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            order.id,
                                            event.target.value as ServiceOrderStatus,
                                        )
                                    }
                                    className={`rounded-full border px-3 py-1 text-xs font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusStyles[order.status]}`}
                                >
                                    <option value="open">Aberta</option>
                                    <option value="in_progress">Em andamento</option>
                                    <option value="closed">Fechada</option>
                                </select>

                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityStyles[order.priority]}`}
                                >
                                    {priorityLabels[order.priority]}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="rounded-full border border-red-500/30 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletingOrderId === order.id ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}