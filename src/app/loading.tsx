import { Loader2 } from "lucide-react";

/**
 * AUD-23: estado de carregamento das navegações entre páginas. Usa o mesmo
 * vocabulário visual do esqueleto do dashboard ("Carregando..."), para que a
 * transição não salte de estilo.
 */
export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-sans dark:bg-slate-950 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" aria-hidden="true" />
        <p className="text-xs font-medium tracking-wide">Carregando...</p>
      </div>
    </main>
  );
}
