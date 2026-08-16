"use client";

import Link from "next/link";
import { Wrench, Sparkles, ArrowRight } from "lucide-react";

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 py-3 sm:px-6 md:px-8">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
                {/* Logo & Badge */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                            <Wrench className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white group-hover:text-teal-300 transition-colors">
                            Manut<span className="text-teal-400">Flow</span>
                        </span>
                    </Link>

                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300">
                        <Sparkles className="h-3 w-3" />
                        <span>Demonstração Aberta</span>
                    </span>
                </div>

                {/* Ações de Autenticação */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <Link
                        href="/login"
                        className="rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 transition hover:text-teal-300 hover:bg-slate-900"
                    >
                        Entrar
                    </Link>

                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-sm shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-400 active:scale-95"
                    >
                        <span>Criar Conta</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] hidden sm:inline-block" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
