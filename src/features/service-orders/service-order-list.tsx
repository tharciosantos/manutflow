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
import { 
    ClipboardList, 
    Cpu, 
    Tag, 
    MapPin, 
    Calendar, 
    ArrowUpRight, 
    Trash2, 
    Plus, 
    SearchX 
} from 'lucide-react';

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
        const hasSearch = searchTerm.trim().length > 0;

        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                    {hasActiveFilters ? <SearchX className="h-7 w-7" /> : <ClipboardList className="h-7 w-7 text-emerald-400/60" />}
                </div>

                <p className="text-base font-semibold text-slate-200">
                    {hasActiveFilters
                        ? 'Nenhuma ordem encontrada'
                        : 'Nenhuma ordem de serviço cadastrada'}
                </p>

                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    {hasActiveFilters
                        ? 'Tente alterar os filtros aplicados ou buscar por outro termo.'
                        : 'Crie sua primeira ordem de serviço para iniciar o controle de manutenção.'}
                </p>

                {hasActiveFilters && hasSearch && (
                    <p className="mt-3 text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                    </p>
                )}

                {!hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onCreateOrder}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
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
                    <h2 className="text-lg font-bold text-white sm:text-xl tracking-tight">
                        Ordens cadastradas
                    </h2>

                    <p className="text-xs text-slate-400 sm:text-sm">
                        Acompanhe as solicitações, prioridades e equipamentos vinculados.
                    </p>
                </div>

                <span className="text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                    {orders.length} {orders.length === 1 ? 'ordem encontrada' : 'ordens encontradas'}
                </span>
            </div>

            <div className="space-y-3.5">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                        <div>
                            {/* Top row: Title + Priority */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
                                <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                                    {order.title}
                                </h3>

                                <span
                                    className={`self-start sm:self-auto rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${serviceOrderPriorityStyles[order.priority]}`}
                                >
                                    {serviceOrderPriorityLabels[order.priority]}
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-3.5">
                                {order.description || 'Sem descrição detalhada informada.'}
                            </p>

                            {/* Meta Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-400 bg-slate-900/50 border border-slate-800/60 p-3 rounded-xl mb-4">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Cpu className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                    <span className="text-slate-500">Equip:</span>
                                    <span className="font-semibold text-slate-200 truncate">
                                        {order.equipment.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Tag className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                    <span className="text-slate-500">Patrimônio:</span>
                                    <span className="font-mono text-slate-300 truncate">
                                        {order.equipment.patrimony_code}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 min-w-0">
                                    <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                    <span className="text-slate-500">Local:</span>
                                    <span className="text-slate-300 truncate">
                                        {order.equipment.location}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Calendar className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                    <span className="text-slate-500">Prazo:</span>
                                    <span className="text-slate-300 truncate">
                                        {order.due_date ? formatDateOnlyPtBr(order.due_date) : 'Não definido'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom action bar */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 hidden sm:inline">Status:</span>
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
                                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-60 bg-slate-900 cursor-pointer ${serviceOrderStatusStyles[order.status]}`}
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
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50"
                                >
                                    <span>Ver Detalhes</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(order.id)}
                                    disabled={deletingOrderId === order.id}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Excluir ordem de serviço"
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                    <span className="hidden sm:inline">
                                        {deletingOrderId === order.id ? 'Excluindo...' : 'Excluir'}
                                    </span>
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
