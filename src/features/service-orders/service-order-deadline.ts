export const SERVICE_ORDER_TIME_ZONE = 'America/Sao_Paulo';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateOnly(value: string): boolean {
    const match = DATE_ONLY_PATTERN.exec(value);
    if (!match) return false;

    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

    return date.getUTCFullYear() === Number(year)
        && date.getUTCMonth() === Number(month) - 1
        && date.getUTCDate() === Number(day);
}

export function getDateOnlyInTimeZone(
    date = new Date(),
    timeZone = SERVICE_ORDER_TIME_ZONE,
): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return `${values.year}-${values.month}-${values.day}`;
}

export function addDaysToDateOnly(value: string, days: number): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
}

export function formatDateOnlyPtBr(value: string | null): string {
    if (!value) return 'sem prazo';

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}
