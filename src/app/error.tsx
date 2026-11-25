"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * AUD-23: fronteira de erro da aplicação. Captura exceções de renderização e de
 * Server Components abaixo do layout raiz. Não registra nada no servidor por
 * queixa própria: no App Router o erro original chega ao log do servidor por
 * fora deste componente, e `logger` é server-only.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A maioria dos erros nesta camada já foi logada pelo servidor. O `digest`
    // é o equivalente ao traceback no log e é o que correlaciona os dois.
    console.warn("[error-boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Não foi possível carregar esta página. Tente novamente — se o problema continuar,
          recarregue a aplicação.
        </p>

        {error.digest ? (
          <p className="mt-4 text-xs font-mono text-slate-500 dark:text-slate-500">
            Código do erro: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
