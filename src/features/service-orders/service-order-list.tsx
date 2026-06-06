'use client';

import { useState } from 'react';
import type { ServiceOrder } from '@/types/service-order';

type ServiceOrderListProps = {
    orders: ServiceOrder[];
    isLoading: boolean;
    errorMessage: string;
    onDeleted: () => Promise<void>;
};

const statusLabels = {
    open: 'Aberta',
    in_progress: 'Em andamento',
    closed: 'Fechada',
};

const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
};

export function ServiceOrderList({
    orders,
    isLoading,
    errorMessage,
    onDeleted,
}: ServiceOrderListProps) {

    const [deletingOrderId, setDeletingOrderId] = useState('');

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

            await onDeleted();
        } catch {
            window.alert('Não foi possível excluir a ordem de serviço.');
        } finally {
            setDeletingOrderId('');
        }
    }

    if (isLoading) {
        return (
            <p className="text-sm text-slate-500">
                Carregando ordens de serviço...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
            </p>
        );
    }

    if (orders.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhuma ordem de serviço cadastrada ainda.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <article
                    key={order.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {order.title}
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                Equipamento: {order.equipment.name}
                            </p>

                            <p className="text-sm text-slate-500">
                                Patrimônio: {order.equipment.patrimony_code}
                            </p>

                            <p className="text-sm text-slate-500">
                                Local: {order.equipment.location}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {statusLabels[order.status]}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {priorityLabels[order.priority]}
                            </span>

                            <button
                                type="button"
                                onClick={() => handleDelete(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingOrderId === order.id ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>

                    {order.description && (
                        <p className="mt-3 text-sm text-slate-600">
                            {order.description}
                        </p>
                    )}
                </article>
            ))}
        </div>
    );
}