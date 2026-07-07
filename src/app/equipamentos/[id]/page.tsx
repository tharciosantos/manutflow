"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
} from "@/features/equipments/equipment-status-config";
import type { EquipmentDetails } from "@/types/equipment-details";
import type {
    ServiceOrderPriority,
    ServiceOrderStatus,
} from "@/types/service-order";

type EquipmentDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

const serviceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
    open: "Aberta",
    in_progress: "Em andamento",
    closed: "Fechada",
};

const serviceOrderPriorityLabels: Record<ServiceOrderPriority, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
};

export default function EquipmentDetailsPage({
    params,
}: EquipmentDetailsPageProps) {
    const [equipmentId, setEquipmentId] = useState("");
    const [details, setDetails] = useState<EquipmentDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadParams() {
            const { id } = await params;

            if (!ignore) {
                setEquipmentId(id);
            }
        }

        void loadParams();

        return () => {
            ignore = true;
        };
    }, [params]);

    useEffect(() => {
        if (!equipmentId) {
            return;
        }

        let ignore = false;

        async function loadEquipmentDetails() {
            setIsLoading(true);

            try {
                const response = await fetch(`/api/equipments/${equipmentId}`);
                const result = (await response.json()) as EquipmentDetails & {
                    error?: string;
                };

                if (!response.ok) {
                    throw new Error(
                        result.error ?? "Erro ao carregar detalhes do equipamento.",
                    );
                }

                if (ignore) {
                    return;
                }

                setDetails(result);
                setErrorMessage("");
            } catch (error) {
                if (ignore) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro inesperado ao carregar detalhes do equipamento.";

                setErrorMessage(message);
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadEquipmentDetails();

        return () => {
            ignore = true;
        };
    }, [equipmentId]);

    return (
        <AppShell>
            <section className="mx-auto max-w-5xl px-6 py-10">
                <Breadcrumbs
                    items={[
                        { label: "Equipamentos", href: "/equipamentos" },
                        { label: details?.equipment.name ?? "Carregando..." },
                    ]}
                />

                {isLoading && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                        <p className="text-sm text-slate-400">
                            Carregando detalhes do equipamento...
                        </p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                        <h1 className="text-xl font-semibold text-red-300">
                            Não foi possível carregar o equipamento
                        </h1>

                        <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
                    </div>
                )}

                {!isLoading && details && (
                    <>
                        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                        Detalhes do equipamento
                                    </span>

                                    <h1 className="mt-3 text-3xl font-bold text-white">
                                        {details.equipment.name}
                                    </h1>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Informações gerais do equipamento e ordens de serviço
                                        vinculadas.
                                    </p>
                                </div>

                                <span
                                    className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${equipmentStatusStyles[details.equipment.status]}`}
                                >
                                    {equipmentStatusLabels[details.equipment.status]}
                                </span>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Patrimônio
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {details.equipment.patrimony_code}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {details.equipment.location}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Criado em
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {new Date(
                                            details.equipment.created_at,
                                        ).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Ordens vinculadas
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-200">
                                        {details.serviceOrders.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <section className="mt-8 space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Ordens de serviço vinculadas
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Histórico de solicitações relacionadas a este equipamento.
                                </p>
                            </div>

                            {details.serviceOrders.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
                                    <p className="text-sm text-slate-400">
                                        Nenhuma ordem de serviço vinculada a este equipamento.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {details.serviceOrders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <h3 className="text-base font-semibold text-white">
                                                        {order.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {order.description ||
                                                            "Sem descrição informada."}
                                                    </p>

                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Criada em{" "}
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleDateString("pt-BR")}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                                        {serviceOrderStatusLabels[order.status]}
                                                    </span>

                                                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                                        {serviceOrderPriorityLabels[order.priority]}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>
        </AppShell>
    );
}