'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    serviceOrderPriorityLabels,
    serviceOrderPriorityStyles,
    serviceOrderStatusLabels,
    serviceOrderStatusStyles,
} from '@/features/service-orders/service-order-config';
import type {
    ServiceOrder,
    ServiceOrderStatus,
} from '@/types/service-order';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { ServiceOrderDeadlineBadge } from './service-order-deadline-badge';
import { formatDateOnlyPtBr } from './service-order-deadline';

type ServiceOrderListProps = {
    orders: ServiceOrder[];
    totalOrders: number;
    searchTerm: string;
    hasActiveFilters: boolean;
    isLoading: boolean;
    errorMessage: string;
    onRefresh: () => Promise<void>;
    page: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onCreateOrder: () => void;
};

export function ServiceOrderList({
    orders,
    totalOrders,
    searchTerm,
    hasActiveFilters,
    isLoading,
    errorMessage,
    onRefresh,
    page,
    totalPages,
    limit,
    onPageChange,
    onLimitChange,
    onCreateOrder,
}: ServiceOrderListProps) {
    const [deletingOrderId, setDeletingOrderId] = useState('');
    const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessageModal, setErrorMessageModal] = useState('');

    function openDeleteModal(orderId: string) {
        setDeletingOrderId(orderId);
        setIsDeleteModalOpen(true);
    }

    function closeDeleteModal() {
        setDeletingOrderId('');
        setIsDeleteModalOpen(false);
    }

    async function handleDelete() {
        try {
            const response = await fetch(`/api/service-orders/${deletingOrderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({})) as { error?: string };
                throw new Error(result.error ?? 'Erro ao excluir ordem de serviço.');
            }

            closeDeleteModal();
            await onRefresh();
        } catch (error) {
            setErrorMessageModal(error instanceof Error ? error.message : 'Não foi possível excluir a ordem de serviço.');
            setIsErrorModalOpen(true);
            closeDeleteModal();
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
                const result = await response.json().catch(() => ({})) as { error?: string };
                throw new Error(result.error ?? 'Erro ao atualizar status da ordem de serviço.');
            }

            await onRefresh();
        } catch (error) {
            setErrorMessageModal(error instanceof Error ? error.message : 'Não foi possível atualizar o status da ordem de serviço.');
            setIsErrorModalOpen(true);
        } finally {
            setUpdatingStatusOrderId('');
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                    >
                        <div className="space-y-2">
                            <div className="h-4 w-56 animate-pulse rounded bg-slate-800" />
                            <div className="h-3 w-40 animate-pulse rounded bg-slate-800/60" />
                        </div>
                    </div>
                ))}
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

    if (orders.length === 0) {
        const hasSearch = searchTerm.trim().length > 0;

        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-200">
                    {hasActiveFilters
                        ? 'Nenhuma ordem encontrada'
                        : 'Nenhuma ordem de serviço cadastrada'}
                </p>

                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    {hasActiveFilters
                        ? 'Tente alterar os filtros aplicados ou o termo de busca.'
                        : 'Crie sua primeira ordem de serviço para iniciar o controle.'}
                </p>

                {hasActiveFilters && hasSearch && (
                    <p className="mt-2 text-xs font-mono text-slate-400">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                    </p>
                )}

                {!hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onCreateOrder}
                        className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-400"
                    >
                        Criar Ordem
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Ordens ({totalOrders})
                </h2>
            </div>

            <div className="space-y-2.5">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
                    >
                        <div>
                            {/* Top row: Title + Priority */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                                <h3 className="text-sm font-bold text-slate-100">
                                    {order.title}
                                </h3>

                                <span
                                    className={`self-start sm:self-auto rounded-full border px-2 py-0.5 text-[11px] font-medium ${serviceOrderPriorityStyles[order.priority]}`}
                                >
                                    {serviceOrderPriorityLabels[order.priority]}
                                </span>
                            </div>

                            {order.description && (
                                <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                                    {order.description}
                                </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-3">
                                <span>
                                    <strong className="font-semibold text-slate-300">{order.equipment.name}</strong>
                                    <span className="font-mono text-slate-500 ml-1">({order.equipment.patrimony_code})</span>
                                </span>
                                <span className="text-slate-700">·</span>
                                <span>{order.equipment.location}</span>
                                {order.due_date && (
                                    <>
                                        <span className="text-slate-700">·</span>
                                        <span className="font-mono text-slate-400">Prazo: {formatDateOnlyPtBr(order.due_date)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bottom action bar */}
                        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <select
                                    value={order.status}
                                    disabled={updatingStatusOrderId === order.id}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            order.id,
                                            event.target.value as ServiceOrderStatus,
                                        )
                                    }
                                    aria-label={`Alterar status da ordem ${order.title}`}
                                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 bg-slate-900 cursor-pointer ${serviceOrderStatusStyles[order.status]}`}
                                >
                                    <option value="open" className="bg-slate-950 text-slate-100">
                                        {serviceOrderStatusLabels.open}
                                    </option>
                                    <option value="in_progress" className="bg-slate-950 text-slate-100">
                                        {serviceOrderStatusLabels.in_progress}
                                    </option>
                                    <option value="closed" className="bg-slate-950 text-slate-100">
                                        {serviceOrderStatusLabels.closed}
                                    </option>
                                </select>

                                <ServiceOrderDeadlineBadge
                                    dueDate={order.due_date}
                                    status={order.status}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/ordens/${order.id}`}
                                    className="text-xs font-semibold text-teal-400 hover:underline px-1"
                                >
                                    Detalhes
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50"
                                >
                                    {deletingOrderId === order.id ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalOrders}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />

        <Modal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
            title="Excluir ordem de serviço"
            description="Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            variant="danger"
        />

        <Modal
            isOpen={isErrorModalOpen}
            onClose={() => setIsErrorModalOpen(false)}
            onConfirm={() => setIsErrorModalOpen(false)}
            title="Erro"
            description={errorMessageModal}
            confirmLabel="Entendi"
            variant="danger"
        />
        </>
    );
}
