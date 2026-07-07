'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Equipment } from '@/types/equipment';

type ServiceOrderFormProps = {
    onCreated: () => Promise<void>;
};

const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
];

export function ServiceOrderForm({ onCreated }: ServiceOrderFormProps) {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        async function loadEquipments() {
            try {
                const response = await fetch('/api/equipments');

                if (!response.ok) {
                    throw new Error('Erro ao carregar equipamentos.');
                }

                const data = await response.json();

                setEquipments(data.equipments);
            } catch {
                setErrorMessage('Não foi possível carregar os equipamentos.');
            }
        }

        void loadEquipments();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        if (!title.trim()) {
            setErrorMessage('Informe o título da ordem de serviço.');
            return;
        }

        if (!equipmentId) {
            setErrorMessage('Selecione um equipamento.');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/service-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    equipment_id: equipmentId,
                    priority,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar ordem de serviço.');
            }

            setTitle('');
            setDescription('');
            setEquipmentId('');
            setPriority('medium');
            setSuccessMessage('Ordem de serviço cadastrada com sucesso.');

            await onCreated();
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage('Erro ao cadastrar ordem de serviço.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            id="service-order-form"
            onSubmit={handleSubmit}
            className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5"
        >
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                        Nova OS
                    </span>

                    <h2 className="mt-3 text-xl font-semibold text-white">
                        Abrir ordem de serviço
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Registre uma solicitação de manutenção vinculada a um equipamento.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
                <div>
                    <label
                        htmlFor="title"
                        className="mb-1.5 block text-sm font-medium text-slate-300"
                    >
                        Título
                    </label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ex: Troca de correia"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                    />
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="equipment"
                            className="mb-1.5 block text-sm font-medium text-slate-300"
                        >
                            Equipamento
                        </label>

                        <select
                            id="equipment"
                            value={equipmentId}
                            onChange={(event) => setEquipmentId(event.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                        >
                            <option value="">Selecione um equipamento</option>

                            {equipments.map((equipment) => (
                                <option key={equipment.id} value={equipment.id}>
                                    {equipment.name} - {equipment.patrimony_code}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="priority"
                            className="mb-1.5 block text-sm font-medium text-slate-300"
                        >
                            Prioridade
                        </label>

                        <select
                            id="priority"
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                        >
                            {priorities.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="mb-1.5 block text-sm font-medium text-slate-300"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Descreva o problema ou serviço necessário."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                    />
                </div>
            </div>

            {errorMessage && (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {successMessage}
                </p>
            )}

            <div className="mt-5 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Cadastrando...' : 'Abrir ordem'}
                </button>
            </div>
        </form>
    );
}