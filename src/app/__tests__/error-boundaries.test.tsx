// @vitest-environment jsdom

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// AUD-23: as três telas do App Router são simples, mas são o último recurso
// quando algo quebra. O teste garante que renderizam e que o "Tentar novamente"
// chama o `reset` — o contrato que o Next exige do error boundary.
vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

import ErrorBoundary from '../error';
import NotFound from '../not-found';
import Loading from '../loading';

describe('App Router fallbacks (AUD-23)', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('error.tsx mostra a mensagem, o digest e chama reset ao tentar novamente', () => {
        const reset = vi.fn();
        const error = Object.assign(new Error('boom'), { digest: 'abc123' });

        render(<ErrorBoundary error={error} reset={reset} />);

        expect(screen.getByRole('heading', { name: /Algo deu errado/i })).toBeInTheDocument();
        expect(screen.getByText(/Código do erro: abc123/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('error.tsx registra o digest no console para correlacionar com o log do servidor', () => {
        const error = Object.assign(new Error('boom'), { digest: 'digest-1' });

        render(<ErrorBoundary error={error} reset={vi.fn()} />);

        expect(console.warn).toHaveBeenCalledWith('[error-boundary]', 'digest-1');
    });

    it('error.tsx funciona sem digest (erro de client component)', () => {
        render(<ErrorBoundary error={new Error('client boom')} reset={vi.fn()} />);

        expect(screen.queryByText(/Código do erro/)).not.toBeInTheDocument();
    });

    it('not-found.tsx oferece caminho de volta', () => {
        render(<NotFound />);

        expect(screen.getByRole('heading', { name: /Página não encontrada/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ir para o início/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /Ver equipamentos/i })).toHaveAttribute(
            'href',
            '/equipamentos',
        );
    });

    it('loading.tsx anuncia o estado de carregamento para leitores de tela', () => {
        render(<Loading />);

        expect(screen.getByRole('status')).toHaveTextContent(/Carregando/);
    });
});
