"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import Link from "next/link";
import { Plus, Cpu, ClipboardPlus, Sparkles } from "lucide-react";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await createClient().auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
        setUserName(name);
      }
    }
    getUser();
  }, []);

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
              Olá, {userName ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">{userName}</span> : "visitante"} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Acompanhe os indicadores, ativos industriais e ordens de serviço.
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