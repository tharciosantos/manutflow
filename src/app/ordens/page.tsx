'use client';

import { Suspense, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceOrderPageContent } from '@/features/service-orders/service-order-page-content';
import { Plus } from 'lucide-react';

export default function OrdensPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Ordens de Serviço</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Controle de status, prazos de execução e auditoria de manutenções.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Nova Ordem
          </button>
        </div>
        <Suspense
          fallback={(
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 font-mono dark:text-slate-400">Carregando ordens de serviço...</p>
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
