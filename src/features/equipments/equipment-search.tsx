type EquipmentSearchProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
};

export function EquipmentSearch({
    searchTerm,
    onSearchTermChange,
}: EquipmentSearchProps) {
    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <div>
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300 sm:px-3 sm:py-1 sm:text-xs">
                        Busca
                    </span>
                </div>

                <div className="flex-1 sm:mt-3">
                    <div className="hidden sm:block">
                        <h2 className="text-xl font-semibold text-white">
                            Buscar equipamentos
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Filtre equipamentos por nome, patrimônio, localização ou status.
                        </p>
                    </div>

                    <input
                        id="equipmentSearch"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                        placeholder="Buscar equipamentos..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-500 sm:mt-3 sm:px-4 sm:py-3"
                    />
                </div>
            </div>
        </section>
    );
}