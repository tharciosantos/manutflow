"use client";

import { useCallback, useEffect, useState } from "react";
import { EquipmentForm } from "@/features/equipments/equipment-form";
import { EquipmentList } from "@/features/equipments/equipment-list";
import type { Equipment } from "@/types/equipment";
import { Toolbar } from "@/components/ui/toolbar";
import { Modal } from "@/components/ui/modal";
import {
    equipmentStatusFilterOptions,
    type EquipmentStatusFilterValue,
} from "@/features/equipments/equipment-status-config";

type EquipmentsApiResponse = {
    equipments: Equipment[];
    total: number;
    page: number;
    totalPages: number;
    error?: string;
};

type EquipmentPageContentProps = {
  isFormModalOpen: boolean;
  setIsFormModalOpen: (open: boolean) => void;
};

export function EquipmentPageContent({ isFormModalOpen, setIsFormModalOpen }: EquipmentPageContentProps) {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] =
        useState<EquipmentStatusFilterValue>("all");
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

    const buildUrl = useCallback(() => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      return `/api/equipments?${params.toString()}`;
    }, [page, limit, searchTerm, selectedStatus]);

    async function handleEquipmentSaved() {
        setEditingEquipment(null);
        setIsFormModalOpen(false);
        await loadEquipments();
    }

    async function loadEquipments() {
        setIsLoading(true);

        try {
            const response = await fetch(buildUrl());
            const result = (await response.json()) as EquipmentsApiResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "Erro ao carregar equipamentos.");
            }

            setEquipments(result.equipments);
            setTotal(result.total);
            setPage(result.page);
            setTotalPages(result.totalPages);
            setErrorMessage("");
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

    // Recarregar quando página, limite, busca ou filtro mudar
    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);

            try {
                const response = await fetch(buildUrl());
                const result = (await response.json()) as EquipmentsApiResponse;

                if (!response.ok) {
                    throw new Error(result.error ?? "Erro ao carregar equipamentos.");
                }

                if (ignore) return;

                setEquipments(result.equipments);
                setTotal(result.total);
                setPage(result.page);
                setTotalPages(result.totalPages);
                setErrorMessage("");
            } catch (error) {
                if (ignore) return;

                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao carregar equipamentos.";

                setErrorMessage(message);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        void loadData();

        return () => { ignore = true; };
    }, [buildUrl]);

    // Resetar para página 1 quando busca/filtro mudar
    function handleSearchChange(value: string) {
        setSearchTerm(value);
        setPage(1);
    }

    function handleStatusChange(value: string) {
        setSelectedStatus(value as EquipmentStatusFilterValue);
        setPage(1);
    }

    return (
        <>
            <Toolbar
                searchPlaceholder="Buscar equipamentos..."
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                filterOptions={equipmentStatusFilterOptions.map((opt) => ({
                        value: opt.value,
                        label: opt.value === "all" ? "Todos os status" : opt.label,
                    }))}
                filterValue={selectedStatus}
                onFilterChange={handleStatusChange}
                filterLabel="Status"
            />

            <EquipmentList
                equipments={equipments}
                totalEquipments={total}
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={loadEquipments}
                onEditEquipment={setEditingEquipment}
                page={page}
                totalPages={totalPages}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
            />

            <Modal
                isOpen={isFormModalOpen || !!editingEquipment}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingEquipment(null);
                }}
                title={editingEquipment ? "Editar equipamento" : "Novo equipamento"}
            >
                <EquipmentForm
                    key={editingEquipment?.id ?? 'modal-create'}
                    onEquipmentCreated={handleEquipmentSaved}
                    editingEquipment={editingEquipment}
                    onEditCancel={() => {
                        setEditingEquipment(null);
                        setIsFormModalOpen(false);
                    }}
                    inModal
                />
            </Modal>
        </>
    );
}
