"use client";

import { useState } from "react";
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
    type EquipmentStatusFilterValue,
} from "@/features/equipments/equipment-status-config";
import type { Equipment } from "@/types/equipment";

type EquipmentListProps = {
    equipments: Equipment[];
    totalEquipments: number;
    searchTerm: string;
    selectedStatus: EquipmentStatusFilterValue;
    isLoading: boolean;
    errorMessage: string;
    onRefresh: () => Promise<void>;
};

export function EquipmentList({
    equipments,
    totalEquipments,
    searchTerm,
    selectedStatus,
    isLoading,
    errorMessage,
    onRefresh,
}: EquipmentListProps) {

    const [deletingEquipmentId, setDeletingEquipmentId] = useState("");

    async function handleDelete(equipmentId: string) {
        const confirmed = window.confirm(
            "Tem certeza que deseja excluir este equipamento?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingEquipmentId(equipmentId);

            const response = await fetch(`/api/equipments/${equipmentId}`, {
                method: "DELETE",
            });

            const result = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(result.error ?? "Erro ao excluir equipamento.");
            }

            await onRefresh();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o equipamento.";

            window.alert(message);
        } finally {
            setDeletingEquipmentId("");
        }
    }

    if (isLoading) {
        return (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <p className="text-sm text-slate-400">
                    Carregando equipamentos...
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <h2 className="text-sm font-semibold text-red-300">
                    Erro ao carregar equipamentos
                </h2>

                <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
            </div>
        );
    }

    if (equipments.length === 0) {
        const hasEquipments = totalEquipments > 0;
        const hasSearch = searchTerm.trim().length > 0;
        const hasStatusFilter = selectedStatus !== "all";

        return (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
                <p className="text-sm font-medium text-slate-300">
                    {hasEquipments
                        ? "Nenhum equipamento encontrado para os filtros atuais."
                        : "Nenhum equipamento cadastrado ainda."}
                </p>

                {hasEquipments && hasSearch && (
                    <p className="mt-2 text-sm text-slate-500">
                        Busca ativa: {searchTerm.trim()}
                    </p>
                )}

                {hasEquipments && hasStatusFilter && (
                    <p className="mt-2 text-sm text-slate-500">
                        Filtro ativo: {equipmentStatusLabels[selectedStatus]}
                    </p>
                )}

                {hasEquipments && (
                    <p className="mt-2 text-xs text-slate-500">
                        Tente buscar por outro nome, patrimônio, localização ou status.
                    </p>
                )}
            </div>
        );
    }

    return (
        <section className="mt-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Equipamentos cadastrados
                    </h2>

                    <p className="text-sm text-slate-400">
                        Acompanhe os ativos registrados para manutenção.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    {equipments.length}{" "}
                    {equipments.length === 1 ? "equipamento encontrado" : "equipamentos encontrados"}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {equipments.map((equipment) => (
                    <article
                        key={equipment.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm transition hover:border-slate-700"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    {equipment.name}
                                </h3>

                                <div className="mt-3 grid gap-1 text-sm">
                                    <p>
                                        <span className="text-slate-500">Patrimônio:</span>{' '}
                                        <span className="text-slate-300">
                                            {equipment.patrimony_code}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="text-slate-500">Localização:</span>{' '}
                                        <span className="text-slate-300">
                                            {equipment.location}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:justify-end">
                                <span
                                    className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${equipmentStatusStyles[equipment.status]}`}
                                >
                                    {equipmentStatusLabels[equipment.status]}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(equipment.id)}
                                    disabled={deletingEquipmentId === equipment.id}
                                    className="w-fit rounded-full border border-red-500/30 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletingEquipmentId === equipment.id ? "Excluindo..." : "Excluir"}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}