import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

/**
 * AUD-23: página 404 da aplicação. Antes, uma rota inexistente caía na tela
 * genérica do Next — fora do layout, do tema e da identidade do produto.
 * Componente de servidor: não precisa de estado nem de hooks.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <FileQuestion className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="text-sm font-medium tracking-wide text-teal-600 dark:text-teal-400">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          O endereço que você abriu não existe, foi movido ou não pertence à sua conta.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Ir para o início
          </Link>
          <Link
            href="/equipamentos"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ver equipamentos
          </Link>
        </div>
      </div>
    </main>
  );
}
