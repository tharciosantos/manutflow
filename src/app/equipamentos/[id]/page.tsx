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
import { 
    Cpu, 
    Tag, 
    MapPin, 
    Calendar, 
    ClipboardList, 
    ArrowUpRight, 
    AlertCircle, 
    Plus 
} from "lucide-react";

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
                    <div aria-label="Carregando detalhes do equipamento" className="mt-6 animate-pulse rounded-2xl border border-slate-800 bg-slate-950/70 p-8 text-center">
                        <p className="text-sm text-slate-400">Carregando dados do equipamento...</p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h1 className="text-base font-semibold text-red-300">
                                Não foi possível carregar o equipamento
                            </h1>
                            <p className="mt-1 text-sm text-red-300/80">{errorMessage}</p>
                            <Link href="/equipamentos" className="mt-3 inline-flex rounded-xl border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10">
                                Voltar para equipamentos
                            </Link>
                        </div>
                    </div>
                )}

                {!isLoading && details && (
                    <>
                        <div className="mt-4 sm:mt-6 rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-7 shadow-sm space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-4">
                                    {details.equipment.photo_url ? (
                                        <EquipmentPhoto
                                            src={details.equipment.photo_url}
                                            alt={details.equipment.name}
                                            className="h-20 w-20 shrink-0 rounded-2xl border border-slate-700/80 object-cover shadow-sm sm:h-24 sm:w-24"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-teal-400 sm:h-24 sm:w-24">
                                            <Cpu className="h-10 w-10 stroke-[1.5]" />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-0.5 text-xs font-semibold text-teal-300">
                                            <Cpu className="h-3.5 w-3.5" />
                                            <span>Ativo Industrial</span>
                                        </div>

                                        <h1 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                                            {details.equipment.name}
                                        </h1>

                                        <p className="text-sm text-slate-400 max-w-xl">
                                            Informações técnicas do ativo e histórico de ordens associadas.
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`self-start sm:self-auto rounded-full border px-3 py-1 text-xs font-semibold ${equipmentStatusStyles[details.equipment.status]}`}
                                >
                                    {equipmentStatusLabels[details.equipment.status]}
                                </span>
                            </div>

                            {/* 4 Cards de Metadados */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Patrimônio
                                        </p>
                                        <p className="mt-0.5 font-mono text-xs sm:text-sm font-bold text-slate-200 truncate">
                                            {details.equipment.patrimony_code}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Localização
                                        </p>
                                        <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-200 truncate">
                                            {details.equipment.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Cadastrado em
                                        </p>
                                        <p className="mt-0.5 font-mono text-xs sm:text-sm font-bold text-slate-200">
                                            {new Date(details.equipment.created_at).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 flex items-center gap-3">
                                    <ClipboardList className="h-4 w-4 text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Ordens Vinculadas
                                        </p>
                                        <p className="mt-0.5 font-mono text-xs sm:text-sm font-bold text-slate-200">
                                            {details.serviceOrders.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção das Ordens Vinculadas */}
                        <section className="mt-6 rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-300 mb-1.5">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        <span>Ordens de Serviço</span>
                                    </div>

                                    <h2 className="text-lg font-bold text-white sm:text-xl">
                                        Histórico de Manutenções deste Ativo
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Todas as ordens de serviço preventivas e corretivas associadas.
                                    </p>
                                </div>

                                <Link
                                    href="/ordens"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-teal-500 hover:to-emerald-500"
                                >
                                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                    <span>Nova Ordem</span>
                                </Link>
                            </div>

                            {details.serviceOrders.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs sm:text-sm text-slate-500">
                                    Nenhuma ordem de serviço vinculada a este equipamento.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {details.serviceOrders.map((order) => (
                                        <article
                                            key={order.id}
                                            className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 transition-all duration-200 hover:border-teal-500/40 hover:bg-slate-900/70"
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <h3 className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                                                    {order.title}
                                                </h3>

                                                <p className="text-xs text-slate-400 line-clamp-1">
                                                    {order.description || "Sem descrição informada."}
                                                </p>

                                                <p className="text-[11px] font-mono text-slate-500">
                                                    Criada em {new Date(order.created_at).toLocaleDateString("pt-BR")}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${serviceOrderStatusStyles[order.status]}`}>
                                                    {serviceOrderStatusLabels[order.status]}
                                                </span>

                                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${serviceOrderPriorityStyles[order.priority]}`}>
                                                    {serviceOrderPriorityLabels[order.priority]}
                                                </span>

                                                <Link
                                                    href={`/ordens/${order.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-300 transition hover:bg-teal-500/20"
                                                >
                                                    <span>Abrir</span>
                                                    <ArrowUpRight className="h-3 w-3" />
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
