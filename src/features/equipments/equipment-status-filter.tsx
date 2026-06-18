import type { EquipmentStatus } from "@/types/equipment";

export type EquipmentStatusFilterValue = "all" | EquipmentStatus;

type EquipmentStatusFilterProps = {
    selectedStatus: EquipmentStatusFilterValue;
    onSelectedStatusChange: (status: EquipmentStatusFilterValue) => void;
};

const statusOptions: Array<{
    value: EquipmentStatusFilterValue;
    label: string;
}> = [
        { value: "all", label: "Todos" },
        { value: "active", label: "Ativos" },
        { value: "inactive", label: "Inativos" },
        { value: "maintenance", label: "Em manutenção" },
    ];

export function EquipmentStatusFilter({
    selectedStatus,
    onSelectedStatusChange,
}: EquipmentStatusFilterProps) {
    return (
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm">
            <div>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Filtro
                </span>

                <h2 className="mt-3 text-xl font-semibold text-white">
                    Filtrar por status
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Visualize equipamentos de acordo com o status atual.
                </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                    const isActive = selectedStatus === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onSelectedStatusChange(option.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                                    : "border-slate-700 text-slate-300 hover:bg-slate-900"
                                }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}