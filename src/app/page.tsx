"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import Link from "next/link";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await createClient().auth.getUser();
      if (user) {
        // Tenta pegar o nome completo do user_metadata, senão usa a parte local do email
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
        setUserName(name);
      }
    }
    getUser();
  }, []);

  return (
    <AppShell>
      <section className="mx-auto flex max-w-5xl flex-col px-4 py-12 sm:px-6 sm:py-16">
        {/* Saudação */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-2xl font-semibold text-slate-100">
            Olá, {userName ? <span className="text-teal-400">{userName}</span> : "visitante"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Bem-vindo ao ManutFlow. Aqui está o resumo do seu sistema.
          </p>
        </div>

        {/* Ações rápidas */}
        <div className="mb-14 grid grid-cols-2 gap-3 animate-fade-in-delay-1">
          <Link
            href="/equipamentos#equipment-form"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-medium text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50 active:scale-95 sm:hover:scale-105"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="truncate">Novo Equip.</span>
            <span className="hidden sm:inline">Novo Equipamento</span>
          </Link>

          <Link
            href="/ordens#service-order-form"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 active:scale-95 sm:hover:scale-105"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="truncate">Nova Ordem</span>
          </Link>
        </div>

        <div className="animate-fade-in-delay-2">
          <DashboardOverview />
        </div>
      </section>
    </AppShell>
  );
}