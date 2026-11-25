'use client';

import { useState, type FormEvent } from 'react';
import { EquipmentPicker } from './equipment-picker';

type ServiceOrderFormProps = {
    onCreated: () => Promise<void>;
    /** AUD-25: chamado pelo "Cancelar" quando o form vive dentro de um Modal. */
    onCancel?: () => void;
};

const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
];

export function ServiceOrderForm({ onCreated, onCancel }: ServiceOrderFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
                    due_date: dueDate || null,
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
            setDueDate('');
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
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950/70"
        >
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                        Nova OS
                    </span>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                        Abrir ordem de serviço
                    </h2>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Registre uma solicitação de manutenção vinculada a um equipamento.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
                <div>
                    <label
                        htmlFor="title"
                        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                        Título
                    </label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ex: Troca de correia"
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
                    />
                </div>

                {/* AUD-09: o picker ocupa a linha inteira. Nome e patrimônio do
                    ativo não cabem numa coluna estreita ao lado de prioridade e prazo. */}
                <div>
                    <EquipmentPicker
                        value={equipmentId}
                        onChange={setEquipmentId}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="priority"
                            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Prioridade
                        </label>

                        <select
                            id="priority"
                            value={priority}
                            onChange={(event) => setPriority(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 cursor-pointer dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                            htmlFor="due-date"
                            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Prazo <span className="font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
                        </label>

                        <input
                            id="due-date"
                            type="date"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:[color-scheme:dark]"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Descreva o problema ou serviço necessário."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
                    />
                </div>
            </div>

            {errorMessage && (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                    {successMessage}
                </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs"
                >
                    {isSubmitting ? 'Cadastrando...' : 'Abrir ordem'}
                </button>
            </div>
        </form>
    );
}
