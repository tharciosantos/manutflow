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

vi.mock('@/lib/equipment-photo-storage', () => ({
    removeEquipmentPhotoByUrl: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { removeEquipmentPhotoByUrl } from '@/lib/equipment-photo-storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { DELETE, GET, PATCH } from '../route';

type QueryError = {
    message: string;
    code?: string;
};

type QueryResult = {
    data?: unknown;
    error?: QueryError | null;
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
        limit: vi.fn().mockResolvedValue(normalizedResult),
        maybeSingle: vi.fn().mockResolvedValue(normalizedResult),
        single: vi.fn().mockResolvedValue(normalizedResult),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    };
}

function createSupabaseMock(...queries: ReturnType<typeof createQuery>[]) {
    return {
        from: vi.fn().mockImplementation(() => queries.shift()),
    };
}

function routeContext(id = 'equipment-1') {
    return { params: Promise.resolve({ id }) };
}

function request(method = 'GET', body?: unknown) {
    return new Request('http://localhost/api/equipments/equipment-1', {
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
    } as Awaited<ReturnType<typeof getUser>>);
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

describe('Equipments Details API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29 });
        vi.mocked(removeEquipmentPhotoByUrl).mockResolvedValue({ ok: true });
    });

    describe('GET', () => {
        it('retorna 401 quando o usuário não está autenticado', async () => {
            rejectAuthentication();

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(401);
        });

        it('retorna 400 quando o ID não é informado', async () => {
            authenticateWith(createSupabaseMock());

            const response = await GET(request(), routeContext(''));

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({
                error: 'ID do equipamento é obrigatório.',
            });
        });

        it('retorna o equipamento com suas ordens e aplica isolamento por usuário', async () => {
            const equipment = {
                id: 'equipment-1',
                name: 'Compressor',
                patrimony_code: 'PAT-001',
                location: 'Galpão',
                status: 'active',
            };
            const serviceOrders = [{ id: 'order-1', title: 'Revisão', status: 'open' }];
            const equipmentQuery = createQuery({ data: equipment });
            const ordersQuery = createQuery({ data: serviceOrders });
            const supabase = createSupabaseMock(equipmentQuery, ordersQuery);
            authenticateWith(supabase);

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual({ equipment, serviceOrders });
            expect(supabase.from).toHaveBeenNthCalledWith(1, 'equipments');
            expect(equipmentQuery.eq).toHaveBeenCalledWith('id', 'equipment-1');
            expect(equipmentQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(supabase.from).toHaveBeenNthCalledWith(2, 'service_orders');
            expect(ordersQuery.eq).toHaveBeenCalledWith('equipment_id', 'equipment-1');
            expect(ordersQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(ordersQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
        });

        it('retorna 404 quando o equipamento não existe para o usuário', async () => {
            authenticateWith(createSupabaseMock(createQuery()));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(404);
        });

        it('retorna 500 quando a consulta do equipamento falha', async () => {
            authenticateWith(createSupabaseMock(createQuery({ error: { message: 'DB error' } })));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({ error: 'Erro ao buscar equipamento.' });
        });

        it('retorna 500 quando a consulta das ordens vinculadas falha', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: { id: 'equipment-1' } }),
                createQuery({ error: { message: 'Orders error' } }),
            ));

            const response = await GET(request(), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao buscar ordens vinculadas ao equipamento.',
            });
        });
    });

    describe('PATCH', () => {
        const existingEquipment = {
            id: 'equipment-1',
            patrimony_code: 'PAT-001',
        };

        it('retorna 401 quando o usuário não está autenticado', async () => {
            rejectAuthentication();

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext());

            expect(response.status).toBe(401);
        });

        it('retorna 400 quando o ID não é informado', async () => {
            authenticateWith(createSupabaseMock());

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext(''));

            expect(response.status).toBe(400);
        });

        it('retorna 500 quando a consulta do equipamento atual falha', async () => {
            authenticateWith(createSupabaseMock(createQuery({ error: { message: 'DB error' } })));

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext());

            expect(response.status).toBe(500);
        });

        it('retorna 404 quando o equipamento não existe para o usuário', async () => {
            authenticateWith(createSupabaseMock(createQuery()));

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext());

            expect(response.status).toBe(404);
        });

        it('retorna 400 quando o JSON é inválido', async () => {
            authenticateWith(createSupabaseMock(createQuery({ data: existingEquipment })));
            const invalidRequest = new Request('http://localhost/api/equipments/equipment-1', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: '{invalid',
            });

            const response = await PATCH(invalidRequest, routeContext());

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({ error: 'JSON inválido.' });
        });

        it.each([
            [{ name: '' }, 'O nome do equipamento é obrigatório.'],
            [{ name: 'A'.repeat(256) }, 'Nome deve ter no máximo 255 caracteres.'],
            [{ patrimony_code: '' }, 'O código de patrimônio é obrigatório.'],
            [{ patrimony_code: 'A'.repeat(101) }, 'Código de patrimônio deve ter no máximo 100 caracteres.'],
            [{ location: '' }, 'A localização é obrigatória.'],
            [{ location: 'A'.repeat(256) }, 'Localização deve ter no máximo 255 caracteres.'],
            [{ status: 'broken' }, 'Status inválido.'],
            [{ unknown: 'value' }, 'Nenhum campo válido para atualizar.'],
        ])('valida o payload de atualização: %j', async (body, error) => {
            authenticateWith(createSupabaseMock(createQuery({ data: existingEquipment })));

            const response = await PATCH(request('PATCH', body), routeContext());

            expect(response.status).toBe(400);
            await expect(response.json()).resolves.toEqual({ error });
        });

        it('retorna 409 quando o novo patrimônio já pertence a outro equipamento', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: existingEquipment }),
                createQuery({ data: { id: 'equipment-2' } }),
            ));

            const response = await PATCH(
                request('PATCH', { patrimony_code: 'PAT-002' }),
                routeContext(),
            );

            expect(response.status).toBe(409);
            await expect(response.json()).resolves.toEqual({
                error: 'Já existe um equipamento com esse código de patrimônio.',
            });
        });

        it('atualiza campos válidos e mantém o isolamento por usuário', async () => {
            const existingQuery = createQuery({ data: existingEquipment });
            const duplicateQuery = createQuery();
            const updatedEquipment = {
                id: 'equipment-1',
                name: 'Compressor principal',
                patrimony_code: 'PAT-002',
                location: 'Galpão 2',
                status: 'maintenance',
                photo_url: null,
            };
            const updateQuery = createQuery({ data: updatedEquipment });
            const supabase = createSupabaseMock(existingQuery, duplicateQuery, updateQuery);
            authenticateWith(supabase);

            const response = await PATCH(request('PATCH', {
                name: '  Compressor principal  ',
                patrimony_code: ' PAT-002 ',
                location: '  Galpão 2 ',
                status: 'maintenance',
                photo_url: null,
            }), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual({ equipment: updatedEquipment });
            expect(existingQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(duplicateQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(updateQuery.update).toHaveBeenCalledWith({
                name: 'Compressor principal',
                patrimony_code: 'PAT-002',
                location: 'Galpão 2',
                status: 'maintenance',
                photo_url: null,
            });
            expect(updateQuery.eq).toHaveBeenCalledWith('id', 'equipment-1');
            expect(updateQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
        });

        it('não consulta duplicidade quando o patrimônio permanece igual', async () => {
            const updateQuery = createQuery({ data: existingEquipment });
            const supabase = createSupabaseMock(
                createQuery({ data: existingEquipment }),
                updateQuery,
            );
            authenticateWith(supabase);

            const response = await PATCH(
                request('PATCH', { patrimony_code: 'PAT-001' }),
                routeContext(),
            );

            expect(response.status).toBe(200);
            expect(supabase.from).toHaveBeenCalledTimes(2);
        });

        it('remove a foto anterior depois de atualizar o equipamento', async () => {
            const oldPhotoUrl = 'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-1/old.jpg';
            const newPhotoUrl = 'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-1/new.jpg';
            authenticateWith(createSupabaseMock(
                createQuery({ data: { ...existingEquipment, photo_url: oldPhotoUrl } }),
                createQuery({ data: { ...existingEquipment, photo_url: newPhotoUrl } }),
            ));

            const response = await PATCH(
                request('PATCH', { photo_url: newPhotoUrl }),
                routeContext(),
            );

            expect(response.status).toBe(200);
            expect(removeEquipmentPhotoByUrl).toHaveBeenCalledWith(oldPhotoUrl, 'user-1');
        });

        it('retorna 409 quando o banco identifica patrimônio duplicado no update', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: existingEquipment }),
                createQuery({ error: { message: 'Duplicate', code: '23505' } }),
            ));

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext());

            expect(response.status).toBe(409);
        });

        it('retorna 500 quando a atualização falha', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: existingEquipment }),
                createQuery({ error: { message: 'Update error' } }),
            ));

            const response = await PATCH(request('PATCH', { name: 'Compressor' }), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({ error: 'Erro ao atualizar equipamento.' });
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

        it('retorna 400 quando o ID não é informado', async () => {
            authenticateWith(createSupabaseMock());

            const response = await DELETE(request('DELETE'), routeContext(''));

            expect(response.status).toBe(400);
        });

        it('retorna 500 quando a consulta de vínculos falha', async () => {
            authenticateWith(createSupabaseMock(createQuery({ error: { message: 'Orders error' } })));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({
                error: 'Erro ao verificar ordens vinculadas ao equipamento.',
            });
        });

        it('retorna 409 quando existem ordens vinculadas', async () => {
            authenticateWith(createSupabaseMock(createQuery({ data: [{ id: 'order-1' }] })));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(409);
            await expect(response.json()).resolves.toEqual({
                error: 'Não é possível excluir este equipamento porque ele possui ordens de serviço vinculadas.',
            });
        });

        it('exclui o equipamento aplicando isolamento por usuário', async () => {
            const linkedOrdersQuery = createQuery({ data: [] });
            const photoUrl = 'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-1/photo.jpg';
            const deleteQuery = createQuery({ data: { id: 'equipment-1', photo_url: photoUrl } });
            const supabase = createSupabaseMock(linkedOrdersQuery, deleteQuery);
            authenticateWith(supabase);

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual({
                message: 'Equipamento excluído com sucesso.',
            });
            expect(linkedOrdersQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(deleteQuery.delete).toHaveBeenCalledOnce();
            expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'equipment-1');
            expect(deleteQuery.eq).toHaveBeenCalledWith('user_id', 'user-1');
            expect(removeEquipmentPhotoByUrl).toHaveBeenCalledWith(photoUrl, 'user-1');
        });

        it('retorna 500 quando a exclusão falha', async () => {
            authenticateWith(createSupabaseMock(
                createQuery({ data: [] }),
                createQuery({ error: { message: 'Delete error' } }),
            ));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(500);
            await expect(response.json()).resolves.toEqual({ error: 'Erro ao excluir equipamento.' });
        });

        it('retorna 403 quando nenhum equipamento é excluído', async () => {
            authenticateWith(createSupabaseMock(createQuery({ data: [] }), createQuery()));

            const response = await DELETE(request('DELETE'), routeContext());

            expect(response.status).toBe(403);
        });
    });
});
