"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    }
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div>
          <Link href="/" className="text-lg font-semibold text-slate-100">
            ManutFlow
          </Link>
          <p className="text-sm text-slate-400">
            Controle de Manutenção e Ordens de Serviço
          </p>
        </div>

        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/" className="transition hover:text-slate-100">
            Painel
          </Link>
          <Link
            href="/equipamentos"
            className="transition hover:text-slate-100"
          >
            Equipamentos
          </Link>
          <Link href="/ordens" className="transition hover:text-slate-100">
            Ordens
          </Link>
        </nav>

        {/* Área do usuário */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-sm text-slate-400 hidden sm:block">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50"
          >
            {loading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}