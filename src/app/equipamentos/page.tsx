"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EquipmentPageContent } from "@/features/equipments/equipment-page-content";
import { Plus } from "lucide-react";

export default function EquipamentosPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Equipamentos</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
              Controle de patrimônio, localização física e histórico de manutenção.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-400 active:scale-95 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Novo Equipamento
          </button>
        </div>
        <EquipmentPageContent
          isFormModalOpen={isFormModalOpen}
          setIsFormModalOpen={setIsFormModalOpen}
        />
      </section>
    </AppShell>
  );
}