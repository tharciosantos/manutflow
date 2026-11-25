import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
    getUser: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { GET, PATCH } from '../route';

const profile = {
    id: 'user-1',
    email: 'tecnico@manutflow.com',
    full_name: 'Técnico Demo',
    phone: '+55 11 99999-0000',
    role: 'Mecânico',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

/**
 * Encadeamento mínimo do client Supabase para `profiles`: o GET termina em
 * `maybeSingle()` e o PATCH em `single()`. Os dois são configuráveis por teste.
 */
function createMockSupabase(
    maybeSingle: unknown = { data: null, error: null },
    single: unknown = maybeSingle,
) {
    const chain = {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue(maybeSingle),
        single: vi.fn().mockResolvedValue(single),
    };

    return { from: vi.fn().mockReturnValue(chain), ...chain };
}

function authenticatedWith(supabase: unknown) {
    vi.mocked(getUser).mockResolvedValue({
        user: { id: 'user-1' },
        supabase,
        error: null,
    } as unknown as Awaited<ReturnType<typeof getUser>>);
}

function unauthorized() {
    vi.mocked(getUser).mockResolvedValue({
        user: null,
        supabase: null,
        error: new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 }),
    } as unknown as Awaited<ReturnType<typeof getUser>>);
}

function patchRequest(body: unknown) {
    return new Request('http://localhost/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('Profile API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('retorna 401 quando não autenticado', async () => {
            unauthorized();

            const response = await GET();

            expect(response.status).toBe(401);
        });

        it('devolve o perfil embrulhado em { profile }', async () => {
            authenticatedWith(createMockSupabase({ data: profile, error: null }));

            const response = await GET();
            const body = await response.json();

            expect(response.status).toBe(200);
            // Contrato do §8.3: exatamente { profile }.
            expect(Object.keys(body)).toEqual(['profile']);
            expect(body.profile).toEqual(profile);
        });

        it('retorna 404 quando o perfil não existe', async () => {
            authenticatedWith(createMockSupabase({ data: null, error: null }));

            const response = await GET();

            expect(response.status).toBe(404);
            await expect(response.json()).resolves.toEqual({ error: 'Perfil não encontrado.' });
        });

        it('retorna 500 e loga no formato estruturado quando o banco falha', async () => {
            authenticatedWith(createMockSupabase({ data: null, error: { message: 'boom' } }));

            const response = await GET();

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({ error: 'Erro ao carregar perfil.' });
            expect(logger).toHaveBeenCalledWith('error', 'api.error', {
                route: 'profile',
                method: 'GET',
                error: 'boom',
            });
        });
    });

    describe('PATCH', () => {
        it('retorna 401 quando não autenticado', async () => {
            unauthorized();

            const response = await PATCH(patchRequest({ full_name: 'Novo Nome' }));

            expect(response.status).toBe(401);
        });

        it('rejeita JSON inválido', async () => {
            authenticatedWith(createMockSupabase());
            const request = new Request('http://localhost/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: '{',
            });

            const response = await PATCH(request);

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({ error: 'JSON inválido.' });
        });

        it('rejeita campos acima do limite de tamanho', async () => {
            authenticatedWith(createMockSupabase());

            const response = await PATCH(patchRequest({ role: 'A'.repeat(101) }));

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'O cargo deve ter no máximo 100 caracteres.',
            });
        });

        it('rejeita requisição sem campo atualizável', async () => {
            authenticatedWith(createMockSupabase());

            const response = await PATCH(patchRequest({}));

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({ error: 'Nenhum campo para atualizar.' });
        });

        it('atualiza os campos enviados e devolve { profile }', async () => {
            const updated = { ...profile, full_name: 'Novo Nome' };
            const supabase = createMockSupabase(null, { data: updated, error: null });
            authenticatedWith(supabase);

            const response = await PATCH(patchRequest({ full_name: '  Novo Nome  ' }));
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(Object.keys(body)).toEqual(['profile']);
            expect(body.profile).toEqual(updated);
            // Queries de dados filtram pelo dono (AGENTS.md §7.5).
            expect(supabase.eq).toHaveBeenCalledWith('id', 'user-1');
            expect(supabase.update).toHaveBeenCalledWith({ full_name: 'Novo Nome' });
        });

        it('retorna 500 quando o banco falha', async () => {
            authenticatedWith(createMockSupabase(null, { data: null, error: { message: 'boom' } }));

            const response = await PATCH(patchRequest({ phone: '1234' }));

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({ error: 'Erro ao atualizar perfil.' });
        });
    });
});
