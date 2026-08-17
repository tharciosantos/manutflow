'use client';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (totalPages <= 1 && total <= limit) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
        <span>
          Página {page} de {totalPages}
        </span>
        <span className="hidden sm:inline">—</span>
        <span className="hidden sm:inline">
          {total} {total === 1 ? 'registro' : 'registros'} no total
        </span>

        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="ml-2 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none transition focus:border-teal-500 cursor-pointer dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          aria-label="Itens por página"
        >
          <option value={10} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            10/página
          </option>
          <option value={20} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            20/página
          </option>
          <option value={50} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            50/página
          </option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
