"use client";

import Link from "next/link";
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
            <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-800" />
                        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-800/70" />
                    </div>
                    <div className="mt-2 h-4 w-36 animate-pulse rounded bg-slate-800/50 sm:mt-0" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800/60" />
                                        <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800/60" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-7 w-24 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-7 w-16 animate-pulse rounded-full bg-slate-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-6 py-16 text-center">
                {/* Ilustração SVG */}
                <svg
                    className="mb-4 h-16 w-16 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                    />
                </svg>

                <p className="text-base font-medium text-slate-300">
                    {hasEquipments
                        ? "Nenhum equipamento encontrado"
                        : "Nenhum equipamento cadastrado"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    {hasEquipments
                        ? "Tente ajustar os filtros ou buscar por outro termo."
                        : "Cadastre seu primeiro equipamento para começar."}
                </p>

                {hasEquipments && hasSearch && (
                    <p className="mt-3 text-xs text-slate-600">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                        {hasStatusFilter && ` | Filtro: ${equipmentStatusLabels[selectedStatus]}`}
                    </p>
                )}

                {hasEquipments && hasStatusFilter && !hasSearch && (
                    <p className="mt-3 text-xs text-slate-600">
                        Filtro ativo: {equipmentStatusLabels[selectedStatus]}
                    </p>
                )}

                {!hasEquipments && (
                    <a
                        href="#equipment-form"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Cadastrar Equipamento
                    </a>
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
                        className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
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
                                <Link
                                    href={`/equipamentos/${equipment.id}`}
                                    className="w-fit rounded-full border border-teal-500/30 px-3 py-1 text-xs font-medium text-teal-300 transition hover:bg-teal-500/10"
                                >
                                    Ver detalhes
                                </Link>
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