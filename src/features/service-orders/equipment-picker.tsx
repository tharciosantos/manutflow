'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import type { Equipment } from '@/types/equipment';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

/**
 * AUD-09: o formulário de nova ordem carregava `/api/equipments?limit=999`,
 * mas a rota capa o limit em 50. Acima de 50 ativos, os mais antigos (a lista
 * vem ordenada por `created_at desc`) simplesmente não apareciam no `<select>`
 * e não havia como abrir uma ordem para eles — sem nenhum aviso na tela.
 *
 * Aqui a lista é consultada no servidor conforme o usuário digita, usando a
 * busca `?q=` que a rota já implementa (nome, patrimônio e localização). O
 * componente guarda só o equipamento escolhido, então o formulário não depende
 * mais de ter a lista inteira em memória.
 */

type EquipmentPickerProps = {
    value: string;
    onChange: (equipmentId: string) => void;
    disabled?: boolean;
};

type EquipmentsResponse = {
    equipments?: Equipment[];
    total?: number;
    error?: string;
};

const SEARCH_LIMIT = 20;
const DEBOUNCE_MS = 300;

export function EquipmentPicker({ value, onChange, disabled }: EquipmentPickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Equipment[]>([]);
    const [total, setTotal] = useState(0);
    // Objeto do equipamento escolhido, só para exibir o chip. Controle de
    // verdade é o `value` do pai: se ele zerar (após o envio), o chip sai mesmo
    // que este objeto ainda esteja guardado.
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedId, setSelectedId] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const inputId = useId();
    const listboxId = `${inputId}-listbox`;
    const containerRef = useRef<HTMLDivElement>(null);

    // Fecha ao clicar fora — o popover não é um elemento nativo.
    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    // O chip depende do `value` do pai: enquanto ele for o id escolhido, mostra o
    // objeto guardado. Se o form zerar o campo após o envio, o chip sai junto.
    const activeSelection = value && value === selectedId ? selectedEquipment : null;

    useEffect(() => {
        if (!isOpen) return;

        // Sem termo, lista os mais recentes para o usuário já ver opções.
        const term = query.trim();
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setIsLoading(true);
            setErrorMessage('');

            const params = new URLSearchParams({ limit: String(SEARCH_LIMIT) });
            if (term) params.set('q', term);

            fetchWithRetry(`/api/equipments?${params.toString()}`, { signal: controller.signal })
                .then(async (response) => {
                    const data = (await response.json()) as EquipmentsResponse;

                    if (!response.ok) {
                        throw new Error(data.error ?? 'Erro ao buscar equipamentos.');
                    }

                    setResults(data.equipments ?? []);
                    setTotal(data.total ?? 0);
                })
                .catch((error: unknown) => {
                    if (controller.signal.aborted) return;

                    setResults([]);
                    setTotal(0);
                    setErrorMessage(
                        error instanceof Error ? error.message : 'Não foi possível buscar equipamentos.',
                    );
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, isOpen]);

    function handleSelect(equipment: Equipment) {
        setSelectedEquipment(equipment);
        setSelectedId(equipment.id);
        onChange(equipment.id);
        setIsOpen(false);
        setQuery('');
    }

    function handleClear() {
        setSelectedEquipment(null);
        setSelectedId('');
        onChange('');
    }

    if (activeSelection) {
        return (
            <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Equipamento
                </span>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {activeSelection.name}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                                {activeSelection.patrimony_code}
                            </span>
                            <span className="text-slate-400 dark:text-slate-600">·</span>
                            <span className="truncate">{activeSelection.location}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        aria-label="Trocar equipamento"
                        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <label
                htmlFor={inputId}
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
                Equipamento
            </label>

            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    id={inputId}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={query}
                    disabled={disabled}
                    placeholder="Buscar por nome ou patrimônio"
                    onFocus={() => setIsOpen(true)}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') setIsOpen(false);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                />

                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-500" />
                )}
            </div>

            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label="Equipamentos encontrados"
                    className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                    {errorMessage ? (
                        <p className="px-3 py-2 text-xs text-red-600 dark:text-red-300">{errorMessage}</p>
                    ) : results.length === 0 && !isLoading ? (
                        <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                            {query.trim()
                                ? 'Nenhum equipamento encontrado.'
                                : 'Nenhum equipamento cadastrado. Cadastre um ativo primeiro.'}
                        </p>
                    ) : (
                        <>
                            {results.map((equipment) => (
                                <button
                                    key={equipment.id}
                                    type="button"
                                    role="option"
                                    aria-selected={false}
                                    onClick={() => handleSelect(equipment)}
                                    className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {equipment.name}
                                    </span>
                                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                        {equipment.patrimony_code} · {equipment.location}
                                    </span>
                                </button>
                            ))}

                            {total > results.length && (
                                <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                    Mostrando {results.length} de {total}. Refine a busca para encontrar outro ativo.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
