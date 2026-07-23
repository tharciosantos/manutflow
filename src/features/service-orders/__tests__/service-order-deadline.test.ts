import { describe, expect, it } from 'vitest';
import {
    addDaysToDateOnly,
    formatDateOnlyPtBr,
    getDateOnlyInTimeZone,
    getServiceOrderDeadlineInfo,
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

    it.each([
        [null, 'open', 'none', 'Sem prazo'],
        ['2026-07-19', 'open', 'overdue', 'Atrasada há 2 dias'],
        ['2026-07-20', 'in_progress', 'overdue', 'Atrasada há 1 dia'],
        ['2026-07-21', 'open', 'today', 'Vence hoje'],
        ['2026-07-22', 'in_progress', 'upcoming', 'Vence em 1 dia'],
        ['2026-07-28', 'open', 'upcoming', 'Vence em 7 dias'],
        ['2026-07-19', 'closed', 'closed', 'Prazo 19/07/2026'],
    ] as const)(
        'classifica o prazo %s de uma ordem %s como %s',
        (dueDate, status, state, label) => {
            const result = getServiceOrderDeadlineInfo(
                dueDate,
                status,
                new Date('2026-07-22T01:30:00.000Z'),
            );

            expect(result).toEqual({ state, label });
        },
    );
});
