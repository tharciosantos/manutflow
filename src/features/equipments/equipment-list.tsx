import { supabase } from "@/lib/supabase/client";
import type { Equipment, EquipmentStatus } from "@/types/equipment";

const equipmentStatusLabel: Record<EquipmentStatus, string> = {
    active: "Ativo",
    inactive: "Inativo",
    maintenance: "Em manutenção",
};

export async function EquipmentList() {
    const { data, error } = await supabase
        .from("equipments")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 text-red-200">
                <h2 className="font-semibold">Erro ao carregar equipamentos</h2>
                <p className="mt-2 text-sm">{error.message}</p>
            </div>
        );
    }

    const equipments = data as Equipment[];

    if (equipments.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Nenhum equipamento cadastrado ainda.
            </div>
        );
    }

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-900 text-slate-300">
                    <tr>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="px-4 py-3 font-medium">Patrimônio</th>
                        <th className="px-4 py-3 font-medium">Localização</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 bg-slate-950">
                    {equipments.map((equipment) => (
                        <tr key={equipment.id}>
                            <td className="px-4 py-3 text-slate-100">{equipment.name}</td>
                            <td className="px-4 py-3 text-slate-300">
                                {equipment.patrimony_code}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                                {equipment.location}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                                {equipmentStatusLabel[equipment.status]}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}