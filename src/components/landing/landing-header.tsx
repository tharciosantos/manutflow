"use client";

import Link from "next/link";

export function LandingHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 sm:px-6">
            <div className="mx-auto flex max-w-5xl items-center justify-between">
                {/* Logo Minimalista */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-slate-950 text-xs font-black tracking-tighter">
                            MF
                        </span>
                        <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-teal-400 transition-colors">
                            ManutFlow
                        </span>
                    </Link>

                    <span className="hidden sm:inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[11px] font-mono text-slate-400">
                        Demo
                    </span>
                </div>

                {/* Ações de Autenticação */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 transition hover:text-white hover:bg-slate-900"
                    >
                        Entrar
                    </Link>

                    <Link
                        href="/register"
                        className="rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95 shadow-sm"
                    >
                        Criar Conta
                    </Link>
                </div>
            </div>
        </header>
    );
}

