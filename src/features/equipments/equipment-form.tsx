"use client";

import { FormEvent, useState } from "react";
import type { Equipment } from "@/types/equipment";

type EquipmentFormProps = {
  onEquipmentCreated: () => void;
  editingEquipment?: Equipment | null;
  onEditCancel?: () => void;
  inModal?: boolean;
};

type ApiResponse = {
  equipment?: unknown;
  error?: string;
};

export function EquipmentForm({ onEquipmentCreated, editingEquipment, onEditCancel, inModal }: EquipmentFormProps) {
  const [name, setName] = useState(editingEquipment?.name ?? "");
  const [patrimonyCode, setPatrimonyCode] = useState(editingEquipment?.patrimony_code ?? "");
  const [location, setLocation] = useState(editingEquipment?.location ?? "");
  const [status, setStatus] = useState(editingEquipment?.status ?? "active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = !!editingEquipment;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const url = isEditing
        ? `/api/equipments/${editingEquipment!.id}`
        : "/api/equipments";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          patrimony_code: patrimonyCode,
          location,
          status,
        }),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(result.error ?? `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} equipamento.`);
      }

      if (!isEditing) {
        setName("");
        setPatrimonyCode("");
        setLocation("");
        setStatus("active");
      }

      setSuccessMessage(
        isEditing
          ? "Equipamento atualizado com sucesso."
          : "Equipamento cadastrado com sucesso.",
      );

      onEquipmentCreated();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Erro inesperado ao ${isEditing ? 'atualizar' : 'cadastrar'} equipamento.`;

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (!isEditing) return;
    setName("");
    setPatrimonyCode("");
    setLocation("");
    setStatus("active");
    setSuccessMessage("");
    setErrorMessage("");
    onEditCancel?.();
  }

  return (
    <form
      id="equipment-form"
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5 ${inModal ? '' : 'mt-6 scroll-mt-24 sm:mt-8'}`}
    >
      <div>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
          {isEditing ? "Editar equipamento" : "Novo equipamento"}
        </span>

        <h2 className="mt-3 text-xl font-semibold text-white">
          {isEditing ? "Editar equipamento" : "Cadastrar equipamento"}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {isEditing
            ? `Editando: ${editingEquipment?.name}`
            : "Preencha os dados abaixo para adicionar um novo equipamento."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Nome do equipamento
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Motor Elétrico"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label
            htmlFor="patrimonyCode"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Código de patrimônio
          </label>

          <input
            id="patrimonyCode"
            type="text"
            value={patrimonyCode}
            onChange={(event) => setPatrimonyCode(event.target.value)}
            placeholder="Ex: MOTOR-001"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Localização
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Ex: Setor C"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as Equipment['status'])}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-teal-500"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="maintenance">Em manutenção</option>
          </select>
        </div>
      </div>

      {successMessage && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {errorMessage}
        </p>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? (isEditing ? "Salvando..." : "Cadastrando...")
            : (isEditing ? "Salvar alterações" : "Cadastrar equipamento")}
        </button>
      </div>
    </form>
  );
}