import Link from "next/link";

export function AppHeader() {
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
      </div>
    </header>
  );
}