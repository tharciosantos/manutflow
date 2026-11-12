import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
    upsert: vi.fn(),
    from: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: dbMocks.from,
    })),
}));

vi.mock('@/lib/logger', () => ({
    logger: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { GET } from '../route';

function request(authorization?: string) {
    const headers: Record<string, string> = {};
    if (authorization !== undefined) {
        headers.authorization = authorization;
    }

    return new Request('http://localhost/api/cron/keep-alive', {
        method: 'GET',
        headers,
    });
}

describe('GET /api/cron/keep-alive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('CRON_SECRET', 'cron-secret-seguro');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');

        dbMocks.upsert.mockResolvedValue({ error: null });
        dbMocks.from.mockReturnValue({
            upsert: dbMocks.upsert,
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('retorna 503 quando CRON_SECRET não está definida', async () => {
        vi.stubEnv('CRON_SECRET', '');

        const response = await GET(request('Bearer qualquer'));

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
            error: 'Cron keep-alive não configurado.',
        });
        expect(createClient).not.toHaveBeenCalled();
        expect(logger).toHaveBeenCalledWith(
            'error',
            'cron_keep_alive.missing_env',
            { vars: ['CRON_SECRET'] },
        );
    });

    it('retorna 401 quando o header Authorization está ausente ou inválido', async () => {
        const cases = [
            undefined,
            '',
            'Basic abc',
            'Bearer curto',
            'Bearer cron-secret-errado',
        ];

        for (const authHeader of cases) {
            const response = await GET(request(authHeader));

            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toEqual({
                error: 'Não autorizado.',
            });
        }

        expect(createClient).not.toHaveBeenCalled();
        expect(logger).toHaveBeenCalledWith('warn', 'cron_keep_alive.unauthorized');
    });

    it('retorna 500 quando as variáveis do Supabase não estão configuradas', async () => {
        vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

        const response = await GET(request('Bearer cron-secret-seguro'));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: 'Erro de configuração do servidor.',
        });
        expect(createClient).not.toHaveBeenCalled();
    });

    it('retorna 500 quando o upsert no banco falha', async () => {
        dbMocks.upsert.mockResolvedValue({ error: { message: 'connection timeout' } });

        const response = await GET(request('Bearer cron-secret-seguro'));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: 'Erro ao registrar keep-alive no banco.',
        });
        expect(logger).toHaveBeenCalledWith('error', 'cron_keep_alive.db_error', {
            error: 'connection timeout',
        });
    });

    it('atualiza o heartbeat em public.keep_alive e retorna 200 quando autorizado', async () => {
        const response = await GET(request('Bearer cron-secret-seguro'));
        const body = (await response.json()) as { ok: boolean; timestamp: string };

        expect(response.status).toBe(200);
        expect(body.ok).toBe(true);
        expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);

        expect(createClient).toHaveBeenCalledWith(
            'https://project.supabase.co',
            'service-role-key',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        );
        expect(dbMocks.from).toHaveBeenCalledWith('keep_alive');
        expect(dbMocks.upsert).toHaveBeenCalledWith(
            { id: 1, last_ping_at: body.timestamp },
            { onConflict: 'id' },
        );
        expect(logger).toHaveBeenCalledWith('info', 'cron_keep_alive.success', {
            timestamp: body.timestamp,
        });
    });
});
