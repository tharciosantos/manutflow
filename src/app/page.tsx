"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { LandingHeader } from "@/components/landing/landing-header";
import { DemoMaintenanceFlow } from "@/components/landing/demo-maintenance-flow";
import { FeatureCard } from "@/components/landing/feature-card";
import Link from "next/link";
import { 
    Plus, 
    Cpu, 
    ClipboardPlus, 
    Sparkles, 
    CalendarClock, 
    ShieldCheck, 
    ArrowRight,
    Zap,
    Loader2
} from "lucide-react";

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
                    <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                    <p className="text-xs sm:text-sm font-medium tracking-wide">Carregando ManutFlow...</p>
                </div>
            </div>
        );
    }

    // 2. Usuário Autenticado → Painel de Gestão (Dashboard)
    if (user) {
        return (
            <AppShell>
                <section className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-10">
                    {/* Saudação com Badge */}
                    <div className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-0.5 text-xs font-semibold text-teal-400 mb-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Painel de Controle</span>
                            </div>
                            <h1 className="text-2xl font-bold sm:text-3xl text-slate-100 tracking-tight">
                                Olá, {user.name ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">{user.name}</span> : "Gestor"} 👋
                            </h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Acompanhe os indicadores operacionais, ativos industriais e ordens de serviço.
                            </p>
                        </div>
                    </div>

                    {/* Ações rápidas */}
                    <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fade-in-delay-1">
                        <Link
                            href="/equipamentos"
                            className="group flex items-center justify-between rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-4 transition-all duration-300 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-400 group-hover:scale-105 transition-transform">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                                        Novo Equipamento
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Cadastre uma máquina ou ativo
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                            </div>
                        </Link>

                        <Link
                            href="/ordens"
                            className="group flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-4 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 group-hover:scale-105 transition-transform">
                                    <ClipboardPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                                        Nova Ordem de Serviço
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Abra um chamado de manutenção
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                            </div>
                        </Link>
                    </div>

                    <div className="animate-fade-in-delay-2">
                        <DashboardOverview />
                    </div>
                </section>
            </AppShell>
        );
    }

    // 3. Visitante Não Autenticado → Landing Page Institucional & Demonstração
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
            {/* Header da Landing */}
            <LandingHeader />

            {/* Conteúdo Principal */}
            <main className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 md:py-12 max-w-5xl mx-auto w-full space-y-12">
                {/* Hero Section + Simulador */}
                <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300 shadow-sm">
                            <Zap className="h-3.5 w-3.5 fill-teal-400 text-teal-400" />
                            <span>ManutFlow · Indústria 4.0 & Gestão de Manutenção</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
                            Gestão de ativos e ordens com{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                                controle total de prazos.
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                            Controle preventivo e corretivo de equipamentos com acompanhamento de SLAs, 
                            triagem por criticidade e auditoria de status em tempo real.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-emerald-400 active:scale-95 text-center"
                            >
                                <span>Criar Conta de Demonstração</span>
                                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-teal-400 hover:text-teal-300 hover:bg-slate-900 active:scale-95 text-center"
                            >
                                <Sparkles className="h-4 w-4 text-teal-400" />
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
                <section className="space-y-4">
                    <div className="text-center sm:text-left">
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                            Recursos Essenciais
                        </p>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
                            Tudo o que sua equipe precisa para eliminar paradas não planejadas
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <FeatureCard
                            icon={<Cpu className="h-5 w-5" />}
                            tag="Ativos"
                            title="Gestão de Ativos & Patrimônio"
                            description="Cadastro detalhado de máquinas com tags de patrimônio, fotos, localização física na fábrica e status operacional."
                        />

                        <FeatureCard
                            icon={<CalendarClock className="h-5 w-5" />}
                            tag="SLAs"
                            title="Controle de Prazos & Criticidade"
                            description="Triagem inteligente com filtros dedicados para ordens atrasadas, com vencimento hoje e planejamento para os próximos 7 dias."
                        />

                        <FeatureCard
                            icon={<ShieldCheck className="h-5 w-5" />}
                            tag="Auditoria"
                            title="Histórico & Rastreabilidade"
                            description="Registro de auditoria a cada transição de status de manutenção com notas técnicas, assegurando conformidade de ponta a ponta."
                        />
                    </div>
                </section>
            </main>

            {/* Footer Minimalista */}
            <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500 transition-colors">
                <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>ManutFlow © {new Date().getFullYear()} — Plataforma de Gestão de Manutenção Industrial</span>
                    <span className="text-slate-400">Desenvolvido por Tharcio Santos</span>
                </div>
            </footer>
        </div>
    );
}