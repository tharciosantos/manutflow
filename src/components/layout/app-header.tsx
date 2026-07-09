"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";

export function AppHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    }
    getUser();
  }, [supabase]);

  // Close menu on route change via click on mobile nav links
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    setLoading(true);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Painel" },
    { href: "/equipamentos", label: "Equipamentos" },
    { href: "/ordens", label: "Ordens" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <div className="min-w-0 flex-1 sm:flex-none">
          <Link href="/" className="text-base font-semibold text-slate-100 sm:text-lg">
            ManutFlow
          </Link>
          <p className="hidden truncate text-xs text-slate-400 sm:block sm:text-sm">
            Controle de Manutenção e Ordens de Serviço
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 text-sm text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 transition hover:text-slate-100 ${
                pathname === link.href
                  ? "bg-slate-800/60 text-slate-100"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-3 md:flex">
          {userEmail && (
            <span className="hidden truncate text-sm text-slate-400 sm:block max-w-[160px] lg:max-w-none">
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

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto max-w-5xl space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  pathname === link.href
                    ? "bg-slate-800/60 text-teal-300"
                    : "text-slate-300 hover:bg-slate-800/40 hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-slate-800" />
            {userEmail && (
              <p className="px-4 py-2 text-xs text-slate-500 truncate">
                {userEmail}
              </p>
            )}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {loading ? "Saindo..." : "Sair"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}