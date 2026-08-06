import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    };
}

function routeContext(id = 'order-1') {
    return { params: Promise.resolve({ id }) };
}

function request(method = 'GET', body?: unknown) {
    return new Request('http://localhost/api/service-orders/order-1', {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function authenticateWith(supabase: ReturnType<typeof createSupabaseMock>) {
    vi.mocked(getUser).mockResolvedValue({
        user: { id: 'user-1' },
        supabase,
        error: null,
} as unknown as Awaited<ReturnType<typeof getUser>>);
}

function rejectAuthentication() {
    vi.mocked(getUser).mockResolvedValue({
        user: null,
        supabase: null,
        error: new Response(JSON.stringify({ error: 'Não autorizado' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        }),
    } as unknown as Awaited<ReturnType<typeof getUser>>);
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

        it('retorna 400 quando o ID não é informado', async () => {
            authenticateWith(createSupabaseMock());

            const response = await GET(request(), routeContext(''));

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'ID da ordem de serviço não informado.',
            });
        });

        it('retorna a ordem com histórico e aplica o isolamento por usuário', async () => {
            const serviceOrder = {
                id: 'order-1',
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
            expect(orderQuery.eq).toHaveBeenCalledWith('id', 'order-1');
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
                createQuery({ data: { id: 'order-1' } }),
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

        it('retorna 404 quando a ordem atual não existe para o usuário', async () => {
            authenticateWith(createSupabaseMock(createQuery()));

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(404);
        });

        it('registra o histórico antes de atualizar o status', async () => {
            const currentQuery = createQuery({ data: { id: 'order-1', status: 'open' } });
            const historyQuery = createQuery();
            const updatedOrder = { id: 'order-1', status: 'closed' };
            const updateQuery = createQuery({ data: updatedOrder });
            const supabase = createSupabaseMock(currentQuery, historyQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual(updatedOrder);
            expect(supabase.from.mock.calls.map(([table]) => table)).toEqual([
                'service_orders',
                'service_order_history',
                'service_orders',
            ]);
            expect(currentQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(historyQuery.insert).toHaveBeenCalledWith({
                service_order_id: 'order-1',
                user_id: 'user-1',
                event_type: 'status_changed',
                previous_status: 'open',
                new_status: 'closed',
                description: 'Status alterado de open para closed.',
            });
            expect(updateQuery.update).toHaveBeenCalledWith({ status: 'closed' });
            expect(updateQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
        });

        it('não cria histórico quando o status permanece igual', async () => {
            const currentQuery = createQuery({ data: { id: 'order-1', status: 'open' } });
            const updateQuery = createQuery({ data: { id: 'order-1', status: 'open' } });
            const supabase = createSupabaseMock(currentQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'open' }), routeContext());

            expect(response.status).toBe(200);
            expect(supabase.from).toHaveBeenCalledTimes(2);
            expect(supabase.from).not.toHaveBeenCalledWith('service_order_history');
        });

        it('registra no histórico a alteração do prazo', async () => {
            const currentQuery = createQuery({
                data: { id: 'order-1', status: 'open', due_date: '2026-07-20' },
            });
            const historyQuery = createQuery();
            const updatedOrder = { id: 'order-1', status: 'open', due_date: '2026-07-30' };
            const updateQuery = createQuery({ data: updatedOrder });
            const supabase = createSupabaseMock(currentQuery, historyQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(
                request('PATCH', { due_date: '2026-07-30' }),
                routeContext(),
            );

            expect(response.status).toBe(200);
            expect(historyQuery.insert).toHaveBeenCalledWith({
                service_order_id: 'order-1',
                user_id: 'user-1',
                event_type: 'due_date_changed',
                previous_status: null,
                new_status: null,
                description: 'Prazo alterado de 20/07/2026 para 30/07/2026.',
            });
            expect(updateQuery.update).toHaveBeenCalledWith({ due_date: '2026-07-30' });
        });

        it('permite remover o prazo da ordem', async () => {
            const currentQuery = createQuery({
                data: { id: 'order-1', status: 'open', due_date: '2026-07-30' },
            });
            const historyQuery = createQuery();
            const updateQuery = createQuery({ data: { id: 'order-1', due_date: null } });
            const supabase = createSupabaseMock(currentQuery, historyQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { due_date: null }), routeContext());

            expect(response.status).toBe(200);
            expect(historyQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
                event_type: 'due_date_changed',
                description: 'Prazo alterado de 30/07/2026 para sem prazo.',
            }));
            expect(updateQuery.update).toHaveBeenCalledWith({ due_date: null });
        });

        it('registra status e prazo em uma única inserção de histórico', async () => {
            const currentQuery = createQuery({
                data: { id: 'order-1', status: 'open', due_date: null },
            });
            const historyQuery = createQuery();
            const updateQuery = createQuery({
                data: { id: 'order-1', status: 'in_progress', due_date: '2026-08-01' },
            });
            const supabase = createSupabaseMock(currentQuery, historyQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', {
                status: 'in_progress',
                due_date: '2026-08-01',
            }), routeContext());

            expect(response.status).toBe(200);
            expect(historyQuery.insert).toHaveBeenCalledWith([
                expect.objectContaining({ event_type: 'status_changed' }),
                expect.objectContaining({ event_type: 'due_date_changed' }),
            ]);
            expect(updateQuery.update).toHaveBeenCalledWith({
                status: 'in_progress',
                due_date: '2026-08-01',
            });
        });

        it('não atualiza o status quando o histórico falha', async () => {
            const currentQuery = createQuery({ data: { id: 'order-1', status: 'open' } });
            const historyQuery = createQuery({ error: { message: 'History error' } });
            const supabase = createSupabaseMock(currentQuery, historyQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', { status: 'closed' }), routeContext());

            expect(response.status).toBe(500);
            expect(supabase.from).toHaveBeenCalledTimes(2);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao registrar histórico. Alterações não foram aplicadas.',
            });
        });

        it('retorna 500 quando a atualização falha', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: { id: 'order-1', status: 'open' } }),
                createQuery(),
                createQuery({ error: { message: 'Update error' } }),
            ));

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
            const deleteQuery = createQuery({ data: { id: 'order-1' } });
            const supabase = createSupabaseMock(deleteQuery);
            authenticateWith(supabase);

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual({
                message: 'Ordem de serviço excluída com sucesso.',
            });
            expect(deleteQuery.delete).toHaveBeenCalledOnce();
            expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'order-1');
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
