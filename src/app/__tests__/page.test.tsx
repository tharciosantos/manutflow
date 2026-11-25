// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * AUD-07: a home decidia a sessão no browser e o HTML inicial era
 * "Carregando...". O teste fixa o contrato novo: `Home` é async e serve a
 * landing (visitante) ou o dashboard (autenticado) já no servidor.
 */

const getUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: async () => ({ auth: { getUser } }),
}));

vi.mock('next/link', () => ({
    default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

// A landing traz client components com estado próprio (simulador, tema);
// aqui interessa que ela seja escolhida e renderizada, não o comportamento interno.
vi.mock('@/components/landing/landing-header', () => ({
    LandingHeader: () => <header data-testid="landing-header" />,
}));
vi.mock('@/components/landing/demo-maintenance-flow', () => ({
    DemoMaintenanceFlow: () => <div data-testid="demo-flow" />,
}));
vi.mock('@/components/ui/status-card', () => ({
    StatusCard: () => null,
}));
vi.mock('@/features/dashboard/dashboard-overview', () => ({
    DashboardOverview: () => <div data-testid="dashboard-overview" />,
}));
vi.mock('@/components/layout/app-shell', () => ({
    AppShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/layout/app-header', () => ({
    AppHeader: () => null,
}));

import Home from '../page';

describe('Home (AUD-07)', () => {
    beforeEach(() => {
        getUser.mockReset();
    });

    it('serve a landing no servidor para visitante, sem passar por estado de carregamento', async () => {
        getUser.mockResolvedValue({ data: { user: null } });

        const ui = await Home();
        render(ui);

        expect(screen.getByTestId('landing-header')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: /Controle total de ativos/i }),
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Capacidades da Plataforma/i })).toBeInTheDocument();
        expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    });

    it('serve o dashboard para usuário autenticado', async () => {
        getUser.mockResolvedValue({
            data: {
                user: {
                    id: 'u1',
                    email: 'tecnico@manutflow.com',
                    user_metadata: { full_name: 'Ana Técnica' },
                },
            },
        });

        const ui = await Home();
        render(ui);

        expect(screen.getByRole('heading', { name: /Olá, Ana Técnica/i })).toBeInTheDocument();
        expect(screen.getByTestId('dashboard-overview')).toBeInTheDocument();
        expect(screen.queryByTestId('landing-header')).not.toBeInTheDocument();
    });

    it('usa o prefixo do e-mail quando não há nome no metadata', async () => {
        getUser.mockResolvedValue({
            data: { user: { id: 'u2', email: 'gestor@manutflow.com', user_metadata: {} } },
        });

        const ui = await Home();
        render(ui);

        expect(screen.getByRole('heading', { name: /Olá, gestor/i })).toBeInTheDocument();
    });
});
