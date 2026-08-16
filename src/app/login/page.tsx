"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

// ============================================================
//  LoginPage (Página principal)
// ============================================================
//  O Next.js exige que useSearchParams() esteja DENTRO de um
//  <Suspense> boundary.
// ============================================================

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
        </Suspense>
    );
}

// ============================================================
//  LoginSkeleton (placeholder de carregamento)
// ============================================================

function LoginSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-10">
                <div className="space-y-2 text-center mb-8">
                    <div className="h-9 w-48 bg-slate-800 rounded-lg animate-pulse mx-auto"></div>
                    <div className="h-4 w-64 bg-slate-800 rounded animate-pulse mx-auto"></div>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="h-4 w-12 bg-slate-800 rounded mb-1.5 animate-pulse"></div>
                        <div className="h-10 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    </div>
                    <div>
                        <div className="h-4 w-12 bg-slate-800 rounded mb-1.5 animate-pulse"></div>
                        <div className="h-10 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-slate-700/50 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
//  LoginForm (formulário de login)
// ============================================================

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

    const handleDemoLogin = async () => {
        const demoEmail = "demo@manutflow.com";
        const demoPassword = "Demo@123456";
        setEmail(demoEmail);
        setPassword(demoPassword);
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
        });

        if (error) {
            setError("Conta demo não encontrada ou credenciais inválidas. Verifique se o usuário foi criado no Supabase Auth.");
            setLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("E-mail ou senha incorretos");
            setLoading(false);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            {/* Efeitos de Iluminação no Fundo (Glow) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Principal */}
            <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl shadow-2xl z-10 animate-fade-in">
                <div className="text-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/25 mx-auto mb-3.5">
                        <svg className="h-6 w-6 stroke-[2.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.398-2.95 1.085l-7.242 7.242a2.121 2.121 0 0 1-3-3l7.242-7.242c.687-.686 1.176-1.874 1.085-2.95A4.5 4.5 0 0 1 16.5 2.25h1.5v3h3v1.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 tracking-tight">
                        ManutFlow
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Gestão inteligente de ativos e ordens de manutenção.</p>
                </div>

                {/* Demo Quick Access */}
                <div className="mb-6 p-4 bg-teal-950/40 border border-teal-800/50 rounded-2xl">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            Acesso Rápido Demo (1-Clique)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-teal-900/60 text-teal-300 border border-teal-700/40">
                            Pronto para teste
                        </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                        Entre como Gestor com ativos e histórico pré-carregados:
                    </p>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleDemoLogin}
                        className="w-full py-2.5 px-3 bg-slate-900/90 hover:bg-slate-800 border border-teal-500/40 hover:border-teal-400 rounded-xl text-teal-300 hover:text-teal-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
                    >
                        <span>Acessar como Gestor de Manutenção (Demo)</span>
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                            E-mail
                        </label>
                        <input
                            id="login-email"
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

                    <div>
                        <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoComplete="current-password"
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

                    {error && (
                        <div className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-center">
                            {error}
                        </div>
                    )}

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
                                <span>Entrando...</span>
                            </>
                        ) : (
                            "Entrar na Conta"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs sm:text-sm">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors hover:underline underline-offset-4">
                            Cadastre-se agora
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
