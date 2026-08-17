import type {
    ServiceOrderPriority,
    ServiceOrderStatus,
} from '@/types/service-order';
import type { ServiceOrderDeadlineState } from './service-order-deadline';

export type ServiceOrderStatusFilterValue = ServiceOrderStatus | 'all';
export type ServiceOrderPriorityFilterValue = ServiceOrderPriority | 'all';
export type ServiceOrderDeadlineFilterValue =
    | 'all'
    | 'overdue'
    | 'today'
    | 'next_7_days'
    | 'without_due_date';

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
    open: 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
    in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    closed: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
};

export const serviceOrderPriorityStyles: Record<ServiceOrderPriority, string> = {
    low: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    critical: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
};

export const serviceOrderDeadlineStyles: Record<ServiceOrderDeadlineState, string> = {
    none: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400',
    overdue: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
    today: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    upcoming: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    closed: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300',
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

export const serviceOrderPriorityFilterOptions: Array<{
    value: ServiceOrderPriorityFilterValue;
    label: string;
}> = [
        { value: 'all', label: 'Todas' },
        { value: 'low', label: serviceOrderPriorityLabels.low },
        { value: 'medium', label: serviceOrderPriorityLabels.medium },
        { value: 'high', label: serviceOrderPriorityLabels.high },
        { value: 'critical', label: serviceOrderPriorityLabels.critical },
];

export const serviceOrderDeadlineFilterOptions: Array<{
    value: ServiceOrderDeadlineFilterValue;
    label: string;
}> = [
        { value: 'all', label: 'Todos os prazos' },
        { value: 'overdue', label: 'Atrasadas' },
        { value: 'today', label: 'Vencem hoje' },
        { value: 'next_7_days', label: 'Próximos 7 dias' },
        { value: 'without_due_date', label: 'Sem prazo' },
];
