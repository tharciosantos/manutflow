type StatusCardProps = {
    title: string;
    value: string;
    description: string;
    cardClassName?: string;
    valueClassName?: string;
};

export function StatusCard({
    title,
    value,
    description,
    cardClassName = 'border-slate-800 bg-slate-900',
    valueClassName = 'text-slate-100',
}: StatusCardProps) {
    return (
        <div className={`rounded-2xl border p-6 shadow-lg ${cardClassName}`}>
            <p className="text-sm text-slate-400">{title}</p>

            <strong className={`mt-2 block text-3xl font-bold ${valueClassName}`}>
                {value}
            </strong>

            <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
    );
}