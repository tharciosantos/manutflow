// @vitest-environment jsdom

import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EquipmentPicker } from '../equipment-picker';

/**
 * AUD-09: o formulário de nova ordem listava 50 equipamentos no máximo (a rota
 * capa `limit` em 50) e os mais antigos ficavam inacessíveis. O picker busca no
 * servidor; estes testes fixam o contrato com `/api/equipments`.
 */

function equipment(id: string, name: string, code: string) {
    return {
        id,
        name,
        patrimony_code: code,
        location: 'Setor C',
        status: 'active',
        user_id: 'u1',
        photo_url: null,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
    };
}

function mockFetchReturning(payload: unknown, ok = true) {
    const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function lastUrl(fetchMock: ReturnType<typeof vi.fn>) {
    return String(fetchMock.mock.calls.at(-1)?.[0]);
}

describe('EquipmentPicker (AUD-09)', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('busca no servidor com o termo digitado, e não a lista inteira', async () => {
        const fetchMock = mockFetchReturning({
            equipments: [equipment('e1', 'Compressor 50HP', 'COMP-001')],
            total: 1,
        });

        render(<EquipmentPicker value="" onChange={() => {}} />);

        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'compressor' } });

        await vi.advanceTimersByTimeAsync(400);

        await waitFor(() => {
            expect(screen.getByText('Compressor 50HP')).toBeInTheDocument();
        });

        const url = lastUrl(fetchMock);
        expect(url).toContain('/api/equipments?');
        expect(url).toContain('q=compressor');
        // A rota capa em 50; o picker pede só os 20 primeiros resultados.
        expect(url).toContain('limit=20');
        expect(url).not.toContain('limit=999');
    });

    it('entrega o id do equipamento escolhido', async () => {
        const onChange = vi.fn();
        mockFetchReturning({
            equipments: [equipment('e1', 'Compressor 50HP', 'COMP-001')],
            total: 1,
        });

        render(<EquipmentPicker value="" onChange={onChange} />);

        fireEvent.focus(screen.getByRole('combobox'));
        await vi.advanceTimersByTimeAsync(400);

        fireEvent.click(await screen.findByText('Compressor 50HP'));

        expect(onChange).toHaveBeenCalledWith('e1');
    });

    it('troca a busca pelo chip do equipamento escolhido e permite limpar', async () => {
        const onChange = vi.fn();
        mockFetchReturning({
            equipments: [equipment('e1', 'Compressor 50HP', 'COMP-001')],
            total: 1,
        });

        // Controlado como no formulário: o chip depende do `value` devolvido.
        function Controlled() {
            const [value, setValue] = useState('');
            return (
                <EquipmentPicker
                    value={value}
                    onChange={(id) => {
                        setValue(id);
                        onChange(id);
                    }}
                />
            );
        }

        render(<Controlled />);

        fireEvent.focus(screen.getByRole('combobox'));
        await vi.advanceTimersByTimeAsync(400);
        fireEvent.click(await screen.findByText('Compressor 50HP'));

        // Selecionado: o campo de busca dá lugar ao chip com os dados do ativo.
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.getByText('COMP-001')).toBeInTheDocument();
        expect(screen.getByText('Setor C')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Trocar equipamento/i }));

        expect(onChange).toHaveBeenLastCalledWith('');
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('sai do modo selecionado quando o formulário limpa o valor', async () => {
        mockFetchReturning({ equipments: [equipment('e1', 'Compressor 50HP', 'COMP-001')], total: 1 });

        // Controlado como no formulário: o pai devolve o id escolhido.
        function Controlled() {
            const [value, setValue] = useState('');
            return (
                <EquipmentPicker
                    value={value}
                    onChange={(id) => {
                        setValue(id);
                        if (id) queueMicrotask(() => setValue(''));
                    }}
                />
            );
        }

        render(<Controlled />);

        fireEvent.focus(screen.getByRole('combobox'));
        await vi.advanceTimersByTimeAsync(400);
        fireEvent.click(await screen.findByText('Compressor 50HP'));

        // O pai zera o valor logo depois: o chip não pode ficar preso na tela.
        await waitFor(() => {
            expect(screen.queryByText('COMP-001')).not.toBeInTheDocument();
        });
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('avisa que há mais resultados do que os exibidos', async () => {
        mockFetchReturning({
            equipments: [equipment('e1', 'Compressor 50HP', 'COMP-001')],
            total: 312,
        });

        render(<EquipmentPicker value="" onChange={() => {}} />);

        fireEvent.focus(screen.getByRole('combobox'));
        await vi.advanceTimersByTimeAsync(400);

        expect(await screen.findByText(/Mostrando 1 de 312/)).toBeInTheDocument();
    });

    it('mostra estado vazio quando a busca não encontra nada', async () => {
        mockFetchReturning({ equipments: [], total: 0 });

        render(<EquipmentPicker value="" onChange={() => {}} />);

        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'inexistente' } });
        await vi.advanceTimersByTimeAsync(400);

        expect(await screen.findByText('Nenhum equipamento encontrado.')).toBeInTheDocument();
    });

    it('mostra erro da API em vez de lista vazia', async () => {
        mockFetchReturning({ error: 'Erro ao buscar equipamentos.' }, false);

        render(<EquipmentPicker value="" onChange={() => {}} />);

        fireEvent.focus(screen.getByRole('combobox'));
        await vi.advanceTimersByTimeAsync(400);

        expect(await screen.findByText('Erro ao buscar equipamentos.')).toBeInTheDocument();
    });
});
