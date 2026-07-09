'use client';

type ToolbarOption = {
  value: string;
  label: string;
};

type ToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterOptions?: ToolbarOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
};

export function Toolbar({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:flex-row sm:items-center sm:p-4">
      {/* Busca (opcional: só renderiza se houver searchPlaceholder) */}
      {searchPlaceholder && searchValue !== undefined && onSearchChange && (
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <label htmlFor="toolbar-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <input
            id="toolbar-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>
      )}

      {/* Filtro */}
      {filterOptions && filterValue !== undefined && onFilterChange && (
        <div className="flex items-center gap-2">
          {filterLabel && (
            <span className="hidden text-xs text-slate-500 sm:inline">
              {filterLabel}:
            </span>
          )}
          <select
            value={filterValue}
            onChange={(event) => onFilterChange(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
            aria-label={filterLabel ?? "Filtrar"}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
