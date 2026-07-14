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

type ServiceOrderListProps = {
    orders: ServiceOrder[];
    totalOrders: number;
    searchTerm: string;
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
            <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-800/70" />
                    </div>
                    <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-800/50 sm:mt-0" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-56 animate-pulse rounded bg-slate-800" />
                                    <div className="h-4 w-full animate-pulse rounded bg-slate-800/60" />
                                    <div className="grid gap-1">
                                        <div className="h-3.5 w-36 animate-pulse rounded bg-slate-800/50" />
                                        <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800/50" />
                                        <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800/50" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    <div className="h-7 w-24 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-7 w-16 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-7 w-24 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-7 w-16 animate-pulse rounded-full bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
        const hasOrders = totalOrders > 0;
        const hasSearch = searchTerm.trim().length > 0;

        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-6 py-16 text-center">
                {/* Ilustração SVG */}
                <svg
                    className="mb-4 h-16 w-16 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.35 3.836c-.765.66-1.516 1.47-2.152 2.71a2.75 2.75 0 01-2.036 1.644 2.753 2.753 0 00-1.736 1.074A7.5 7.5 0 0112 2.25c2.07 0 3.944 1.18 4.83 3.02a2.754 2.754 0 001.736 1.074 2.752 2.752 0 012.036-1.644c.636-1.24 1.387-2.05 2.152-2.71M12 18.75c-2.07 0-3.944-1.18-4.83-3.02A2.752 2.752 0 006.434 14.28m0 0A7.5 7.5 0 0112 14.25a7.5 7.5 0 015.566 2.28m0 0a2.752 2.752 0 002.036 1.644c.636 1.24 1.387 2.05 2.152 2.71M6.434 14.28a2.75 2.75 0 00-1.736-1.074 2.753 2.753 0 00-2.036-1.644M3.75 12h.008v.008H3.75V12z"
                    />
                </svg>

                <p className="text-base font-medium text-slate-300">
                    {hasOrders
                        ? 'Nenhuma ordem encontrada'
                        : 'Nenhuma ordem de serviço cadastrada'}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    {hasOrders
                        ? 'Tente alterar os filtros ou buscar por outro termo.'
                        : 'Crie sua primeira ordem de serviço para começar.'}
                </p>

                {hasOrders && hasSearch && (
                    <p className="mt-3 text-xs text-slate-600">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                    </p>
                )}

                {!hasOrders && (
                    <button
                        type="button"
                        onClick={onCreateOrder}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Criar Ordem de Serviço
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
        <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Ordens cadastradas
                    </h2>

                    <p className="text-xs text-slate-400 sm:text-sm">
                        Acompanhe as solicitações abertas e seus equipamentos vinculados.
                    </p>
                </div>

                <span className="text-xs text-slate-500 sm:text-sm">
                    {orders.length} {orders.length === 1 ? 'ordem' : 'ordens'}
                </span>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 sm:p-5"
                    >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-2">
                                <div>
                                    <h3 className="text-sm font-semibold text-white sm:text-base">
                                        {order.title}
                                    </h3>

                                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 sm:text-sm">
                                        {order.description || 'Sem descrição informada.'}
                                    </p>
                                </div>

                                <div className="grid gap-0.5 text-xs text-slate-400 sm:gap-1 sm:text-sm">
                                    <p className="truncate">
                                        <span className="text-slate-500">Equipamento:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.name}
                                        </span>
                                    </p>

                                    <p className="truncate">
                                        <span className="text-slate-500">Patrimônio:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.patrimony_code}
                                        </span>
                                    </p>

                                    <p className="truncate">
                                        <span className="text-slate-500">Local:</span>{' '}
                                        <span className="text-slate-300">
                                            {order.equipment.location}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:justify-end">
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
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1 sm:text-xs ${serviceOrderStatusStyles[order.status]}`}
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

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${serviceOrderPriorityStyles[order.priority]}`}
                                >
                                    {serviceOrderPriorityLabels[order.priority]}
                                </span>
                                <Link
                                    href={`/ordens/${order.id}`}
                                    className="rounded-full border border-teal-500/30 px-2.5 py-1 text-[11px] font-medium text-teal-300 transition hover:bg-teal-500/10 sm:px-3 sm:py-1 sm:text-xs"
                                >
                                    Detalhes
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="rounded-full border border-red-500/30 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-1 sm:text-xs"
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
