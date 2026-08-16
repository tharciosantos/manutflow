"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EquipmentPageContent } from "@/features/equipments/equipment-page-content";
import { Plus, Cpu } from "lucide-react";

export default function EquipamentosPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-0.5 text-xs font-semibold text-teal-400 mb-2">
              <Cpu className="h-3.5 w-3.5" />
              <span>Ativos Industriais</span>
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl text-slate-100 tracking-tight">Equipamentos</h1>
            <p className="mt-1 text-sm text-slate-400">
              Cadastre, rastreie e acompanhe o histórico de manutenção dos ativos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/30 transition-all hover:from-teal-500 hover:to-emerald-500 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
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