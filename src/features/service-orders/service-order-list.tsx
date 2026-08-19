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
import { RefreshCw, AlertCircle } from 'lucide-react';

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
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/40"
                    >
                        <div className="space-y-2">
                            <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-3 w-40 animate-pulse rounded bg-slate-200/60 dark:bg-slate-800/60" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
                            {errorMessage}
                        </p>
                        <p className="text-[11px] text-red-600/80 dark:text-red-400/70 mt-0.5">
                            Ocorreu uma instabilidade temporária na consulta.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => void onRefresh()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 active:scale-95 transition-all shadow-xs dark:border-red-500/40 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Tentar novamente</span>
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        const hasSearch = searchTerm.trim().length > 0;

        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {hasActiveFilters
                        ? 'Nenhuma ordem encontrada'
                        : 'Nenhuma ordem de serviço cadastrada'}
                </p>

                <p className="mt-1 text-xs text-slate-500 max-w-sm dark:text-slate-400">
                    {hasActiveFilters
                        ? 'Tente alterar os filtros aplicados ou o termo de busca.'
                        : 'Crie sua primeira ordem de serviço para iniciar o controle.'}
                </p>

                {hasActiveFilters && hasSearch && (
                    <p className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                    </p>
                )}

                {!hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onCreateOrder}
                        className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-400 cursor-pointer shadow-xs"
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Ordens ({totalOrders})
                </h2>
            </div>

            <div className="space-y-3">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300 space-y-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    >
                        {/* Linha Superior: Título na esquerda e Status + Prioridade + Prazo agrupados na direita */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                            <Link
                                href={`/ordens/${order.id}`}
                                className="text-sm font-bold text-slate-900 hover:text-teal-600 dark:text-slate-100 dark:hover:text-teal-400 transition-colors tracking-tight"
                            >
                                {order.title}
                            </Link>

                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
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
                                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 bg-white dark:bg-slate-900 cursor-pointer ${serviceOrderStatusStyles[order.status]}`}
                                >
                                    <option value="open" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                                        {serviceOrderStatusLabels.open}
                                    </option>
                                    <option value="in_progress" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                                        {serviceOrderStatusLabels.in_progress}
                                    </option>
                                    <option value="closed" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                                        {serviceOrderStatusLabels.closed}
                                    </option>
                                </select>

                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${serviceOrderPriorityStyles[order.priority]}`}
                                >
                                    {serviceOrderPriorityLabels[order.priority]}
                                </span>

                                <ServiceOrderDeadlineBadge
                                    dueDate={order.due_date}
                                    status={order.status}
                                />
                            </div>
                        </div>

                        {/* Descrição da Ordem */}
                        {order.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {order.description}
                            </p>
                        )}

                        {/* Rodapé: Ficha do Equipamento Vinculado e Ações */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-600 dark:text-slate-400">
                                <span className="font-semibold text-slate-800 dark:text-slate-300">
                                    {order.equipment.name}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">
                                    ({order.equipment.patrimony_code})
                                </span>
                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                <span>{order.equipment.location}</span>
                                {order.due_date && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-700">·</span>
                                        <span className="font-mono text-slate-600 dark:text-slate-400">
                                            Prazo: {formatDateOnlyPtBr(order.due_date)}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                <Link
                                    href={`/ordens/${order.id}`}
                                    className="font-semibold text-teal-600 hover:underline dark:text-teal-400"
                                >
                                    Detalhes
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="text-red-600/80 hover:text-red-600 transition-colors disabled:opacity-50 dark:text-red-400/80 dark:hover:text-red-400 cursor-pointer"
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
