type ServiceOrderSearchProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
};

export function ServiceOrderSearch({
    searchTerm,
    onSearchChange,
}: ServiceOrderSearchProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <div>
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300 sm:px-3 sm:py-1 sm:text-xs">
                        Busca
                    </span>
                </div>

                <div className="flex-1 sm:mt-3">
                    <div className="hidden sm:block">
                        <label
                            htmlFor="service-order-search"
                            className="block text-sm font-semibold text-white"
                        >
                            Buscar ordens
                        </label>
                        <p className="mt-1 text-sm text-slate-400">
                            Pesquise por título, descrição, equipamento, patrimônio ou local.
                        </p>
                    </div>

                    <input
                        id="service-order-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Buscar ordens..."
                        className="mt-0 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500 sm:mt-3"
                    />
                </div>
            </div>
        </div>
    );
}