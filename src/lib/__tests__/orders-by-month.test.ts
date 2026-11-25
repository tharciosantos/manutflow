// AUD-10: a janela do gráfico "Ordens por mês" era de 180 dias corridos, mas
// os baldes são meses de calendário. O mês do corte contava só um pedaço e o
// agrupamento usava o mês do servidor (UTC), não o de Brasília.

import { describe, expect, it } from 'vitest';
import {
    countOrdersByMonth,
    getMonthKeyInTimeZone,
    getMonthShortName,
    getMonthlyBuckets,
    getMonthlyWindowStart,
} from '../orders-by-month';

/** Meia-noite de Brasília de um dia, em ISO — como o banco guarda. */
function brasilia(dateOnly: string, time = '00:00:00'): string {
    return `${dateOnly}T${time}-03:00`;
}

describe('getMonthlyBuckets (AUD-10)', () => {
    it('devolve 6 meses terminando no mês corrente', () => {
        const buckets = getMonthlyBuckets(new Date('2026-11-10T12:00:00-03:00'));

        expect(buckets.map((bucket) => bucket.monthKey)).toEqual([
            '2026-06',
            '2026-07',
            '2026-08',
            '2026-09',
            '2026-10',
            '2026-11',
        ]);
        expect(buckets.every((bucket) => bucket.count === 0)).toBe(true);
    });

    it('atravessa a virada de ano', () => {
        const buckets = getMonthlyBuckets(new Date('2026-02-15T12:00:00-03:00'));

        expect(buckets.map((bucket) => bucket.monthKey)).toEqual([
            '2025-09',
            '2025-10',
            '2025-11',
            '2025-12',
            '2026-01',
            '2026-02',
        ]);
    });

    it('usa o mês de Brasília, não o do servidor', () => {
        // 1º de novembro, 00:30 em Brasília = 1º de novembro, 03:30 UTC.
        // Em 31 de outubro, 22:00 em Brasília = 1º de novembro, 01:00 UTC:
        // o mês corrente é outubro, mesmo que o servidor já esteja em novembro.
        const buckets = getMonthlyBuckets(new Date('2026-11-01T01:00:00Z'));

        expect(buckets.at(-1)?.monthKey).toBe('2026-10');
    });
});

describe('getMonthlyWindowStart (AUD-10)', () => {
    it('começa no dia 1º do mês mais antigo, e não em 180 dias atrás', () => {
        // Em 10/11, 180 dias atrás cai em 14/05 — fora do gráfico, e junho
        // contaria só de 1 a 10.
        expect(getMonthlyWindowStart(new Date('2026-11-10T12:00:00-03:00'))).toBe('2026-06-01');
    });

    it('no dia 1º do mês, a janela já inclui o mês inteiro', () => {
        expect(getMonthlyWindowStart(new Date('2026-11-01T00:10:00-03:00'))).toBe('2026-06-01');
    });

    it('atravessa a virada de ano', () => {
        expect(getMonthlyWindowStart(new Date('2026-01-31T12:00:00-03:00'))).toBe('2025-08-01');
    });
});

describe('countOrdersByMonth (AUD-10)', () => {
    const buckets = getMonthlyBuckets(new Date('2026-11-10T12:00:00-03:00'));

    it('conta só as ordens do mês correspondente', () => {
        const result = countOrdersByMonth(
            [
                { created_at: brasilia('2026-11-02') },
                { created_at: brasilia('2026-11-09') },
                { created_at: brasilia('2026-06-01') },
            ],
            buckets,
        );

        expect(result.map((bucket) => bucket.count)).toEqual([1, 0, 0, 0, 0, 2]);
    });

    it('conta a ordem no mês de Brasília, não no do servidor UTC', () => {
        // 31/10 às 22:30 em Brasília = 01/11, 01:30 UTC. É outubro no gráfico.
        const result = countOrdersByMonth(
            [{ created_at: '2026-11-01T01:30:00Z' }],
            buckets,
        );

        const october = result.find((bucket) => bucket.monthKey === '2026-10');
        const november = result.find((bucket) => bucket.monthKey === '2026-11');

        expect(october?.count).toBe(1);
        expect(november?.count).toBe(0);
    });

    it('ignora ordem fora da janela em vez de contar no mês errado', () => {
        const result = countOrdersByMonth(
            [
                { created_at: brasilia('2026-05-31') },
                { created_at: brasilia('2026-07-01') },
            ],
            buckets,
        );

        expect(result.map((bucket) => bucket.count)).toEqual([0, 1, 0, 0, 0, 0]);
    });

    it('ignora created_at inválido', () => {
        const result = countOrdersByMonth([{ created_at: 'não é uma data' }], buckets);

        expect(result.every((bucket) => bucket.count === 0)).toBe(true);
    });

    it('não altera os baldes recebidos', () => {
        const original = getMonthlyBuckets(new Date('2026-11-10T12:00:00-03:00'));
        countOrdersByMonth([{ created_at: brasilia('2026-11-02') }], original);

        expect(original.every((bucket) => bucket.count === 0)).toBe(true);
    });
});

describe('getMonthKeyInTimeZone e getMonthShortName', () => {
    it('extrai a chave do mês no fuso do domínio', () => {
        expect(getMonthKeyInTimeZone('2026-11-01T01:30:00Z')).toBe('2026-10');
        expect(getMonthKeyInTimeZone(new Date('2026-07-15T12:00:00Z'))).toBe('2026-07');
    });

    it('devolve string vazia para data inválida', () => {
        expect(getMonthKeyInTimeZone('lixo')).toBe('');
    });

    it('converte a chave no rótulo de 3 letras', () => {
        expect(getMonthShortName('2026-01')).toBe('Jan');
        expect(getMonthShortName('2026-10')).toBe('Out');
        expect(getMonthShortName('2026-12')).toBe('Dez');
    });
});
