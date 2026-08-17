"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EquipmentPhoto } from "@/components/ui/equipment-photo";
import {
    equipmentStatusLabels,
    equipmentStatusStyles,
} from "@/features/equipments/equipment-status-config";
import {
    serviceOrderStatusLabels,
    serviceOrderStatusStyles,
    serviceOrderPriorityLabels,
    serviceOrderPriorityStyles,
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
            <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Equipamentos", href: "/equipamentos" },
                        { label: details?.equipment.name ?? "Carregando..." },
                    ]}
                />

                {isLoading && (
                    <div aria-label="Carregando detalhes do equipamento" className="animate-pulse rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="text-xs text-slate-500 font-mono dark:text-slate-400">Carregando dados do equipamento...</p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                        <h1 className="text-sm font-semibold text-red-600 dark:text-red-300">
                            Não foi possível carregar o equipamento
                        </h1>
                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/80">{errorMessage}</p>
                        <Link href="/equipamentos" className="mt-3 inline-block text-xs font-semibold text-red-600 underline dark:text-red-200">
                            Voltar para equipamentos
                        </Link>
                    </div>
                )}

                {!isLoading && details && (
                    <>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
                                <div className="flex items-start gap-4">
                                    {details.equipment.photo_url && (
                                        <EquipmentPhoto
                                            src={details.equipment.photo_url}
                                            alt={details.equipment.name}
                                            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-800"
                                        />
                                    )}

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                                                {details.equipment.patrimony_code}
                                            </span>
                                            <span className="text-slate-400 dark:text-slate-700">·</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {details.equipment.location}
                                            </span>
                                        </div>

                                        <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl dark:text-slate-100">
                                            {details.equipment.name}
                                        </h1>
                                    </div>
                                </div>

                                <span
                                    className={`self-start sm:self-auto rounded-full border px-2.5 py-0.5 text-xs font-medium ${equipmentStatusStyles[details.equipment.status]}`}
                                >
                                    {equipmentStatusLabels[details.equipment.status]}
                                </span>
                            </div>

                            {/* 4 Métricas Técnicas */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Patrimônio
                                    </p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-slate-800 truncate dark:text-slate-200">
                                        {details.equipment.patrimony_code}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Localização
                                    </p>
                                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-800 truncate dark:text-slate-200">
                                        {details.equipment.location}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Cadastro
                                    </p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                        {new Date(details.equipment.created_at).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Ordens Vinculadas
                                    </p>
                                    <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
                                        {details.serviceOrders.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Seção das Ordens Vinculadas */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Ordens de Serviço ({details.serviceOrders.length})
                                    </h2>
                                </div>

                                <Link
                                    href="/ordens"
                                    className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                                >
                                    + Nova Ordem
                                </Link>
                            </div>

                            {details.serviceOrders.length === 0 ? (
                                <p className="text-xs text-slate-500 py-3">
                                    Nenhuma ordem de serviço vinculada a este equipamento.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {details.serviceOrders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                                                    {order.title}
                                                </h3>

                                                <p className="text-[11px] font-mono text-slate-500">
                                                    Criada em {new Date(order.created_at).toLocaleDateString("pt-BR")}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${serviceOrderStatusStyles[order.status]}`}>
                                                    {serviceOrderStatusLabels[order.status]}
                                                </span>

                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${serviceOrderPriorityStyles[order.priority]}`}>
                                                    {serviceOrderPriorityLabels[order.priority]}
                                                </span>

                                                <Link
                                                    href={`/ordens/${order.id}`}
                                                    className="text-xs font-semibold text-teal-600 hover:underline px-1 dark:text-teal-400"
                                                >
                                                    Detalhes
                                                </Link>
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
