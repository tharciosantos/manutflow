"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

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

        router.push("/login?registered=true");
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans dark:bg-slate-950 transition-colors">
            {/* Theme switcher floating */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeSwitcher />
            </div>

            {/* Card Principal */}
            <div className="w-full max-w-sm p-6 sm:p-7 bg-white border border-slate-200 rounded-2xl shadow-xl dark:bg-slate-900/70 dark:border-slate-800">
                <div className="text-center mb-6">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-slate-950 text-xs font-black tracking-tighter mb-2 shadow-xs">
                        MF
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                        Criar Conta
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5 dark:text-slate-400">Cadastre-se para gerenciar seus ativos industriais.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                    <div>
                        <label htmlFor="reg-name" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                            Nome completo
                        </label>
                        <input
                            id="reg-name"
                            name="name"
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Seu nome"
                            autoComplete="name"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white text-xs sm:text-sm transition-colors dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-email" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                            E-mail
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white text-xs sm:text-sm transition-colors dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="reg-password" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
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
                                className="w-full pl-3 pr-16 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white text-xs sm:text-sm transition-colors dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors mt-2 cursor-pointer shadow-xs"
                    >
                        {loading ? "Criando conta..." : "Criar Conta"}
                    </button>
                </form>

                <div className="mt-5 text-center">
                    <p className="text-slate-500 text-xs dark:text-slate-400">
                        Já possui uma conta?{" "}
                        <Link href="/login" className="text-teal-600 font-semibold hover:underline dark:text-teal-400">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}