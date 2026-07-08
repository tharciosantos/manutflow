"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
} from "@/features/equipments/equipment-status-config";
import {
    serviceOrderStatusLabels,
    serviceOrderPriorityLabels,
} from "@/features/service-orders/service-order-config";
import type { EquipmentDetails } from "@/types/equipment-details";

type EquipmentDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
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
            <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
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
                        <div className="mt-4 sm:mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-300 sm:px-3 sm:py-1 sm:text-xs">
                                        Detalhes do equipamento
                                    </span>

                                    <h1 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl">
                                        {details.equipment.name}
                                    </h1>

                                    <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
                                        Informações gerais do equipamento e ordens de serviço
                                        vinculadas.
                                    </p>
                                </div>

                                <span
                                    className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${equipmentStatusStyles[details.equipment.status]}`}
                                >
                                    {equipmentStatusLabels[details.equipment.status]}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Patrimônio
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm truncate">
                                        {details.equipment.patrimony_code}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm truncate">
                                        {details.equipment.location}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Criado em
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {new Date(
                                            details.equipment.created_at,
                                        ).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                        Ordens vinculadas
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                                        {details.serviceOrders.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <section className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white sm:text-xl">
                                    Ordens de serviço vinculadas
                                </h2>

                                <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                                    Histórico de solicitações relacionadas a este equipamento.
                                </p>
                            </div>

                            {details.serviceOrders.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-4 sm:p-6">
                                    <p className="text-xs text-slate-400 sm:text-sm">
                                        Nenhuma ordem de serviço vinculada a este equipamento.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {details.serviceOrders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-white sm:text-base">
                                                        {order.title}
                                                    </h3>

                                                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 sm:text-sm">
                                                        {order.description ||
                                                            "Sem descrição informada."}
                                                    </p>

                                                    <p className="mt-2 text-[11px] text-slate-500 sm:mt-3 sm:text-xs">
                                                        Criada em{" "}
                                                        {new Date(
                                                            order.created_at,
                                                        ).toLocaleDateString("pt-BR")}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end">
                                                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-300 sm:px-3 sm:py-1 sm:text-xs">
                                                        {serviceOrderStatusLabels[order.status]}
                                                    </span>

                                                    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 sm:px-3 sm:py-1 sm:text-xs">
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