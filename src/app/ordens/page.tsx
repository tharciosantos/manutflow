import { AppShell } from '@/components/layout/app-shell';
import { ServiceOrderPageContent } from '@/features/service-orders/service-order-page-content';

export default function OrdensPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
            <p className="mt-1 text-slate-400">
              Crie, liste e acompanhe as ordens de manutenção.
            </p>
          </div>
          <a
            href="#service-order-form"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova Ordem
          </a>
        </div>

        <ServiceOrderPageContent />
      </section>
    </AppShell>
  );
}