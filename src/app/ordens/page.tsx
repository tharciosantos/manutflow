'use client';

import { Suspense, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceOrderPageContent } from '@/features/service-orders/service-order-page-content';
import { Plus, ClipboardList } from 'lucide-react';

export default function OrdensPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-2">
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Manutenção & Chamados</span>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl text-slate-100 tracking-tight">Ordens de Serviço</h1>
            <p className="mt-1 text-sm text-slate-400">
              Crie, liste, altere status e acompanhe os prazos de execução das ordens.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Nova Ordem de Serviço
          </button>
        </div>
        <Suspense
          fallback={(
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 animate-pulse">
              <p className="text-sm text-slate-400">Carregando ordens de serviço...</p>
            </div>
          )}
        >
          <ServiceOrderPageContent
            isFormModalOpen={isFormModalOpen}
            setIsFormModalOpen={setIsFormModalOpen}
          />
        </Suspense>
      </section>
    </AppShell>
  );
}
