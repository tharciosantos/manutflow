"use client";

import { useEffect, useState } from "react";
import { EquipmentForm } from "@/features/equipments/equipment-form";
import { EquipmentList } from "@/features/equipments/equipment-list";
import type { Equipment } from "@/types/equipment";
import { EquipmentSearch } from "@/features/equipments/equipment-search";
import { EquipmentStatusFilter } from "@/features/equipments/equipment-status-filter";
import {
    equipmentStatusSearchLabels,
    type EquipmentStatusFilterValue,
} from "@/features/equipments/equipment-status-config";

type EquipmentsApiResponse = {
    equipments: Equipment[];
    error?: string;
};

export function EquipmentPageContent() {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] =
        useState<EquipmentStatusFilterValue>("all");
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

    async function handleEquipmentSaved() {
        setEditingEquipment(null);
        await loadEquipments();
    }

    async function loadEquipments() {
        setIsLoading(true);

        try {
            const response = await fetch("/api/equipments");
            const result = (await response.json()) as EquipmentsApiResponse;

            if (!response.ok) {
                throw new Error(result.error ?? "Erro ao carregar equipamentos.");
            }

            setEquipments(result.equipments);
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

    useEffect(() => {
        let ignore = false;

        async function loadInitialEquipments() {
            setIsLoading(true);

            try {
                const response = await fetch("/api/equipments");
                const result = (await response.json()) as EquipmentsApiResponse;

                if (!response.ok) {
                    throw new Error(result.error ?? "Erro ao carregar equipamentos.");
                }

                if (ignore) {
                    return;
                }

                setEquipments(result.equipments);
                setErrorMessage("");
            } catch (error) {
                if (ignore) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao carregar equipamentos.";

                setErrorMessage(message);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadInitialEquipments();

        return () => {
            ignore = true;
        };
    }, []);

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredEquipments = equipments.filter((equipment) => {
        const searchableContent = [
            equipment.name,
            equipment.patrimony_code,
            equipment.location,
            equipment.status,
            equipmentStatusSearchLabels[equipment.status],
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableContent.includes(normalizedSearchTerm);
        const matchesStatus =
            selectedStatus === "all" || equipment.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="space-y-5">
                <EquipmentSearch
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                />

                <EquipmentStatusFilter
                    selectedStatus={selectedStatus}
                    onSelectedStatusChange={setSelectedStatus}
                />
            </div>

            <EquipmentForm
                key={editingEquipment?.id ?? 'create'}
                onEquipmentCreated={handleEquipmentSaved}
                editingEquipment={editingEquipment}
                onEditCancel={() => setEditingEquipment(null)}
            />

            <EquipmentList
                equipments={filteredEquipments}
                totalEquipments={equipments.length}
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRefresh={loadEquipments}
                onEditEquipment={setEditingEquipment}
            />
        </>
    );
}