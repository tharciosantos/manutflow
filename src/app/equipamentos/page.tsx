import { AppShell } from "@/components/layout/app-shell";
import { EquipmentPageContent } from "@/features/equipments/equipment-page-content";

export const dynamic = "force-dynamic";

export default function EquipamentosPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Equipamentos</h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">
              Cadastre e acompanhe os equipamentos da empresa.
            </p>
          </div>
          <a
            href="#equipment-form"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 sm:px-5"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Novo Equipamento</span>
          </a>
        </div>

        <EquipmentPageContent />
      </section>
    </AppShell>
  );
}