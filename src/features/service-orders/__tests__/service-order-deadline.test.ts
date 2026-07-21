import { describe, expect, it } from 'vitest';
import {
    addDaysToDateOnly,
    formatDateOnlyPtBr,
    getDateOnlyInTimeZone,
    isValidDateOnly,
} from '@/features/service-orders/service-order-deadline';

describe('Service order deadline utilities', () => {
    it.each([
        '2026-01-01',
        '2026-02-28',
        '2028-02-29',
        '2026-12-31',
    ])('aceita uma data de calendário válida: %s', (value) => {
        expect(isValidDateOnly(value)).toBe(true);
    });

    it.each([
        '2026-02-29',
        '2026-04-31',
        '2026-13-01',
        '2026-00-10',
        '21/07/2026',
        '2026-7-21',
        '',
    ])('rejeita uma data inválida: %s', (value) => {
        expect(isValidDateOnly(value)).toBe(false);
    });

    it('calcula datas futuras sem depender do fuso do servidor', () => {
        expect(addDaysToDateOnly('2026-12-28', 7)).toBe('2027-01-04');
    });

    it('obtém a data de São Paulo próxima da virada em UTC', () => {
        const date = new Date('2026-07-22T01:30:00.000Z');

        expect(getDateOnlyInTimeZone(date)).toBe('2026-07-21');
    });

    it('formata prazo para o histórico', () => {
        expect(formatDateOnlyPtBr('2026-07-21')).toBe('21/07/2026');
        expect(formatDateOnlyPtBr(null)).toBe('sem prazo');
    });
});
