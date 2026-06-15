import type { Equipment, EquipmentStatus } from '@/types/equipment';

const equipmentStatusLabel: Record<EquipmentStatus, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    maintenance: 'Em manutenção',
};

const equipmentStatusStyles: Record<EquipmentStatus, string> = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    inactive: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
    maintenance: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

type EquipmentListProps = {
    equipments: Equipment[];
    isLoading: boolean;
    errorMessage: string;
};

export function EquipmentList({
    equipments,
    isLoading,
    errorMessage,
}: EquipmentListProps) {

    if (isLoading) {
        return (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <p className="text-sm text-slate-400">
                    Carregando equipamentos...
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                <h2 className="text-sm font-semibold text-red-300">
                    Erro ao carregar equipamentos
                </h2>

                <p className="mt-2 text-sm text-red-300">{errorMessage}</p>
            </div>
        );
    }

    if (equipments.length === 0) {
        return (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
                <p className="text-sm text-slate-400">
                    Nenhum equipamento cadastrado ainda.
                </p>
            </div>
        );
    }

    return (
        <section className="mt-6 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Equipamentos cadastrados
                    </h2>

                    <p className="text-sm text-slate-400">
                        Acompanhe os ativos registrados para manutenção.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    {equipments.length}{' '}
                    {equipments.length === 1 ? 'equipamento' : 'equipamentos'}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {equipments.map((equipment) => (
                    <article
                        key={equipment.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm transition hover:border-slate-700"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    {equipment.name}
                                </h3>

                                <div className="mt-3 grid gap-1 text-sm">
                                    <p>
                                        <span className="text-slate-500">Patrimônio:</span>{' '}
                                        <span className="text-slate-300">
                                            {equipment.patrimony_code}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="text-slate-500">Localização:</span>{' '}
                                        <span className="text-slate-300">
                                            {equipment.location}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${equipmentStatusStyles[equipment.status]}`}
                            >
                                {equipmentStatusLabel[equipment.status]}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}