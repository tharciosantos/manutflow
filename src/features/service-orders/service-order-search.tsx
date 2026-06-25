type ServiceOrderSearchProps = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
};

export function ServiceOrderSearch({
    searchTerm,
    onSearchChange,
}: ServiceOrderSearchProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <label
                htmlFor="service-order-search"
                className="block text-sm font-semibold text-white"
            >
                Buscar ordens
            </label>

            <p>
                Pesquise por título, descrição, equipamento, patrimônio ou local.
            </p>

            <input
                id="service-order-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Ex: esteira, COMP-001, rolamento..."
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-500"
            />
        </div>
    );
}