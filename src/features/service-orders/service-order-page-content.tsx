'use client';

import { useEffect, useState } from 'react';
import type { ServiceOrder } from '@/types/service-order';
import { ServiceOrderList } from './service-order-list';

export function ServiceOrderPageContent() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadServiceOrders() {
        try {
            setIsLoading(true);
            setErrorMessage('');

            const response = await fetch('/api/service-orders');

            if (!response.ok) {
                throw new Error('Erro ao carregar ordens de serviço.');
            }

            const data = await response.json();

            setOrders(data);
        } catch {
            setErrorMessage('Não foi possível carregar as ordens de serviço.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadServiceOrders();
    }, []);

    return (
        <div className="space-y-6">
            <ServiceOrderList
                orders={orders}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
        </div>
    );
}