"use client";

import { useEffect, useState } from "react";

import type { Equipment, EquipmentStatus } from "@/types/equipment";

const equipmentStatusLabel: Record<EquipmentStatus, string> = {
    active: "Ativo",
    inactive: "Inativo",
    maintenance: "Em manutenção",
};

type EquipmentsApiResponse = {
    equipments: Equipment[];
    error?: string;
};

type EquipmentListProps = {
    refreshkey?: number;
};
export function EquipmentList({ refreshkey = 0 }: EquipmentListProps) {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadEquipments() {
            try {
                const response = await fetch("/api/equipments");
                const result = (await response.json()) as EquipmentsApiResponse;

                if (!response.ok) {
                    throw new Error(result.error ?? "Erro ao carregar equipamentos.");
                }

                setEquipments(result.equipments);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao carregar equipamentos.";

                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        }

        void loadEquipments();
    }, [refreshkey]);

    if (isLoading) {
        return (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Carregando Equipamentos...
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-6 text-red-200">
                <h2 className="font-semibold">Erro ao carregar equipamentos</h2>
                <p className="mt-2 text-sm">{errorMessage}</p>
            </div>
        );
    }

    if (equipments.length === 0) {
        return (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
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
                            <td className="px-4 py-3 text-slate-100">{equipment.patrimony_code}</td>
                            <td className="px-4 py-3 text-slate-100">{equipment.location}</td>
                            <td className="px-4 py-3 text-slate-100">{equipment.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}