import type { ServiceOrder } from '@/types/service-order';

type ServiceOrderListProps = {
    orders: ServiceOrder[];
    isLoading: boolean;
    errorMessage: string;
};

const statusLabels = {
    open: 'Aberta',
    in_progress: 'Em andamento',
    closed: 'Fechada',
};

const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
};

export function ServiceOrderList({
    orders,
    isLoading,
    errorMessage,
}: ServiceOrderListProps) {
    if (isLoading) {
        return (
            <p className="text-sm text-slate-500">
                Carregando ordens de serviço...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
            </p>
        );
    }

    if (orders.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhuma ordem de serviço cadastrada ainda.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <article
                    key={order.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                {order.title}
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                Equipamento: {order.equipment.name}
                            </p>

                            <p className="text-sm text-slate-500">
                                Patrimônio: {order.equipment.patrimony_code}
                            </p>

                            <p className="text-sm text-slate-500">
                                Local: {order.equipment.location}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {statusLabels[order.status]}
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {priorityLabels[order.priority]}
                            </span>
                        </div>
                    </div>

                    {order.description && (
                        <p className="mt-3 text-sm text-slate-600">
                            {order.description}
                        </p>
                    )}
                </article>
            ))}
        </div>
    );
}