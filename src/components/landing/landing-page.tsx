import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHeader } from "./landing-header";
import { DemoMaintenanceFlow } from "./demo-maintenance-flow";
import { FeatureCard } from "./feature-card";

/**
 * AUD-07: a landing era renderizada dentro de um `page.tsx` client component,
 * que devolvia "Carregando..." durante o `getUser()` do browser. O HTML inicial
 * entregue ao visitante (e ao crawler) era um spinner, apesar de a página ser
 * totalmente estática. Extraída para cá, ela é renderizada no servidor e chega
 * completa no primeiro byte.
 *
 * O `DemoMaintenanceFlow` continua sendo client: tem estado próprio para o
 * simulador e é o único pedaço da landing que precisa de JS.
 */
export function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 selection:text-teal-800 dark:bg-slate-950 dark:text-slate-100 dark:selection:text-teal-300 transition-colors">
            <LandingHeader />

            <main className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 md:py-12 max-w-5xl mx-auto w-full space-y-10">
                <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                        <span className="inline-block font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                            Gestão de Manutenção Industrial
                        </span>

                        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            Controle total de ativos, ordens e prazos em tempo real.
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                            Monitore a disponibilidade dos equipamentos da fábrica, faça a triagem
                            de ordens preventivas e corretivas e acompanhe o histórico de auditoria.
                        </p>

                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95 text-center shadow-xs"
                            >
                                <span>Criar Conta</span>
                                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:text-slate-950 hover:bg-slate-50 active:scale-95 text-center shadow-xs dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white dark:hover:bg-slate-900"
                            >
                                <span>Acessar Demonstração (1-Clique)</span>
                            </Link>
                        </div>
                    </div>

                    <div className="w-full">
                        <DemoMaintenanceFlow />
                    </div>
                </section>

                <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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

            <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>ManutFlow © {new Date().getFullYear()} — Plataforma de Manutenção Industrial</span>
                    <span className="text-slate-600 dark:text-slate-400">Desenvolvido por Tharcio Santos</span>
                </div>
            </footer>
        </div>
    );
}
