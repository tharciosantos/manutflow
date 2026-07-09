'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceOrderPageContent } from '@/features/service-orders/service-order-page-content';

export default function OrdensPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Ordens de Serviço</h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">
              Crie, liste e acompanhe as ordens de manutenção.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Ordem de Serviço
          </button>
        </div>
        <ServiceOrderPageContent
          isFormModalOpen={isFormModalOpen}
          setIsFormModalOpen={setIsFormModalOpen}
        />
      </section>
    </AppShell>
  );
}