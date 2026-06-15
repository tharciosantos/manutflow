"use client";

import { useEffect, useState } from "react";

import { EquipmentForm } from "@/features/equipments/equipment-form";
import { EquipmentList } from "@/features/equipments/equipment-list";
import type { Equipment } from "@/types/equipment";

type EquipmentsApiResponse = {
    equipments: Equipment[];
    error?: string;
};

export function EquipmentPageContent() {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

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

    return (
        <>
            <EquipmentForm onEquipmentCreated={loadEquipments} />

            <EquipmentList
                equipments={equipments}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
        </>
    );
}