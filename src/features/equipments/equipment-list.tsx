"use client";

import Link from "next/link";
import { useState } from "react";
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
    type EquipmentStatusFilterValue,
} from "@/features/equipments/equipment-status-config";
import type { Equipment } from "@/types/equipment";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { EquipmentPhoto } from "@/components/ui/equipment-photo";

type EquipmentListProps = {
    equipments: Equipment[];
    totalEquipments: number;
    searchTerm: string;
    selectedStatus: EquipmentStatusFilterValue;
    isLoading: boolean;
    errorMessage: string;
    onRefresh: () => Promise<void>;
    onEditEquipment: (equipment: Equipment) => void;
    page: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
};

export function EquipmentList({
    equipments,
    totalEquipments,
    searchTerm,
    selectedStatus,
    isLoading,
    errorMessage,
    onRefresh,
    onEditEquipment,
    page,
    totalPages,
    limit,
    onPageChange,
    onLimitChange,
}: EquipmentListProps) {

    const [deletingEquipmentId, setDeletingEquipmentId] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessageModal, setErrorMessageModal] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    function openDeleteModal(equipmentId: string) {
        setDeletingEquipmentId(equipmentId);
        setIsDeleteModalOpen(true);
    }

    function closeDeleteModal() {
        setDeletingEquipmentId("");
        setIsDeleteModalOpen(false);
    }

    async function handleDelete() {
        if (isDeleting) return;
        setIsDeleting(true);
        setStatusMessage("");
        try {
            const response = await fetch(`/api/equipments/${deletingEquipmentId}`, {
                method: "DELETE",
            });

            const result = (await response.json()) as { error?: string };

            if (!response.ok) {
                throw new Error(result.error ?? "Erro ao excluir equipamento.");
            }

            closeDeleteModal();
            await onRefresh();
            setStatusMessage("Equipamento excluído com sucesso.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o equipamento.";

            setErrorMessageModal(message);
            setIsErrorModalOpen(true);
            closeDeleteModal();
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                        >
                            <div className="space-y-2">
                                <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
                                <div className="h-3 w-28 animate-pulse rounded bg-slate-800/60" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-xs sm:text-sm text-red-300">{errorMessage}</p>
            </div>
        );
    }

    if (equipments.length === 0) {
        const hasEquipments = totalEquipments > 0;
        const hasSearch = searchTerm.trim().length > 0;
        const hasStatusFilter = selectedStatus !== "all";

        return (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-200">
                    {hasEquipments
                        ? "Nenhum equipamento encontrado"
                        : "Nenhum equipamento cadastrado"}
                </p>

                <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    {hasEquipments
                        ? "Tente ajustar os filtros ou o termo de pesquisa."
                        : "Cadastre seu primeiro equipamento para começar o acompanhamento."}
                </p>

                {hasEquipments && hasSearch && (
                    <p className="mt-2 text-xs font-mono text-slate-400">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                        {hasStatusFilter && ` | Filtro: ${equipmentStatusLabels[selectedStatus]}`}
                    </p>
                )}

                {hasEquipments && hasStatusFilter && !hasSearch && (
                    <p className="mt-2 text-xs font-mono text-slate-400">
                        Filtro ativo: {equipmentStatusLabels[selectedStatus]}
                    </p>
                )}
            </div>
        );
    }

    return (
        <>
        <p className="sr-only" aria-live="polite">{statusMessage}</p>
        <section className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Equipamentos ({totalEquipments})
                </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {equipments.map((equipment) => (
                    <article
                        key={equipment.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
                    >
                        <div>
                            {/* Top row: Title + Status Badge */}
                            <div className="flex items-start justify-between gap-3 mb-2.5">
                                <h3 className="text-sm font-bold text-slate-100">
                                    {equipment.name}
                                </h3>

                                <span
                                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${equipmentStatusStyles[equipment.status]}`}
                                >
                                    {equipmentStatusLabels[equipment.status]}
                                </span>
                            </div>

                            {/* Details: Photo + Meta */}
                            <div className="flex items-center gap-3">
                                {equipment.photo_url && (
                                    <EquipmentPhoto
                                        src={equipment.photo_url}
                                        alt={equipment.name}
                                        className="h-10 w-10 shrink-0 rounded-lg border border-slate-800 object-cover"
                                    />
                                )}

                                <div className="min-w-0 flex-1 space-y-0.5 text-xs text-slate-400">
                                    <p>
                                        <span className="text-slate-500">Patrimônio: </span>
                                        <span className="font-mono text-slate-300 font-semibold">{equipment.patrimony_code}</span>
                                    </p>
                                    <p>
                                        <span className="text-slate-500">Local: </span>
                                        <span className="text-slate-300">{equipment.location}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom row: Action Buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <Link
                                href={`/equipamentos/${equipment.id}`}
                                className="text-xs font-semibold text-teal-400 hover:underline"
                            >
                                Detalhes
                            </Link>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEditEquipment(equipment)}
                                    className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                                >
                                    Editar
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(equipment.id)}
                                    disabled={deletingEquipmentId === equipment.id}
                                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50"
                                >
                                    {deletingEquipmentId === equipment.id ? "Excluindo..." : "Excluir"}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalEquipments}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />

        <Modal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
            title="Excluir equipamento"
            description="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            variant="danger"
            isLoading={isDeleting}
        />

        <Modal
            isOpen={isErrorModalOpen}
            onClose={() => setIsErrorModalOpen(false)}
            onConfirm={() => setIsErrorModalOpen(false)}
            title="Erro"
            description={errorMessageModal}
            confirmLabel="Entendi"
            variant="danger"
        />
        </>
    );
}
