// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceOrderPageContent } from '../service-order-page-content';

vi.mock('../service-order-form', () => ({
    ServiceOrderForm: () => null,
}));

vi.mock('../service-order-list', () => ({
    ServiceOrderList: () => null,
}));

vi.mock('@/components/ui/modal', () => ({
    Modal: () => null,
}));

const emptyResponse = {
    serviceOrders: [],
    total: 0,
    page: 1,
    totalPages: 1,
};

describe('ServiceOrderPageContent', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => emptyResponse,
            }),
        );
    });

    it('combina busca, status, prioridade e prazo na requisição', async () => {
        render(
            <ServiceOrderPageContent
                isFormModalOpen={false}
                setIsFormModalOpen={vi.fn()}
            />,
        );

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        fireEvent.change(screen.getByPlaceholderText('Buscar ordens...'), {
            target: { value: 'compressor' },
        });
        fireEvent.change(screen.getByLabelText('Status'), {
            target: { value: 'in_progress' },
        });
        fireEvent.change(screen.getByLabelText('Prioridade'), {
            target: { value: 'critical' },
        });
        fireEvent.change(screen.getByLabelText('Prazo'), {
            target: { value: 'overdue' },
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenLastCalledWith(
                '/api/service-orders?page=1&limit=10&q=compressor&status=in_progress&priority=critical&deadline=overdue',
            );
        });
    });
});
