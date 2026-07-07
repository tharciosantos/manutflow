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
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <span className="shrink-0 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300 sm:px-3 sm:py-1 sm:text-xs">
                    Prioridade
                </span>

                <div>
                    <div className="hidden sm:block">
                        <h2 className="text-sm font-semibold text-white">
                            Filtro por prioridade
                        </h2>
                        <p className="text-xs text-slate-400 mb-3">
                            Visualize as ordens de acordo com a prioridade definida.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {serviceOrderPriorityFilterOptions.map((filter) => {
                            const isActive = selectedPriority === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => onPriorityChange(filter.value)}
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition sm:px-3 sm:py-1.5 sm:text-xs ${isActive
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
            </div>
        </div>
    );
}
