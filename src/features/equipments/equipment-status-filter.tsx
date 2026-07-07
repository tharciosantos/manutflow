import {
    equipmentStatusFilterOptions,
    type EquipmentStatusFilterValue,
} from "@/features/equipments/equipment-status-config";

type EquipmentStatusFilterProps = {
    selectedStatus: EquipmentStatusFilterValue;
    onSelectedStatusChange: (status: EquipmentStatusFilterValue) => void;
};

export function EquipmentStatusFilter({
    selectedStatus,
    onSelectedStatusChange,
}: EquipmentStatusFilterProps) {
    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <span className="shrink-0 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300 sm:px-3 sm:py-1 sm:text-xs">
                    Filtro
                </span>

                <div>
                    <div className="hidden sm:block">
                        <h2 className="text-xl font-semibold text-white">
                            Filtrar por status
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Visualize equipamentos de acordo com o status atual.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                        {equipmentStatusFilterOptions.map((option) => {
                            const isActive = selectedStatus === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onSelectedStatusChange(option.value)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${isActive
                                        ? "border-teal-500 bg-teal-500/10 text-teal-300"
                                        : "border-slate-700 text-slate-300 hover:bg-slate-900"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}