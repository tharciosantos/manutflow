type EquipmentSearchProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
};

export function EquipmentSearch({
    searchTerm,
    onSearchTermChange,
}: EquipmentSearchProps) {
    return (
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm">
            <div>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Busca
                </span>

                <h2 className="mt-3 text-xl font-semibold text-white">
                    Buscar equipamentos
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Filtre equipamentos por nome, patrimônio, localização ou status.
                </p>
            </div>

            <div className="mt-5">
                <label
                    htmlFor="equipmentSearch"
                    className="mb-2 block text-sm font-medium text-slate-300"
                >
                    Termo de busca
                </label>

                <input
                    id="equipmentSearch"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                    placeholder="Ex: motor, MOTOR-001, setor c, ativo"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                />
            </div>
        </section>
    );
}