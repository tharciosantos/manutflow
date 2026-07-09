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
      <div className="flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
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
          className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 outline-none transition focus:border-teal-500"
          aria-label="Itens por página"
        >
          <option value={10} className="bg-slate-950 text-slate-100">
            10/página
          </option>
          <option value={20} className="bg-slate-950 text-slate-100">
            20/página
          </option>
          <option value={50} className="bg-slate-950 text-slate-100">
            50/página
          </option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
