"use client";

import { useEffect, useState } from "react";
import { 
    Cpu, 
    Tag, 
    Clock, 
    Wrench, 
    CheckCircle2, 
    Play, 
    Pause, 
    User,
    CalendarClock
} from "lucide-react";

const flowSteps = [
    {
        id: "open",
        orderNumber: "OS #204",
        statusLabel: "Aberta",
        statusBadgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        stepIcon: Clock,
        stepColor: "amber",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        priorityClass: "border-red-500/30 bg-red-500/10 text-red-300",
        deadlineText: "Vence hoje",
        title: "Vibração excessiva e ruído anormal no mancai",
        description: "Operador relatou aquecimento anormal e oscilação de pressão no circuito principal.",
        actorLabel: "Solicitante",
        actorName: "Supervisão de Produção",
    },
    {
        id: "in_progress",
        orderNumber: "OS #204",
        statusLabel: "Em Andamento",
        statusBadgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        stepIcon: Wrench,
        stepColor: "sky",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        priorityClass: "border-red-500/30 bg-red-500/10 text-red-300",
        deadlineText: "Em execução",
        title: "Substituição de rolamento e alinhamento a laser",
        description: "Mancai desmontado. Instalado novo conjunto de rolamentos SKF e troca de lubrificante sintético.",
        actorLabel: "Técnico Responsável",
        actorName: "Carlos Silva · Mecânica Industrial",
    },
    {
        id: "closed",
        orderNumber: "OS #204",
        statusLabel: "Concluída",
        statusBadgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        stepIcon: CheckCircle2,
        stepColor: "emerald",
        equipmentName: "Compressor Parafuso 50HP",
        patrimonyCode: "COMP-001",
        location: "Linha de Montagem B",
        priorityLabel: "Crítica",
        priorityClass: "border-red-500/30 bg-red-500/10 text-red-300",
        deadlineText: "Finalizada no prazo",
        title: "Testes de vibração aprovados e ativo liberado",
        description: "Vibração normalizada (< 1.1 mm/s). Equipamento reativado e liberado para a produção plena.",
        actorLabel: "Homologado por",
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
            {/* Glow de fundo */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Card Interativo */}
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
                className="relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl transition-all hover:border-teal-500/50 hover:shadow-teal-500/10 space-y-4"
            >
                {/* Cabeçalho da OS */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-400">
                                {active.orderNumber}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                                <Tag className="h-3 w-3 text-slate-500" />
                                {active.patrimonyCode}
                            </span>
                        </div>

                        <h2 className="mt-1 text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-teal-400 shrink-0" />
                            <span>{active.equipmentName}</span>
                        </h2>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ${active.statusBadgeClass}`}>
                        <active.stepIcon className="h-3.5 w-3.5" />
                        <span>{active.statusLabel}</span>
                    </span>
                </div>

                {/* Título & Descrição do Problema */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-slate-200">
                        {active.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {active.description}
                    </p>
                </div>

                {/* Linha do Tempo / Stepper das 3 Etapas */}
                <div className="border-t border-slate-800/80 pt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        <span>Ciclo de Atendimento</span>
                        <span className="font-mono text-teal-400">Passo {currentStep + 1} de 3</span>
                    </div>

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
                                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
                                        isCurrent
                                            ? "border-teal-500/60 bg-teal-500/15 text-teal-300 shadow-sm"
                                            : isPast
                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                            : "border-slate-800 bg-slate-950/50 text-slate-500 hover:text-slate-300"
                                    }`}
                                >
                                    <step.stepIcon className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{step.statusLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Rodapé do Card com Ator & Prazo */}
                <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/70 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <User className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span className="text-slate-500 truncate">{active.actorLabel}:</span>
                        <strong className="text-slate-300 truncate">{active.actorName}</strong>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-slate-400 font-mono text-[11px]">
                        <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
                        <span>{active.deadlineText}</span>
                    </div>
                </div>
            </div>

            {/* Controle de Play/Pause */}
            <div className="mt-3 flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-400 transition hover:border-teal-500/40 hover:text-teal-300"
                    aria-label={isPaused ? "Retomar simulação" : "Pausar simulação"}
                >
                    {isPaused ? (
                        <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Retomar fluxo</span>
                        </>
                    ) : (
                        <>
                            <Pause className="h-3 w-3 fill-current" />
                            <span>Pausar fluxo</span>
                        </>
                    )}
                </button>
                <span className="text-[11px] text-slate-500">· Clique no card para avançar</span>
            </div>
        </section>
    );
}
