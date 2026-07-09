"use client";

import { FormEvent, useState, useRef } from "react";
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

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    editingEquipment?.photo_url ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingEquipment;

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
  }

  function handleRemovePhoto() {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!selectedFile) return previewUrl;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as { url?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? 'Erro ao fazer upload da imagem.');
      }

      return result.url ?? null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Faz upload da foto primeiro, se houver
      const photoUrl = await uploadPhoto();

      const url = isEditing
        ? `/api/equipments/${editingEquipment!.id}`
        : "/api/equipments";
      const method = isEditing ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        name,
        patrimony_code: patrimonyCode,
        location,
        status,
      };

      // Só envia photo_url se houver foto nova ou se removeu a foto
      if (selectedFile || (!selectedFile && isEditing && !previewUrl && editingEquipment?.photo_url)) {
        body.photo_url = photoUrl;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
        setSelectedFile(null);
        setPreviewUrl(null);
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
    setSelectedFile(null);
    setPreviewUrl(null);
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

        {/* Upload de foto */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Foto do equipamento
          </label>

          {previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-32 w-32 rounded-xl border border-slate-700 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 px-4 py-6 transition hover:border-teal-500/50 hover:bg-slate-900/50">
              <svg className="h-6 w-6 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm text-slate-400">
                Clique para selecionar uma foto
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
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
          disabled={isSubmitting || isUploading}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading
            ? "Enviando foto..."
            : isSubmitting
            ? (isEditing ? "Salvando..." : "Cadastrando...")
            : (isEditing ? "Salvar alterações" : "Cadastrar equipamento")}
        </button>
      </div>
    </form>
  );
}