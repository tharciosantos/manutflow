import type { EquipmentStatus } from "@/types/equipment";

export type EquipmentStatusFilterValue = "all" | EquipmentStatus;

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
    active: "Ativo",
    inactive: "Inativo",
    maintenance: "Em manutenção",
};

export const equipmentStatusSearchLabels: Record<EquipmentStatus, string> = {
    active: "ativo",
    inactive: "inativo",
    maintenance: "em manutenção",
};

export const equipmentStatusStyles: Record<EquipmentStatus, string> = {
    active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    inactive: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
    maintenance: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export const equipmentStatusFilterOptions: Array<{
    value: EquipmentStatusFilterValue;
    label: string;
}> = [
        { value: "all", label: "Todos" },
        { value: "active", label: "Ativos" },
        { value: "inactive", label: "Inativos" },
        { value: "maintenance", label: "Em manutenção" },
    ];