import type {
    ServiceOrderPriority,
    ServiceOrderStatus,
} from '@/types/service-order';

export type ServiceOrderStatusFilterValue = ServiceOrderStatus | 'all';

export const serviceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
    open: 'Aberta',
    in_progress: 'Em andamento',
    closed: 'Fechada',
};

export const serviceOrderPriorityLabels: Record<ServiceOrderPriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
};

export const serviceOrderStatusStyles: Record<ServiceOrderStatus, string> = {
    open: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
    in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    closed: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
};

export const serviceOrderPriorityStyles: Record<ServiceOrderPriority, string> = {
    low: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    critical: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export const serviceOrderStatusFilterOptions: Array<{
    value: ServiceOrderStatusFilterValue;
    label: string;
}> = [
        { value: 'all', label: 'Todas' },
        { value: 'open', label: 'Abertas' },
        { value: 'in_progress', label: 'Em andamento' },
        { value: 'closed', label: 'Fechadas' },
    ];