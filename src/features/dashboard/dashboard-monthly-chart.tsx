'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/**
 * AUD-08: o Recharts (~100 kB) vive só aqui, carregado por `next/dynamic` no
 * `DashboardOverview`. Assim ele não entra no bundle da landing: o visitante
 * deslogado, que é a maioria do tráfego, nunca baixa a biblioteca de gráficos.
 */

type MonthlyData = {
    month: string;
    count: number;
};

type DashboardMonthlyChartProps = {
    data: MonthlyData[];
};

export default function DashboardMonthlyChart({ data }: DashboardMonthlyChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#f8fafc',
                    }}
                    formatter={(value) => [`${value ?? 0} ordens`, 'Total']}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
        </ResponsiveContainer>
    );
}
