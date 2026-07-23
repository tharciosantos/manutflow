import { serviceOrderDeadlineStyles } from './service-order-config';
import {
    formatDateOnlyPtBr,
    getServiceOrderDeadlineInfo,
} from './service-order-deadline';
import type { ServiceOrderStatus } from '@/types/service-order';

type ServiceOrderDeadlineBadgeProps = {
    dueDate: string | null;
    status: ServiceOrderStatus;
};

export function ServiceOrderDeadlineBadge({
    dueDate,
    status,
}: ServiceOrderDeadlineBadgeProps) {
    const deadline = getServiceOrderDeadlineInfo(dueDate, status);
    const exactDate = dueDate ? `Prazo: ${formatDateOnlyPtBr(dueDate)}` : 'Ordem sem prazo';

    return (
        <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-xs ${serviceOrderDeadlineStyles[deadline.state]}`}
            title={exactDate}
        >
            {deadline.label}
        </span>
    );
}
