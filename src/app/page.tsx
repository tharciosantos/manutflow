import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { LandingPage } from "@/components/landing/landing-page";

/**
 * AUD-07: a home decide a sessão no servidor. Antes, um `"use client"` devolvia
 * "Carregando..." até o `getUser()` terminar no browser — o HTML inicial de uma
 * página pública era um spinner, para visitante e crawler.
 *
 * `getUser()` aqui repete a validação do `proxy.ts` de propósito: o proxy só
 * decide redirecionamento, e a página precisa do usuário para escolher entre
 * landing e dashboard. Como a rota é pública, não há 401 possível — usuário
 * ausente significa "visitante".
 */
export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Visitante → landing estática, renderizada inteira no servidor.
    if (!user) {
        return <LandingPage />;
    }

    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;

    return (
        <AppShell>
            <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800/80">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                            Olá, {name ?? "Gestor"}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Indicadores operacionais e ordens de manutenção em aberto.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/equipamentos"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Equipamento</span>
                        </Link>

                        <Link
                            href="/ordens"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-teal-400 shadow-xs"
                        >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Nova Ordem</span>
                        </Link>
                    </div>
                </div>

                <DashboardOverview />
            </section>
        </AppShell>
    );
}
