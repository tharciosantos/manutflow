import type { ServiceOrderStatus } from "@/types/service-order";

export type ServiceOrderStatusFilter = ServiceOrderStatus | 'all';

type ServiceOrderStatusFilterProps = {
    selectedStatus: ServiceOrderStatusFilter;
    onStatusChange: (status: ServiceOrderStatusFilter) => void;
};

const filters: {
    value: ServiceOrderStatusFilter;
    label: string;
}[] = [
        { value: 'all', label: 'Todas' },
        { value: 'open', label: 'Abertas' },
        { value: 'in_progress', label: 'Em andamento' },
        { value: 'closed', label: 'Fechadas' },
    ];

export function ServiceOrderStatusFilter({
    selectedStatus,
    onStatusChange,
}: ServiceOrderStatusFilterProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-white">Filtro por status</h2>
                <p className="text-xs text-slate-400">
                    Visualize as ordens de acordo com o status atual.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                    const isActive = selectedStatus === filter.value;

                    return (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => onStatusChange(filter.value)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${isActive
                                ? 'border-teal-500/40 bg-teal-500/15 text-teal-300'
                                : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}