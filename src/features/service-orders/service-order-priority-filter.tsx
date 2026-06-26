import {
    serviceOrderPriorityFilterOptions,
    type ServiceOrderPriorityFilterValue,
} from '@/features/service-orders/service-order-config';

export type ServiceOrderPriorityFilter = ServiceOrderPriorityFilterValue;

type ServiceOrderPriorityFilterProps = {
    selectedPriority: ServiceOrderPriorityFilter;
    onPriorityChange: (priority: ServiceOrderPriorityFilter) => void;
};

export function ServiceOrderPriorityFilter({
    selectedPriority,
    onPriorityChange,
}: ServiceOrderPriorityFilterProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-white">
                    Filtro por prioridade
                </h2>
                <p className="text-xs text-slate-400">
                    Visualize as ordens de acordo com a prioridade definida.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {serviceOrderPriorityFilterOptions.map((filter) => {
                    const isActive = selectedPriority === filter.value;

                    return (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => onPriorityChange(filter.value)}
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
