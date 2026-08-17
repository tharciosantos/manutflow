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

    const userInitial = (fullName || profile?.email || 'U').charAt(0).toUpperCase();

    if (isLoading) {
        return (
            <AppShell>
                <section className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8 space-y-4">
                    <div className="h-6 w-32 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/40">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 rounded bg-slate-100 animate-pulse dark:bg-slate-800/40" />
                        ))}
                    </div>
                </section>
            </AppShell>
        );
    }

    if (errorMessage && !profile) {
        return (
            <AppShell>
                <section className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">{errorMessage}</p>
                    </div>
                </section>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <section className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
                {/* Header de Perfil */}
                <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-lg font-bold text-slate-950 font-mono shadow-xs">
                        {userInitial}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight dark:text-slate-100">Meu Perfil</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Informações da sua conta e cargo.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label htmlFor="fullName" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                                Nome completo
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome"
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>

                        {/* Cargo */}
                        <div>
                            <label htmlFor="role" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                                Cargo / Função
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Ex: Gestor de Manutenção"
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label htmlFor="phone" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                                Telefone
                            </label>
                            <input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ex: (11) 99999-8888"
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>

                        <hr className="border-slate-200 my-2 dark:border-slate-800" />

                        {/* Email (read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-1 dark:text-slate-400">
                                E-mail (autenticação)
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={profile?.email ?? ''}
                                readOnly
                                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs sm:text-sm text-slate-500 font-mono outline-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400"
                            />
                        </div>

                        {/* Data de criação (read-only) */}
                        <div>
                            <label htmlFor="createdAt" className="block text-xs font-medium text-slate-500 mb-1 dark:text-slate-400">
                                Membro desde
                            </label>
                            <input
                                id="createdAt"
                                type="text"
                                value={profile?.created_at ? formatDate(profile.created_at) : ''}
                                readOnly
                                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs sm:text-sm text-slate-500 outline-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Mensagens de feedback */}
                    {successMessage && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && profile && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    {/* Botão salvar */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-400 disabled:opacity-60 cursor-pointer shadow-xs"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </section>
        </AppShell>
    );
}
