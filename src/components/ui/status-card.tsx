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
    icon,
    trend,
    trendUp,
    cardClassName = 'border-slate-800 bg-slate-900',
    valueClassName = 'text-slate-100',
}: StatusCardProps) {
    return (
        <div className={`group rounded-2xl border p-6 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl ${cardClassName}`}>
            <div className="flex items-start justify-between">
                <p className="text-sm text-slate-400">{title}</p>
                {icon && (
                    <span className="text-slate-600 transition-colors group-hover:text-slate-400">
                        {icon}
                    </span>
                )}
            </div>

            <strong className={`mt-2 block text-3xl font-bold tracking-tight ${valueClassName}`}>
                {value}
            </strong>

            <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-slate-400">{description}</p>
                {trend && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={trendUp ? "M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" : "M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"} />
                        </svg>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}