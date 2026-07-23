'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ServiceOrder } from '@/types/service-order';

import { ServiceOrderForm } from './service-order-form';
import { ServiceOrderList } from './service-order-list';
import { Toolbar } from '@/components/ui/toolbar';
import { Modal } from '@/components/ui/modal';
import type {
    ServiceOrderStatusFilterValue,
    ServiceOrderPriorityFilterValue,
    ServiceOrderDeadlineFilterValue,
} from './service-order-config';
import {
    serviceOrderStatusFilterOptions,
    serviceOrderPriorityFilterOptions,
    serviceOrderDeadlineFilterOptions,
} from './service-order-config';

type ServiceOrdersApiResponse = {
    serviceOrders: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
    error?: string;
};

type ServiceOrderPageContentProps = {
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
};

type ServiceOrderSortValue = 'created_desc' | 'created_asc' | 'due_asc' | 'due_desc';

const serviceOrderSortOptions: Array<{
    value: ServiceOrderSortValue;
    label: string;
}> = [
        { value: 'created_desc', label: 'Mais recentes' },
        { value: 'created_asc', label: 'Mais antigas' },
        { value: 'due_asc', label: 'Prazo mais próximo' },
        { value: 'due_desc', label: 'Prazo mais distante' },
    ];

export function ServiceOrderPageContent({ isFormModalOpen, setIsFormModalOpen }: ServiceOrderPageContentProps) {
    const searchParams = useSearchParams();
    const requestedDeadline = searchParams.get('deadline');
    const requestedSort = searchParams.get('sort');
    const initialDeadline = serviceOrderDeadlineFilterOptions.some(
        (option) => option.value === requestedDeadline && option.value !== 'all',
    )
        ? requestedDeadline as ServiceOrderDeadlineFilterValue
        : 'all';
    const initialSort = serviceOrderSortOptions.some(
        (option) => option.value === requestedSort && option.value !== 'created_desc',
    )
        ? requestedSort as ServiceOrderSortValue
        : 'created_desc';
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedStatus, setSelectedStatus] =
        useState<ServiceOrderStatusFilterValue>('all');
    const [selectedPriority, setSelectedPriority] =
        useState<ServiceOrderPriorityFilterValue>('all');
    const [selectedDeadline, setSelectedDeadline] =
        useState<ServiceOrderDeadlineFilterValue>(initialDeadline);
    const [selectedSort, setSelectedSort] =
        useState<ServiceOrderSortValue>(initialSort);
    const [searchTerm, setSearchTerm] = useState('');

    const buildUrl = useCallback(() => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedPriority !== "all") params.set("priority", selectedPriority);
      if (selectedDeadline !== "all") params.set("deadline", selectedDeadline);
      if (selectedSort !== "created_desc") params.set("sort", selectedSort);
      return `/api/service-orders?${params.toString()}`;
    }, [page, limit, searchTerm, selectedStatus, selectedPriority, selectedDeadline, selectedSort]);

    const loadServiceOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            const response = await fetch(buildUrl());
            const result = (await response.json()) as ServiceOrdersApiResponse;

            if (!response.ok) {
                throw new Error(result.error ?? 'Erro ao carregar ordens de serviço.');
            }

            setOrders(result.serviceOrders);
            setTotal(result.total);
            setPage(result.page);
            setTotalPages(result.totalPages);
        } catch {
            setErrorMessage('Não foi possível carregar as ordens de serviço.');
        } finally {
            setIsLoading(false);
        }
    }, [buildUrl]);

    useEffect(() => {
        let ignore = false;

        async function loadInitial() {
            try {
                setIsLoading(true);

                const response = await fetch(buildUrl());
                const result = (await response.json()) as ServiceOrdersApiResponse;

                if (!response.ok) {
                    throw new Error(result.error ?? 'Erro ao carregar ordens de serviço.');
                }

                if (ignore) return;

                setOrders(result.serviceOrders);
                setTotal(result.total);
                setPage(result.page);
                setTotalPages(result.totalPages);
                setErrorMessage('');
            } catch {
                if (!ignore) {
                    setErrorMessage('Não foi possível carregar as ordens de serviço.');
                }
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        void loadInitial();
        return () => { ignore = true; };
    }, [buildUrl]);

    function handleSearchChange(value: string) {
        setSearchTerm(value);
        setPage(1);
    }

    function handleStatusChange(value: string) {
        setSelectedStatus(value as ServiceOrderStatusFilterValue);
        setPage(1);
    }

    function handlePriorityChange(value: string) {
        setSelectedPriority(value as ServiceOrderPriorityFilterValue);
        setPage(1);
    }

    function handleDeadlineChange(value: string) {
        setSelectedDeadline(value as ServiceOrderDeadlineFilterValue);
        setPage(1);
    }

    function handleSortChange(value: string) {
        setSelectedSort(value as ServiceOrderSortValue);
        setPage(1);
    }

    async function handleFormCreated() {
        setIsFormModalOpen(false);
        await loadServiceOrders();
    }

    return (
        <div className="space-y-6">
            <Toolbar
                searchPlaceholder="Buscar ordens..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filters={[
                    {
                        label: "Status",
                        value: selectedStatus,
                        onChange: handleStatusChange,
                        options: [
                            { value: "all", label: "Todos os status" },
                            ...serviceOrderStatusFilterOptions
                                .filter((opt) => opt.value !== "all")
                                .map((opt) => ({ value: opt.value, label: opt.label })),
                        ],
                    },
                    {
                        label: "Prioridade",
                        value: selectedPriority,
                        onChange: handlePriorityChange,
                        options: [
                            { value: "all", label: "Todas as prioridades" },
                            ...serviceOrderPriorityFilterOptions
                                .filter((opt) => opt.value !== "all")
                                .map((opt) => ({ value: opt.value, label: opt.label })),
                        ],
                    },
                    {
                        label: "Prazo",
                        value: selectedDeadline,
                        onChange: handleDeadlineChange,
                        options: serviceOrderDeadlineFilterOptions,
                    },
                    {
                        label: "Ordenar",
                        value: selectedSort,
                        onChange: handleSortChange,
                        options: serviceOrderSortOptions,
                    },
                ]}
            />

            <ServiceOrderList
                orders={orders}
                totalOrders={total}
                searchTerm={searchTerm}
                hasActiveFilters={
                    searchTerm.trim().length > 0
                    || selectedStatus !== 'all'
                    || selectedPriority !== 'all'
                    || selectedDeadline !== 'all'
                }
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={loadServiceOrders}
                page={page}
                totalPages={totalPages}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                onCreateOrder={() => setIsFormModalOpen(true)}
            />

            {/* Modal de criação */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title="Nova Ordem de Serviço"
            >
                <ServiceOrderForm onCreated={handleFormCreated} />
            </Modal>
        </div>
    );
}
