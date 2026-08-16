"use client";

import type { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    tag?: string;
}

export function FeatureCard({ icon, title, description, tag }: FeatureCardProps) {
    return (
        <div className="group relative rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
                    {icon}
                </div>
                {tag && (
                    <span className="rounded-full border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {tag}
                    </span>
                )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                {title}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
