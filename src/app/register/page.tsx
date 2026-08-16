"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validação client-side (além do minLength no HTML)
        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: window.location.origin + "/auth/callback",
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Cadastro bem-sucedido
        router.push("/login?registered=true");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            {/* Efeitos de Iluminação no Fundo (Glow) */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Principal */}
            <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl shadow-2xl z-10 animate-fade-in">
                <div className="text-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/25 mx-auto mb-3.5">
                        <UserPlus className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 tracking-tight">
                        ManutFlow
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Crie sua conta para gerenciar seus ativos industriais.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Input: Nome Completo */}
                    <div>
                        <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Nome completo
                        </label>
                        <input
                            id="reg-name"
                            name="name"
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Seu nome completo"
                            autoComplete="name"
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm transition-all"
                        />
                    </div>

                    {/* Input: E-mail */}
                    <div>
                        <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                            E-mail corporativo ou pessoal
                        </label>
                        <input
                            id="reg-email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            autoComplete="email"
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm transition-all"
                        />
                    </div>

                    {/* Input: Senha */}
                    <div>
                        <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="reg-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                                className="w-full pl-4 pr-20 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors focus:outline-none"
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-center">
                            {error}
                        </div>
                    )}

                    {/* Botão de Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:from-teal-700 active:to-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Criando conta...</span>
                            </>
                        ) : (
                            "Criar Minha Conta"
                        )}
                    </button>
                </form>

                {/* Rodapé */}
                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs sm:text-sm">
                        Já possui uma conta?{" "}
                        <Link href="/login" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors hover:underline underline-offset-4">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}