// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDateOnlyInTimeZone } from '@/features/service-orders/service-order-deadline';
import { DashboardOverview } from '../dashboard-overview';

vi.mock('recharts', () => ({
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

const summary = {
    totalEquipments: 8,
    totalServiceOrders: 12,
    openServiceOrders: 4,
    inProgressServiceOrders: 3,
    closedServiceOrders: 5,
    lowPriorityServiceOrders: 2,
    mediumPriorityServiceOrders: 4,
    highPriorityServiceOrders: 3,
    criticalPriorityServiceOrders: 3,
    overdueServiceOrders: 2,
    dueTodayServiceOrders: 1,
    dueNextSevenDaysServiceOrders: 3,
    completionRate: 42,
    recentOrders: [],
    recentEquipments: [],
    urgentOrders: [
        {
            id: 'order-1',
            title: 'Revisar compressor',
            status: 'open',
            priority: 'critical',
            due_date: getDateOnlyInTimeZone(),
            equipment: { name: 'Compressor principal' },
        },
    ],
    ordersByMonth: [
        { month: 'Fev', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Abr', count: 0 },
        { month: 'Mai', count: 0 },
        { month: 'Jun', count: 0 },
        { month: 'Jul', count: 0 },
    ],
};

describe('DashboardOverview', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => summary,
            }),
        );
    });

    it('exibe indicadores de prazo e atalhos para as ordens filtradas', async () => {
        render(<DashboardOverview />);

        await waitFor(() => {
            expect(screen.getByText('Prazos das ordens')).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: /Atrasadas/ })).toHaveAttribute(
            'href',
            '/ordens?deadline=overdue',
        );
        expect(screen.getByRole('link', { name: /Vencem hoje/ })).toHaveAttribute(
            'href',
            '/ordens?deadline=today',
        );
        expect(screen.getByRole('link', { name: /Próximos 7 dias/ })).toHaveAttribute(
            'href',
            '/ordens?deadline=next_7_days',
        );
        expect(screen.getByRole('link', { name: /Revisar compressor/ })).toHaveAttribute(
            'href',
            '/ordens/order-1',
        );
        expect(screen.getByText('Vence hoje')).toBeInTheDocument();
        expect(screen.getByText('Compressor principal · Crítica')).toBeInTheDocument();
    });
    it('exibe botao de tentar novamente em caso de erro e recarrega dados', async () => {
        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error('Network error 1'))
            .mockRejectedValueOnce(new Error('Network error 2'))
            .mockRejectedValueOnce(new Error('Network error 3'))
            .mockResolvedValue({
                ok: true,
                json: async () => summary,
            });
        vi.stubGlobal('fetch', fetchMock);

        render(<DashboardOverview />);

        await waitFor(() => {
            expect(screen.getByText('Não foi possível carregar os indicadores.')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument();
        }, { timeout: 4000 });

        const retryButton = screen.getByRole('button', { name: /Tentar novamente/i });
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(screen.getByText('Prazos das ordens')).toBeInTheDocument();
        });
    });
});