"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { 
  Wrench, 
  LayoutDashboard, 
  Cpu, 
  ClipboardList, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";

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
    { href: "/", label: "Painel", icon: LayoutDashboard },
    { href: "/equipamentos", label: "Equipamentos", icon: Cpu },
    { href: "/ordens", label: "Ordens", icon: ClipboardList },
  ];

  const userInitial = (userName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/20 transition-transform duration-300 group-hover:scale-105">
              <Wrench className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
                ManutFlow
              </span>
              <p className="hidden text-[11px] font-medium text-slate-400 sm:block leading-none mt-0.5">
                Controle de Manutenção
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 text-sm lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-500/10 text-teal-300 border border-teal-500/25 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-3 lg:flex">
          {userEmail && (
            <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
                {userInitial}
              </div>
              <span className="max-w-[130px] truncate text-xs font-medium text-slate-300" title={userEmail}>
                {userName || userEmail}
              </span>
            </div>
          )}

          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-teal-500/40 hover:text-teal-300"
          >
            <UserIcon className="h-3.5 w-3.5 text-teal-400" />
            Meu Perfil
          </Link>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5 text-red-400" />
            {loading ? "Saindo..." : "Sair"}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-300 transition hover:border-slate-700 hover:text-white lg:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl lg:hidden animate-fade-in">
          <nav className="mx-auto max-w-5xl space-y-1.5 px-4 py-3.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 text-teal-400" />
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-2 border-slate-800/80" />

            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-xs font-bold text-teal-300">
                  {userInitial}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {userName || userEmail || "Usuário"}
                </p>
              </div>

              <Link
                href="/perfil"
                onClick={closeMenu}
                className="text-xs font-semibold text-teal-400 hover:underline"
              >
                Perfil
              </Link>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Saindo..." : "Sair da conta"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
