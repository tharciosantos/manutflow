"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

export function AppHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
        setUserName(name);
      }
    }
    getUser();
  }, [supabase]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    setLoading(true);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/equipamentos", label: "Equipamentos" },
    { href: "/ordens", label: "Ordens de Serviço" },
  ];

  const userInitial = (userName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Logo Minimalista */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500 text-slate-950 text-xs font-black tracking-tighter">
              MF
            </span>
            <span className="text-base font-bold tracking-tight text-slate-100 group-hover:text-teal-400 transition-colors">
              ManutFlow
            </span>
          </Link>

          {/* Desktop Navigation Minimalista */}
          <nav className="hidden items-center gap-1 text-xs sm:text-sm md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800/80 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-3 md:flex">
          {userEmail && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-200">
                {userInitial}
              </span>
              <span className="max-w-[200px] truncate text-slate-300">
                {userName || userEmail}
              </span>
            </div>
          )}

          <div className="h-4 w-px bg-slate-800" />

          <Link
            href="/perfil"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Perfil
          </Link>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Saindo..." : "Sair"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 hover:text-white md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 p-4 md:hidden animate-fade-in">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-3 border-slate-800" />

            <div className="flex items-center justify-between py-1 px-3">
              <span className="text-xs text-slate-400 truncate">
                {userName || userEmail || "Usuário"}
              </span>
              <Link
                href="/perfil"
                onClick={closeMenu}
                className="text-xs font-semibold text-teal-400"
              >
                Perfil
              </Link>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-2 w-full text-left rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              {loading ? "Saindo..." : "Sair da conta"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
