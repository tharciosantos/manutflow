"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { LandingHeader } from "@/components/landing/landing-header";
import { DemoMaintenanceFlow } from "@/components/landing/demo-maintenance-flow";
import { FeatureCard } from "@/components/landing/feature-card";
import Link from "next/link";
import { Plus, ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
    const [user, setUser] = useState<{ id: string; name: string | null } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const { data: { user } } = await createClient().auth.getUser();
                if (user) {
                    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
                    setUser({ id: user.id, name });
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        void checkAuth();
    }, []);

    // 1. Estado de carregamento inicial
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
                    <p className="text-xs font-medium tracking-wide">Carregando...</p>
                </div>
            </div>
        );
    }

    // 2. Usuário Autenticado → Painel de Gestão (Dashboard)
    if (user) {
        return (
            <AppShell>
                <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 space-y-4">
                    {/* Header do Painel */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                                Olá, {user.name ?? "Gestor"}
                            </h1>
                            <p className="text-xs text-slate-400">
                                Indicadores operacionais e ordens de manutenção em aberto.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/equipamentos"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Equipamento</span>
                            </Link>

                            <Link
                                href="/ordens"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-teal-400"
                            >
                                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Nova Ordem</span>
                            </Link>
                        </div>
                    </div>

                    {/* Visão Geral */}
                    <DashboardOverview />
                </section>
            </AppShell>
        );
    }

    // 3. Visitante Não Autenticado → Landing Page Institucional & Demonstração
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/20 selection:text-teal-300">
            {/* Header da Landing */}
            <LandingHeader />

            {/* Conteúdo Principal */}
            <main className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 md:py-12 max-w-5xl mx-auto w-full space-y-10">
                {/* Hero Section + Simulador */}
                <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                        <span className="inline-block font-mono text-xs font-semibold text-teal-400">
                            Gestão de Manutenção Industrial
                        </span>

                        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight text-white">
                            Controle total de ativos, ordens e prazos em tempo real.
                        </h1>

                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                            Monitore a disponibilidade dos equipamentos da fábrica, faça a triagem 
                            de ordens preventivas e corretivas e acompanhe o histórico de auditoria.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95 text-center"
                            >
                                <span>Criar Conta</span>
                                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white hover:bg-slate-900 active:scale-95 text-center"
                            >
                                <span>Acessar Demonstração (1-Clique)</span>
                            </Link>
                        </div>
                    </div>

                    {/* Simulador Interativo */}
                    <div className="w-full">
                        <DemoMaintenanceFlow />
                    </div>
                </section>

                {/* 3 Feature Cards */}
                <section className="space-y-3 pt-4 border-t border-slate-800">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Capacidades da Plataforma
                    </h2>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <FeatureCard
                            tag="Ativos"
                            title="Cadastro & Patrimônio"
                            description="Registro de máquinas, tags de patrimônio, fotos, localização na planta e status operacional."
                        />

                        <FeatureCard
                            tag="SLAs"
                            title="Controle de Prazos"
                            description="Filtros dedicados para ordens atrasadas, vencendo no dia e planejamento da semana."
                        />

                        <FeatureCard
                            tag="Auditoria"
                            title="Rastreabilidade"
                            description="Histórico completo de transições de status com notas técnicas e registro de responsáveis."
                        />
                    </div>
                </section>
            </main>

            {/* Footer Minimalista */}
            <footer className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500">
                <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>ManutFlow © {new Date().getFullYear()} — Plataforma de Manutenção Industrial</span>
                    <span className="text-slate-400">Desenvolvido por Tharcio Santos</span>
                </div>
            </footer>
        </div>
    );
}