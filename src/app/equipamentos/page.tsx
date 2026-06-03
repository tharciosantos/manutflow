import { AppShell } from "@/components/layout/app-shell";
import { EquipmentPageContent } from "@/features/equipments/equipment-page-content";

export const dynamic = "force-dynamic";

export default function EquipamentosPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Equipamentos</h1>

        <p className="mt-2 text-slate-400">
          Cadastre e acompanhe os equipamentos da empresa.
        </p>

        <EquipmentPageContent />
      </section>
    </AppShell>
  );
}