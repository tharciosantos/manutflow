'use client';

import { useEffect, useState } from 'react';
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

        loadEquipments();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    Abrir nova ordem
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Cadastre uma solicitação de manutenção vinculada a um equipamento.
                </p>
            </div>

            <div className="grid gap-4">
                <div>
                    <label
                        htmlFor="title"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Título
                    </label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ex: Troca de correia"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="equipment"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Equipamento
                    </label>

                    <select
                        id="equipment"
                        value={equipmentId}
                        onChange={(event) => setEquipmentId(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
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
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Prioridade
                    </label>

                    <select
                        id="priority"
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                    >
                        {priorities.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="mb-1 block text-sm font-medium text-slate-700"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Descreva o problema ou serviço necessário."
                        rows={4}
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
                    />
                </div>
            </div>

            {errorMessage && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {successMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? 'Cadastrando...' : 'Abrir ordem'}
            </button>
        </form>
    );
}