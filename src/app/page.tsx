"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import Link from "next/link";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await createClient().auth.getUser();
      if (user?.email) {
        setUserEmail(user.email.split("@")[0]);
      }
    }
    getUser();
  }, []);

  return (
    <AppShell>
      <section className="mx-auto flex max-w-5xl flex-col px-6 py-12">
        {/* Saudação */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold text-slate-100">
            Olá, {userEmail ? <span className="text-teal-400">{userEmail}</span> : "visitante"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Bem-vindo ao ManutFlow. Aqui está o resumo do seu sistema.
          </p>
        </div>

        {/* Ações rápidas */}
        <div className="mb-10 flex flex-wrap gap-3 animate-fade-in-delay-1">
          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-5 py-3 text-sm font-medium text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Equipamento
          </Link>

          <Link
            href="/ordens"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Ordem
          </Link>

          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ver Equipamentos
          </Link>
        </div>

        <div className="animate-fade-in-delay-2">
          <DashboardOverview />
        </div>
      </section>
    </AppShell>
  );
}