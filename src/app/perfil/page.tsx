'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { 
    User, 
    Briefcase, 
    Phone, 
    Mail, 
    Calendar, 
    Save, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    ShieldCheck 
} from 'lucide-react';

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
                <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
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
                <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{errorMessage}</p>
                    </div>
                </section>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Header de Perfil com Avatar */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-2xl font-extrabold text-slate-950 shadow-md shadow-teal-500/20">
                        {userInitial}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-400 mb-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Conta do Sistema</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl tracking-tight">Meu Perfil</h1>
                        <p className="text-xs sm:text-sm text-slate-400">Gerencie suas informações pessoais e credenciais.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 sm:p-7 shadow-sm">
                    <div className="space-y-5">
                        {/* Nome */}
                        <div>
                            <label htmlFor="fullName" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                                <User className="h-3.5 w-3.5 text-teal-400" />
                                <span>Nome completo</span>
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Cargo */}
                        <div>
                            <label htmlFor="role" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                                <Briefcase className="h-3.5 w-3.5 text-teal-400" />
                                <span>Cargo / Função</span>
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Ex: Gestor de Manutenção / Técnico"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label htmlFor="phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                                <Phone className="h-3.5 w-3.5 text-teal-400" />
                                <span>Telefone</span>
                            </label>
                            <input
                                id="phone"
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ex: (11) 99999-8888"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Divisória */}
                        <hr className="border-slate-800/80 my-4" />

                        {/* Email (read-only) */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                <Mail className="h-3.5 w-3.5 text-slate-500" />
                                <span>Email da conta (autenticação)</span>
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={profile?.email ?? ''}
                                readOnly
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-400 font-mono outline-none cursor-not-allowed"
                            />
                        </div>

                        {/* Data de criação (read-only) */}
                        <div>
                            <label htmlFor="createdAt" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span>Membro desde</span>
                            </label>
                            <input
                                id="createdAt"
                                type="text"
                                value={profile?.created_at ? formatDate(profile.created_at) : ''}
                                readOnly
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Mensagens de feedback */}
                    {successMessage && (
                        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm text-emerald-300 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errorMessage && profile && (
                        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs sm:text-sm text-red-300 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Botão salvar */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/30 transition-all hover:from-teal-500 hover:to-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 stroke-[2.2]" />
                                    <span>Salvar alterações</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </AppShell>
    );
}
