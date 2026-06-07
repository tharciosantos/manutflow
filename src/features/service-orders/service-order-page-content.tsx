'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ServiceOrder } from '@/types/service-order';
import { ServiceOrderForm } from './service-order-form';
import { ServiceOrderList } from './service-order-list';

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

    return (
        <div className="space-y-6">
            <ServiceOrderForm onCreated={loadServiceOrders} />

            <ServiceOrderList
                orders={orders}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={loadServiceOrders}
            />
        </div>
    );
}