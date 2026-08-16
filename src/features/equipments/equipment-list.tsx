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
import { 
    Cpu, 
    MapPin, 
    Tag, 
    Pencil, 
    Trash2, 
    ArrowUpRight, 
    Plus, 
    SearchX 
} from "lucide-react";

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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-40 animate-pulse rounded bg-slate-800" />
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800/60" />
                                        <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800/60" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="h-8 w-20 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-8 w-24 animate-pulse rounded-full bg-slate-800" />
                                    <div className="h-8 w-16 animate-pulse rounded-full bg-slate-800" />
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
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
                    {hasEquipments ? <SearchX className="h-7 w-7" /> : <Cpu className="h-7 w-7 text-teal-400/60" />}
                </div>

                <p className="text-base font-semibold text-slate-200">
                    {hasEquipments
                        ? "Nenhum equipamento encontrado"
                        : "Nenhum equipamento cadastrado"}
                </p>

                <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    {hasEquipments
                        ? "Tente ajustar os filtros ou buscar por outro termo de pesquisa."
                        : "Cadastre seu primeiro equipamento para começar o acompanhamento."}
                </p>

                {hasEquipments && hasSearch && (
                    <p className="mt-3 text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                        Busca: &ldquo;{searchTerm.trim()}&rdquo;
                        {hasStatusFilter && ` | Filtro: ${equipmentStatusLabels[selectedStatus]}`}
                    </p>
                )}

                {hasEquipments && hasStatusFilter && !hasSearch && (
                    <p className="mt-3 text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                        Filtro ativo: {equipmentStatusLabels[selectedStatus]}
                    </p>
                )}

                {!hasEquipments && (
                    <a
                        href="#equipment-form"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/30 transition-all hover:from-teal-500 hover:to-emerald-500"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        Cadastrar Equipamento
                    </a>
                )}
            </div>
        );
    }

    return (
        <>
        <p className="sr-only" aria-live="polite">{statusMessage}</p>
        <section className="mt-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-white sm:text-xl tracking-tight">
                        Equipamentos cadastrados
                    </h2>

                    <p className="text-xs text-slate-400 sm:text-sm">
                        Acompanhe os ativos registrados para manutenção preventiva e corretiva.
                    </p>
                </div>

                <span className="text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                    {equipments.length}{" "}
                    {equipments.length === 1 ? "equipamento" : "equipamentos"}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {equipments.map((equipment) => (
                    <article
                        key={equipment.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5"
                    >
                        <div>
                            {/* Top row: Title + Status Badge */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                                    {equipment.name}
                                </h3>

                                <span
                                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${equipmentStatusStyles[equipment.status]}`}
                                >
                                    {equipmentStatusLabels[equipment.status]}
                                </span>
                            </div>

                            {/* Details: Photo + Meta */}
                            <div className="flex items-start gap-3.5">
                                {equipment.photo_url ? (
                                    <EquipmentPhoto
                                        src={equipment.photo_url}
                                        alt={equipment.name}
                                        className="h-14 w-14 shrink-0 rounded-xl border border-slate-700/80 object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-500">
                                        <Cpu className="h-6 w-6 text-slate-600" />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-1.5 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Tag className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                        <span className="text-slate-500">Patrimônio:</span>
                                        <span className="font-mono font-semibold text-slate-200 truncate">
                                            {equipment.patrimony_code}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                                        <span className="text-slate-500">Local:</span>
                                        <span className="text-slate-200 truncate">
                                            {equipment.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom row: Action Buttons */}
                        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <Link
                                href={`/equipamentos/${equipment.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400/50"
                            >
                                <span>Ver Detalhes</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onEditEquipment(equipment)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-slate-700 hover:text-white"
                                    title="Editar equipamento"
                                >
                                    <Pencil className="h-3.5 w-3.5 text-sky-400" />
                                    <span className="hidden sm:inline">Editar</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openDeleteModal(equipment.id)}
                                    disabled={deletingEquipmentId === equipment.id}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Excluir equipamento"
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                    <span className="hidden sm:inline">
                                        {deletingEquipmentId === equipment.id ? "Excluindo..." : "Excluir"}
                                    </span>
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
