/**
 * AUD-10: o gráfico "Ordens por mês" monta 6 baldes de mês, mas a consulta
 * que os alimenta usava uma janela móvel de 180 dias. Qualquer data anterior
 * ao corte caía fora da resposta e, pior, o mês do corte ficava contando só
 * um pedaço: no dia 10 de novembro, o balde de junho contava só de 1 a 10.
 *
 * Aqui o início da janela é o primeiro dia do mês mais antigo do gráfico, no
 * fuso `America/Sao_Paulo` — o mesmo usado para o "hoje" das ordens.
 */

import { getDateOnlyInTimeZone, SERVICE_ORDER_TIME_ZONE } from '@/features/service-orders/service-order-deadline';

export type MonthlyBucket = {
    /** Chave estável `YYYY-MM`; o rótulo é decidido por quem exibe. */
    monthKey: string;
    count: number;
};

const MONTHS_BACK = 6;

/** Ano e mês (1-12) do "hoje" num fuso. */
function currentYearMonthInTimeZone(
    date = new Date(),
    timeZone = SERVICE_ORDER_TIME_ZONE,
): { year: number; month: number } {
    const [year, month] = getDateOnlyInTimeZone(date, timeZone).split('-').map(Number);
    return { year, month };
}

/**
 * Os 6 meses do gráfico, do mais antigo para o mais recente, já zerados.
 * A aritmética é feita em UTC só para normalizar a virada de ano (mês 0 ou
 * menor); os valores em si são rótulos de calendário, não instantes.
 */
export function getMonthlyBuckets(
    date = new Date(),
    months = MONTHS_BACK,
    timeZone = SERVICE_ORDER_TIME_ZONE,
): MonthlyBucket[] {
    const { year, month } = currentYearMonthInTimeZone(date, timeZone);
    const buckets: MonthlyBucket[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const normalized = new Date(Date.UTC(year, month - 1 - i, 1));

        buckets.push({
            monthKey: `${normalized.getUTCFullYear()}-${String(normalized.getUTCMonth() + 1).padStart(2, '0')}`,
            count: 0,
        });
    }

    return buckets;
}

/** Primeiro dia (`YYYY-MM-01`) do mês mais antigo do gráfico. */
export function getMonthlyWindowStart(
    date = new Date(),
    months = MONTHS_BACK,
    timeZone = SERVICE_ORDER_TIME_ZONE,
): string {
    const [first] = getMonthlyBuckets(date, months, timeZone);
    return `${first.monthKey}-01`;
}

/** Chave `YYYY-MM` de um instante, no fuso do domínio. */
export function getMonthKeyInTimeZone(
    instant: string | Date,
    timeZone = SERVICE_ORDER_TIME_ZONE,
): string {
    const date = typeof instant === 'string' ? new Date(instant) : instant;

    if (Number.isNaN(date.getTime())) return '';

    return getDateOnlyInTimeZone(date, timeZone).slice(0, 7);
}

/**
 * Distribui as ordens nos baldes. Ordem fora da janela — ou com `created_at`
 * inválido — é ignorada em vez de virar contagem no mês errado.
 */
export function countOrdersByMonth(
    orders: { created_at: string }[],
    buckets: MonthlyBucket[],
    timeZone = SERVICE_ORDER_TIME_ZONE,
): MonthlyBucket[] {
    const counts = new Map(buckets.map((bucket) => [bucket.monthKey, 0]));

    for (const order of orders) {
        const key = getMonthKeyInTimeZone(order.created_at, timeZone);

        if (counts.has(key)) {
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
    }

    return buckets.map((bucket) => ({ ...bucket, count: counts.get(bucket.monthKey) ?? 0 }));
}

/** Rótulos de 3 letras em português, indexados por mês 0-11. */
export const MONTH_SHORT_NAMES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/** "2026-11" → "Nov". */
export function getMonthShortName(monthKey: string): string {
    return MONTH_SHORT_NAMES[Number(monthKey.slice(5, 7)) - 1] ?? monthKey;
}
