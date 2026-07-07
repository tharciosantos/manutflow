"use client";

import { FormEvent, useState } from "react";

type EquipmentFormProps = {
  onEquipmentCreated: () => void;
};

type CreateEquipmentResponse = {
  equipment?: unknown;
  error?: string;
};

export function EquipmentForm({ onEquipmentCreated }: EquipmentFormProps) {
  const [name, setName] = useState("");
  const [patrimonyCode, setPatrimonyCode] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/equipments", {
        method: "POST",
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

      const result = (await response.json()) as CreateEquipmentResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao cadastrar equipamento.");
      }

      setName("");
      setPatrimonyCode("");
      setLocation("");
      setStatus("active");
      setSuccessMessage("Equipamento cadastrado com sucesso.");

      onEquipmentCreated();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao cadastrar equipamento.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="equipment-form"
      onSubmit={handleSubmit}
      className="mt-6 scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:mt-8 sm:p-5"
    >
      <div>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
          Novo equipamento
        </span>

        <h2 className="mt-3 text-xl font-semibold text-white">
          Cadastrar equipamento
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Preencha os dados abaixo para adicionar um novo equipamento.
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
            onChange={(event) => setStatus(event.target.value)}
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

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar equipamento'}
        </button>
      </div>
    </form>
  );
}