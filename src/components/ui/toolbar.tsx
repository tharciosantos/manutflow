'use client';

type ToolbarOption = {
  value: string;
  label: string;
};

type ToolbarFilter = {
  label: string;
  value: string;
  options: ToolbarOption[];
  onChange: (value: string) => void;
};

type ToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ToolbarFilter[];
  filterOptions?: ToolbarOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
};

export function Toolbar({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filters,
  filterOptions,
  filterValue,
  onFilterChange,
  filterLabel,
}: ToolbarProps) {
  const activeFilters = filters ?? (
    filterOptions && filterValue !== undefined && onFilterChange
      ? [{
          label: filterLabel ?? "Filtrar",
          value: filterValue,
          options: filterOptions,
          onChange: onFilterChange,
        }]
      : []
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 space-y-3">
      {/* Busca */}
      {searchPlaceholder && searchValue !== undefined && onSearchChange && (
        <div className="relative w-full">
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>
      )}

      {/* Grid de Filtros */}
      {activeFilters.length > 0 && (
        <div className={activeFilters.length === 1 ? "w-full sm:w-56" : "grid grid-cols-2 gap-2 sm:grid-cols-4"}>
          {activeFilters.map((filter) => (
            <div key={filter.label} className="relative">
              <label htmlFor={`filter-${filter.label}`} className="sr-only">
                {filter.label}
              </label>
              <select
                id={`filter-${filter.label}`}
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 outline-none transition focus:border-teal-500 cursor-pointer"
                aria-label={filter.label}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

