'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/app-shell';

type Profile = {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string | null;
    created_at: string;
};

export default function PerfilPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadProfile() {
            try {
                const response = await fetch('/api/profile');
                const result = await response.json();

                if (ignore) return;

                if (!response.ok) {
                    throw new Error(result.error ?? 'Erro ao carregar perfil.');
                }

                const p = result.profile as Profile;
                setProfile(p);
                setFullName(p.full_name ?? '');
                setPhone(p.phone ?? '');
                setRole(p.role ?? '');
            } catch {
                if (!ignore) setErrorMessage('Não foi possível carregar seus dados.');
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        void loadProfile();
        return () => { ignore = true; };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            setIsSaving(true);

            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    phone: phone.trim(),
                    role: role.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? 'Erro ao salvar alterações.');
            }

            setProfile(result.profile);
            setSuccessMessage('Dados atualizados com sucesso.');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar alterações.');
        } finally {
            setIsSaving(false);
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    if (isLoading) {
        return (
            <AppShell>
                <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 w-40 rounded-lg bg-slate-800" />
                        <div className="h-4 w-64 rounded bg-slate-800/60" />
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i}>
                                    <div className="mb-1.5 h-3 w-24 rounded bg-slate-800/60" />
                                    <div className="h-10 rounded-xl bg-slate-800/40" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </AppShell>
        );
    }

    if (errorMessage && !profile) {
        return (
            <AppShell>
                <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                        <p className="text-sm text-red-300">{errorMessage}</p>
                    </div>
                </section>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">Meu Perfil</h1>
                    <p className="mt-1 text-sm text-slate-400">Gerencie suas informações pessoais.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-sm">
                    <div className="space-y-5">
                        {/* Nome */}
                        <div>
                            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-300">
                                Nome completo
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                            />
                        </div>

                        {/* Cargo */}
                        <div>
                            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
                                Cargo / Função
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Ex: Técnico de Manutenção"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">
                                Telefone
                            </label>
                            <input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ex: (11) 99999-8888"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                            />
                        </div>

                        {/* Divisória */}
                        <hr className="border-slate-800" />

                        {/* Email (read-only) */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-400">
                                Email
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={profile?.email ?? ''}
                                readOnly
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                            />
                        </div>

                        {/* Data de criação (read-only) */}
                        <div>
                            <label htmlFor="createdAt" className="mb-1.5 block text-sm font-medium text-slate-400">
                                Membro desde
                            </label>
                            <input
                                id="createdAt"
                                type="text"
                                value={profile?.created_at ? formatDate(profile.created_at) : ''}
                                readOnly
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Mensagens de feedback */}
                    {successMessage && (
                        <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                            {successMessage}
                        </p>
                    )}

                    {errorMessage && profile && (
                        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errorMessage}
                        </p>
                    )}

                    {/* Botão salvar */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Salvando...
                                </>
                            ) : 'Salvar alterações'}
                        </button>
                    </div>
                </form>
            </section>
        </AppShell>
    );
}
