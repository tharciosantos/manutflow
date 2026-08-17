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
        <div className={`rounded-xl border p-3 sm:p-3.5 transition-colors hover:border-slate-700 ${cardClassName}`}>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
                {trend && (
                    <span className={`text-[10px] font-mono font-medium ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {trend}
                    </span>
                )}
            </div>

            <strong className={`mt-1 block font-mono text-xl sm:text-2xl font-bold tabular-nums ${valueClassName}`}>
                {value}
            </strong>

            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{description}</p>
        </div>
    );
}