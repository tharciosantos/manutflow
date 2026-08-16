"use client";

interface FeatureCardProps {
    title: string;
    description: string;
    tag?: string;
}

export function FeatureCard({ title, description, tag }: FeatureCardProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors hover:border-slate-700">
            {tag && (
                <span className="inline-block font-mono text-[11px] uppercase tracking-wider text-teal-400 mb-2 font-semibold">
                    {tag}
                </span>
            )}

            <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {title}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

