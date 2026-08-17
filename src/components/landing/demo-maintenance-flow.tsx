"use client";

import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";

const flowSteps = [
    {
        id: "open",
        orderNumber: "OS #204",
        statusLabel: "Aberta",
        statusBadgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        deadlineText: "Vence hoje",
        title: "Vibração excessiva e ruído anormal no mancai",
        description: "Operador relatou aquecimento anormal e oscilação de pressão no circuito principal.",
        actorLabel: "Origem",
        actorName: "Supervisão de Produção",
    },
    {
        id: "in_progress",
        orderNumber: "OS #204",
        statusLabel: "Em Andamento",
        statusBadgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        deadlineText: "Em execução",
        title: "Substituição de rolamento e alinhamento a laser",
        description: "Mancai desmontado. Instalado novo conjunto de rolamentos SKF e troca de lubrificante sintético.",
        actorLabel: "Responsável",
        actorName: "Carlos Silva (Mecânica)",
    },
    {
        id: "closed",
        orderNumber: "OS #204",
        statusLabel: "Concluída",
        statusBadgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        deadlineText: "Finalizada no prazo",
        title: "Testes de vibração aprovados e ativo liberado",
        description: "Vibração normalizada (< 1.1 mm/s). Equipamento reativado e liberado para a produção plena.",
        actorLabel: "Homologado",
        actorName: "Gestor de Manutenção",
    },
];

export function DemoMaintenanceFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % flowSteps.length);
        }, 3200);

        return () => clearInterval(interval);
    }, [isPaused]);

    const active = flowSteps[currentStep];

    const togglePlay = () => setIsPaused(!isPaused);

    return (
        <section 
            aria-label="Demonstração interativa do fluxo de manutenção"
            className="relative mx-auto w-full max-w-lg"
        >
            {/* Card Interativo Minimalista */}
            <div 
                onClick={() => setCurrentStep((prev) => (prev + 1) % flowSteps.length)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCurrentStep((prev) => (prev + 1) % flowSteps.length);
                    }
                }}
                className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl transition-all hover:border-slate-700 space-y-4"
            >
                {/* Cabeçalho da Ordem */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-400">
                                {active.orderNumber}
                            </span>
                            <span className="text-slate-700">·</span>
                            <span className="font-mono text-xs text-slate-400">
                                {active.patrimonyCode}
                            </span>
                            <span className="text-slate-700">·</span>
                            <span className="text-xs text-slate-500">
                                {active.location}
                            </span>
                        </div>

                        <h2 className="mt-1 text-base font-bold text-slate-100">
                            {active.equipmentName}
                        </h2>
                    </div>

                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${active.statusBadgeClass}`}>
                        {active.statusLabel}
                    </span>
                </div>

                {/* Conteúdo Técnico */}
                <div className="space-y-1.5 py-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                        {active.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {active.description}
                    </p>
                </div>

                {/* Stepper das 3 Etapas */}
                <div className="pt-2">
                    <div className="grid grid-cols-3 gap-2">
                        {flowSteps.map((step, idx) => {
                            const isCurrent = idx === currentStep;
                            const isPast = idx < currentStep;

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(idx);
                                    }}
                                    className={`rounded-lg border py-1.5 text-center text-xs font-medium transition-all ${
                                        isCurrent
                                            ? "border-teal-500/50 bg-teal-500/10 text-teal-300 font-semibold"
                                            : isPast
                                            ? "border-slate-700 bg-slate-800/40 text-slate-300"
                                            : "border-slate-800/60 bg-slate-950/40 text-slate-600 hover:text-slate-400"
                                    }`}
                                >
                                    {idx + 1}. {step.statusLabel}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rodapé com Metadados */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                    <div className="text-slate-400 truncate">
                        <span className="text-slate-500">{active.actorLabel}: </span>
                        <strong className="text-slate-300 font-medium">{active.actorName}</strong>
                    </div>

                    <div className="font-mono text-slate-400 text-[11px] shrink-0">
                        {active.deadlineText}
                    </div>
                </div>
            </div>

            {/* Controle Sutil */}
            <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-500">
                <span>Clique no card para alternar</span>
                <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex items-center gap-1 hover:text-slate-300 transition-colors"
                >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    <span>{isPaused ? "Retomar" : "Pausar"}</span>
                </button>
            </div>
        </section>
    );
}
