import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('@/lib/auth', () => ({
    getUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { DELETE, GET, PATCH } from '../route';

const ORDER_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

type QueryResult = {
    data?: unknown;
    error?: { message: string } | null;
};

function createQuery(result: QueryResult = { data: null, error: null }) {
    const normalizedResult = {
        data: result.data ?? null,
        error: result.error ?? null,
    };

    return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(normalizedResult),
        maybeSingle: vi.fn().mockResolvedValue(normalizedResult),
        insert: vi.fn().mockResolvedValue(normalizedResult),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    };
}

function createSupabaseMock(...queries: ReturnType<typeof createQuery>[]) {
    return {
        from: vi.fn().mockImplementation(() => queries.shift()),
        // A atualização de status/prazo passou a ser uma RPC transacional (AUD-04).
        rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
}

function routeContext(id = ORDER_ID) {
    return { params: Promise.resolve({ id }) };
}

function request(method = 'GET', body?: unknown) {
    return new Request('http://localhost/api/service-orders/order-1', {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

type AuthMockResult =
    | { user: { id: string }; supabase: ReturnType<typeof createSupabaseMock>; error: null }
    | { user: null; supabase: null; error: Response };

const getUserMock = vi.mocked(getUser) as Mock<() => Promise<AuthMockResult>>;

function authenticateWith(supabase: ReturnType<typeof createSupabaseMock>) {
    getUserMock.mockResolvedValue({
        user: { id: 'user-1' },
        supabase,
        error: null,
    });
}

function rejectAuthentication() {
    getUserMock.mockResolvedValue({
        user: null,
        supabase: null,
        error: new Response(JSON.stringify({ error: 'Não autorizado' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        }),
    });
}

describe('Service Orders Details API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29 });
    });

    describe('GET', () => {
        it('retorna 401 quando o usuário não está autenticado', async () => {
            rejectAuthentication();

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(401);
            await expect(response.json()).resolves.toEqual({ error: 'Não autorizado' });
        });

        it.each(['', 'order-1', 'abc', '123e4567-e89b-12d3-a456-42661417400'])(
            'retorna 400 quando o ID é inválido: %j',
            async (invalidId) => {
                authenticateWith(createSupabaseMock());

                const response = await GET(request(), routeContext(invalidId));

                expect(response.status).toBe(400);
                await expect(response.json()).resolves.toEqual({
                    error: 'ID da ordem de serviço inválido.',
                });
            },
        );

        it('retorna a ordem com histórico e aplica o isolamento por usuário', async () => {
            const serviceOrder = {
                id: ORDER_ID,
                title: 'Troca de rolamento',
                status: 'open',
                priority: 'high',
                due_date: '2026-07-30',
            };
            const history = [{ id: 'history-1', event_type: 'created' }];
            const orderQuery = createQuery({ data: serviceOrder });
            const historyQuery = createQuery({ data: history });
            const supabase = createSupabaseMock(orderQuery, historyQuery);
            authenticateWith(supabase);

            const response = await GET(request(), routeContext());
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.serviceOrder).toEqual({ ...serviceOrder, history });
            expect(supabase.from).toHaveBeenNthCalledWith(1, 'service_orders');
            expect(orderQuery.eq).toHaveBeenCalledWith('id', ORDER_ID);
            expect(orderQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(supabase.from).toHaveBeenNthCalledWith(2, 'service_order_history');
            expect(historyQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('retorna 404 quando a ordem não existe para o usuário', async () => {
            authenticateWith(createSupabaseMock(createQuery()));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(404);
        });

        it('retorna 500 quando a consulta da ordem falha', async () => {
            authenticateWith(createSupabaseMock(createQuery({ error: { message: 'DB error' } })));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao buscar ordem de serviço.',
            });
        });

        it('retorna 500 quando a consulta do histórico falha', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: { id: ORDER_ID } }),
                createQuery({ error: { message: 'History error' } }),
            ));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao buscar histórico da ordem.',
            });
        });
    });

    describe('PATCH', () => {
        it('retorna 401 quando o usuário não está autenticado', async () => {
            rejectAuthentication();

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(401);
            expect(checkRateLimit).not.toHaveBeenCalled();
        });

        it('retorna 429 quando o limite de requisições é excedido', async () => {
            authenticateWith(createSupabaseMock());
            vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(429);
            expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        });

        it('retorna 400 quando nenhum campo atualizável é enviado', async () => {
            authenticateWith(createSupabaseMock());

            const response = await PATCH(request('PATCH', {}), routeContext());

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'Nenhum campo válido para atualizar.',
            });
        });

        it.each([{ status: 'invalid' }, { status: 10 }])(
            'retorna 400 para um status inválido: %j',
            async (body) => {
                authenticateWith(createSupabaseMock());

                const response = await PATCH(request('PATCH', body), routeContext());

                expect(response.status).toBe(400);
                await expect(response.json()).resolves.toEqual({ error: 'Status inválido.' });
            },
        );

        it.each([
            { due_date: '2026-02-30' },
            { due_date: '30/07/2026' },
            { due_date: 123 },
        ])('retorna 400 para um prazo inválido: %j', async (body) => {
            authenticateWith(createSupabaseMock());

            const response = await PATCH(request('PATCH', body), routeContext());

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'Prazo inválido. Use uma data no formato AAAA-MM-DD.',
            });
        });

        it('retorna 404 quando a RPC não encontra a ordem para o usuário', async () => {
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({ data: null, error: null });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(404);
            await expect(response.json()).resolves.toEqual({
                error: 'Ordem de serviço não encontrada.',
            });
        });

        it('atualiza o status chamando a RPC transacional', async () => {
            const updatedOrder = { id: ORDER_ID, status: 'closed' };
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({ data: updatedOrder, error: null });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual(updatedOrder);
            expect(supabase.rpc).toHaveBeenCalledWith('update_service_order', {
                p_order_id: ORDER_ID,
                p_status: 'closed',
                p_due_date: null,
                p_set_due_date: false,
            });
        });

        it('atualiza o prazo sem tocar no status', async () => {
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({
                data: { id: ORDER_ID, status: 'open', due_date: '2026-07-30' },
                error: null,
            });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { due_date: '2026-07-30' }), routeContext());

            expect(response.status).toBe(200);
            expect(supabase.rpc).toHaveBeenCalledWith('update_service_order', {
                p_order_id: ORDER_ID,
                p_status: null,
                p_due_date: '2026-07-30',
                p_set_due_date: true,
            });
        });

        it('envia status e prazo na mesma chamada', async () => {
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({
                data: { id: ORDER_ID, status: 'in_progress', due_date: '2026-08-01' },
                error: null,
            });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', {
                status: 'in_progress',
                due_date: '2026-08-01',
            }), routeContext());

            expect(response.status).toBe(200);
            expect(supabase.rpc).toHaveBeenCalledWith('update_service_order', {
                p_order_id: ORDER_ID,
                p_status: 'in_progress',
                p_due_date: '2026-08-01',
                p_set_due_date: true,
            });
        });

        it('permite remover o prazo enviando p_set_due_date com valor nulo', async () => {
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({
                data: { id: ORDER_ID, status: 'open', due_date: null },
                error: null,
            });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { due_date: null }), routeContext());

            expect(response.status).toBe(200);
            expect(supabase.rpc).toHaveBeenCalledWith('update_service_order', {
                p_order_id: ORDER_ID,
                p_status: null,
                p_due_date: null,
                p_set_due_date: true,
            });
        });

        it('não chama a RPC quando o status é inválido', async () => {
            const supabase = createSupabaseMock();
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'arquivada' }), routeContext());

            expect(response.status).toBe(400);
            expect(supabase.rpc).not.toHaveBeenCalled();
        });

        it('retorna 500 quando a RPC falha', async () => {
            const supabase = createSupabaseMock();
            supabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao atualizar ordem de serviço.',
            });
        });
    });

    describe('DELETE', () => {
        it('retorna 401 quando o usuário não está autenticado', async () => {
            rejectAuthentication();

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(401);
            expect(checkRateLimit).not.toHaveBeenCalled();
        });

        it('retorna 429 quando o limite de requisições é excedido', async () => {
            authenticateWith(createSupabaseMock());
            vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(429);
            expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        });

        it('exclui a ordem aplicando o isolamento por usuário', async () => {
            const deleteQuery = createQuery({ data: { id: ORDER_ID } });
            const supabase = createSupabaseMock(deleteQuery);
            authenticateWith(supabase);

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual({
                message: 'Ordem de serviço excluída com sucesso.',
            });
            expect(deleteQuery.delete).toHaveBeenCalledOnce();
            expect(deleteQuery.eq).toHaveBeenCalledWith('id', ORDER_ID);
            expect(deleteQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
        });

        it('retorna 404 quando nenhuma ordem é excluída', async () => {
            authenticateWith(createSupabaseMock(createQuery()));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(404);
        });

        it('retorna 500 quando a exclusão falha', async () => {
            authenticateWith(createSupabaseMock(createQuery({ error: { message: 'Delete error' } })));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao excluir ordem de serviço.',
            });
        });
    });
});
