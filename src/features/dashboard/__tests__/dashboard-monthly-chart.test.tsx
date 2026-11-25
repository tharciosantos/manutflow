// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DashboardMonthlyChart from '../dashboard-monthly-chart';

// AUD-08: o componente foi extraído para virar chunk sob demanda. O teste
// garante que ele consome `data` e os eixos esperados, que é o contrato com
// o `DashboardOverview` — o Recharts real não é necessário (nem barato) aqui.
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => (
        <div data-testid="bar-chart" data-points={data.length}>{children}</div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid="bar" data-key={dataKey} />,
    XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => null,
    Tooltip: () => null,
}));

const data = [
    { month: 'jun', count: 3 },
    { month: 'jul', count: 0 },
    { month: 'ago', count: 5 },
];

describe('DashboardMonthlyChart', () => {
    it('entrega os pontos ao gráfico', () => {
        const { getByTestId } = render(<DashboardMonthlyChart data={data} />);

        expect(getByTestId('bar-chart')).toHaveAttribute('data-points', '3');
    });

    it('usa month no eixo X e count na série', () => {
        const { getByTestId } = render(<DashboardMonthlyChart data={data} />);

        expect(getByTestId('x-axis')).toHaveAttribute('data-key', 'month');
        expect(getByTestId('bar')).toHaveAttribute('data-key', 'count');
    });

    it('renderiza sem dados sem quebrar', () => {
        const { getByTestId } = render(<DashboardMonthlyChart data={[]} />);

        expect(getByTestId('bar-chart')).toHaveAttribute('data-points', '0');
    });
});
