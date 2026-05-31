import { AppShell } from "@/components/layout/app-shell";
import { EquipmentList } from "@/features/equipments/equipment-list";

export const dynamic = "force-dynamic";

export default function EquipamentosPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Equipamentos</h1>

        <p className="mt-2 text-slate-400">
          Aqui vamos cadastrar e listar os equipamentos da empresa.
        </p>

        <EquipmentList />
      </section>
    </AppShell>
  );
}