import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

import { POST } from '../route';

const signInWithPassword = vi.fn();

function request(headers?: Record<string, string>) {
    return new Request('http://localhost/api/demo-login', {
        method: 'POST',
        headers,
    });
}

describe('POST /api/demo-login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 4 });
        signInWithPassword.mockResolvedValue({ error: null });
        vi.mocked(createClient).mockResolvedValue({
            auth: { signInWithPassword },
        } as unknown as Awaited<ReturnType<typeof createClient>>);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('cria a sessão com as credenciais do ambiente', async () => {
        vi.stubEnv('DEMO_EMAIL', 'demo@exemplo.com');
        vi.stubEnv('DEMO_PASSWORD', 'senha-do-ambiente');

        const response = await POST(request());

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(signInWithPassword).toHaveBeenCalledWith({
            email: 'demo@exemplo.com',
            password: 'senha-do-ambiente',
        });
    });

    it('usa o e-mail padrão quando DEMO_EMAIL está vazio', async () => {
        vi.stubEnv('DEMO_EMAIL', '');
        vi.stubEnv('DEMO_PASSWORD', 'senha-do-ambiente');

        await POST(request());

        expect(signInWithPassword).toHaveBeenCalledWith({
            email: 'demo@manutflow.com',
            password: 'senha-do-ambiente',
        });
    });

    it('responde 503 e não tenta autenticar quando DEMO_PASSWORD não está definida', async () => {
        vi.stubEnv('DEMO_PASSWORD', '');

        const response = await POST(request());

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
            error: 'Demonstração indisponível no momento.',
        });
        expect(createClient).not.toHaveBeenCalled();
        expect(logger).toHaveBeenCalledWith(
            'error',
            'demo_login.missing_env',
            expect.objectContaining({ vars: ['DEMO_PASSWORD'] }),
        );
    });

    it('limita por IP e responde 429 sem tentar autenticar', async () => {
        vi.stubEnv('DEMO_PASSWORD', 'senha-do-ambiente');
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

        const response = await POST(request({ 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }));

        expect(response.status).toBe(429);
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(checkRateLimit).toHaveBeenCalledWith('demo-login:203.0.113.10', 5, 60_000);
        expect(signInWithPassword).not.toHaveBeenCalled();
    });

    it('responde 401 quando o Supabase recusa as credenciais', async () => {
        vi.stubEnv('DEMO_PASSWORD', 'senha-errada');
        signInWithPassword.mockResolvedValue({
            error: { message: 'Invalid login', status: 400, code: 'invalid_credentials' },
        });

        const response = await POST(request());

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            error: 'Demonstração indisponível no momento.',
        });
    });
});
