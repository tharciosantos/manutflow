'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ServiceOrder } from '@/types/service-order';
import { ServiceOrderForm } from './service-order-form';
import { ServiceOrderList } from './service-order-list';
import {
    ServiceOrderStatusFilter,
    type ServiceOrderStatusFilter as ServiceOrderStatusFilterType
} from './service-order-status-filter';
import { ServiceOrderSearch } from './service-order-search';

async function fetchServiceOrders(): Promise<ServiceOrder[]> {
    const response = await fetch('/api/service-orders');

    if (!response.ok) {
        throw new Error('Erro ao carregar ordens de serviço.');
    }

    return response.json();
}

export function ServiceOrderPageContent() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedStatus, setSelectedStatus] =
        useState<ServiceOrderStatusFilterType>('all');

    const [searchTerm, setSearchTerm] = useState('');

    const loadServiceOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            const data = await fetchServiceOrders();

            setOrders(data);
        } catch {
            setErrorMessage('Não foi possível carregar as ordens de serviço.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        async function loadInitialServiceOrders() {
            try {
                const data = await fetchServiceOrders();

                if (ignore) {
                    return;
                }

                setOrders(data);
                setErrorMessage('');
            } catch {
                if (!ignore) {
                    setErrorMessage('Não foi possível carregar as ordens de serviço.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadInitialServiceOrders();

        return () => {
            ignore = true;
        };
    }, []);

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            selectedStatus === 'all' || order.status === selectedStatus;

        const searchableText = [
            order.title,
            order.description,
            order.equipment.name,
            order.equipment.patrimony_code,
            order.equipment.location,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const matchesSearch =
            !normalizedSearchTerm || searchableText.includes(normalizedSearchTerm);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <ServiceOrderForm onCreated={loadServiceOrders} />

            <ServiceOrderSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <ServiceOrderStatusFilter
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            <ServiceOrderList
                orders={filteredOrders}
                totalOrders={orders.length}
                searchTerm={searchTerm}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={loadServiceOrders}
            />
        </div>
    );
}