import type { ReactNode } from "react";

type StatusCardProps = {
    title: string;
    value: string;
    description: string;
    icon?: ReactNode;
    trend?: string;
    trendUp?: boolean;
    cardClassName?: string;
    valueClassName?: string;
};

export function StatusCard({
    title,
    value,
    description,
    trend,
    trendUp,
    cardClassName = 'border-slate-800 bg-slate-900/60',
    valueClassName = 'text-slate-100',
}: StatusCardProps) {
    return (
        <div className={`rounded-xl border p-4 sm:p-5 transition-colors hover:border-slate-700 ${cardClassName}`}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
                {trend && (
                    <span className={`text-xs font-mono font-medium ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {trend}
                    </span>
                )}
            </div>

            <strong className={`mt-2 block font-mono text-2xl sm:text-3xl font-extrabold tabular-nums ${valueClassName}`}>
                {value}
            </strong>

            <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
    );
}