import { AppShell } from "@/components/layout/app-shell";
import { EquipmentPageContent } from "@/features/equipments/equipment-page-content";

export const dynamic = "force-dynamic";

export default function EquipamentosPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Equipamentos</h1>
            <p className="mt-1 text-slate-400">
              Cadastre e acompanhe os equipamentos da empresa.
            </p>
          </div>
          <a
            href="#equipment-form"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo Equipamento
          </a>
        </div>

        <EquipmentPageContent />
      </section>
    </AppShell>
  );
}