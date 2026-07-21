import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { GET, POST } from '../route';

function createMockSupabase(data?: unknown, error: unknown = null) {
  const resultWithCount = { data: data ?? [], count: Array.isArray(data) ? (data as unknown[]).length : 0, error };

  const chainableMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(resultWithCount),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  chainableMock.range.mockResolvedValue(resultWithCount);
  chainableMock.single.mockResolvedValue({ data: data ?? null, error });

  return {
    from: vi.fn().mockReturnValue(chainableMock),
    ...chainableMock,
  };
}

describe('Service Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: null,
        supabase: null,
        error: new Response(JSON.stringify({ error: 'Não autorizado' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      });

      const request = new Request('http://localhost/api/service-orders?page=1&limit=10');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Não autorizado');
    });

    it('deve retornar lista de ordens quando autenticado', async () => {
      const mockOrders = [
        {
          id: '1',
          title: 'Manutenção preventiva',
          description: 'Troca de peças',
          status: 'open',
          priority: 'high',
          equipment_id: 'eq-1',
          due_date: '2026-07-30',
          created_at: '2024-01-01T00:00:00Z',
          equipment: {
            id: 'eq-1',
            name: 'Notebook Dell',
            patrimony_code: 'PAT-001',
            location: 'Sala 101',
            status: 'active',
          },
        },
      ];

      const mockSupabase = createMockSupabase(mockOrders);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders?page=1&limit=10');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.serviceOrders).toHaveLength(1);
      expect(body.serviceOrders[0].title).toBe('Manutenção preventiva');
      expect(body.serviceOrders[0].equipment.name).toBe('Notebook Dell');
      expect(body.total).toBe(1);
      expect(body.page).toBe(1);
      expect(body.totalPages).toBe(1);
    });

    it('deve combinar filtro de atraso com isolamento de ordens fechadas', async () => {
      const mockSupabase = createMockSupabase([]);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const response = await GET(new Request(
        'http://localhost/api/service-orders?deadline=overdue&status=open&priority=high',
      ));

      expect(response.status).toBe(200);
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'open');
      expect(mockSupabase.eq).toHaveBeenCalledWith('priority', 'high');
      expect(mockSupabase.lt).toHaveBeenCalledWith('due_date', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      expect(mockSupabase.neq).toHaveBeenCalledWith('status', 'closed');
    });

    it('deve filtrar os próximos sete dias e ordenar por prazo', async () => {
      const mockSupabase = createMockSupabase([]);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const response = await GET(new Request(
        'http://localhost/api/service-orders?deadline=next_7_days&sort=due_asc',
      ));

      expect(response.status).toBe(200);
      expect(mockSupabase.gt).toHaveBeenCalledWith('due_date', expect.any(String));
      expect(mockSupabase.lte).toHaveBeenCalledWith('due_date', expect.any(String));
      expect(mockSupabase.order).toHaveBeenCalledWith('due_date', {
        ascending: true,
        nullsFirst: false,
      });
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('deve filtrar ordens sem prazo', async () => {
      const mockSupabase = createMockSupabase([]);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      await GET(new Request('http://localhost/api/service-orders?deadline=without_due_date'));

      expect(mockSupabase.is).toHaveBeenCalledWith('due_date', null);
    });

    it('deve retornar 500 quando o banco falha', async () => {
      const mockSupabase = createMockSupabase(null, { message: 'DB error' });
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders?page=1&limit=10');
      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validBody = {
      title: 'Manutenção corretiva',
      description: 'Consertar fonte',
      equipment_id: 'eq-1',
      priority: 'high',
      due_date: '2026-07-30',
    };

    it('deve criar ordem com dados válidos', async () => {
      const createdOrder = {
        id: '1',
        ...validBody,
        status: 'open',
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockSupabase = createMockSupabase(createdOrder);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.serviceOrder.title).toBe('Manutenção corretiva');
      expect(body.serviceOrder.status).toBe('open');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        due_date: '2026-07-30',
      }));
    });

    it.each([
      '2026-02-30',
      '30/07/2026',
      123,
    ])('deve rejeitar prazo inválido: %s', async (dueDate) => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const response = await POST(new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, due_date: dueDate }),
      }));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Prazo inválido. Use uma data no formato AAAA-MM-DD.',
      });
    });

    it('deve criar ordem sem prazo quando o campo não é enviado', async () => {
      const bodyWithoutDueDate = {
        title: validBody.title,
        description: validBody.description,
        equipment_id: validBody.equipment_id,
        priority: validBody.priority,
      };
      const mockSupabase = createMockSupabase({ id: '1', ...bodyWithoutDueDate });
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const response = await POST(new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyWithoutDueDate),
      }));

      expect(response.status).toBe(201);
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ due_date: null }));
    });

    it('deve rejeitar título vazio', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, title: '' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('obrigatório');
    });

    it('deve rejeitar equipment_id vazio', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, equipment_id: '' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Selecione');
    });

    it('deve rejeitar prioridade inválida', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, priority: 'urgent' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Prioridade inválida.');
    });

    it('deve rejeitar título com mais de 255 caracteres', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, title: 'A'.repeat(256) }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('255');
    });

    it('deve remover user_id do body por segurança', async () => {
      const createdOrder = {
        id: '1',
        ...validBody,
        status: 'open',
        user_id: 'user-1',
      };

      const mockSupabase = createMockSupabase(createdOrder);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, user_id: 'evil-user-id' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      // Verifica que o user_id usado foi o do token, não o enviado
      expect(body.serviceOrder.user_id).toBe('user-1');
    });
  });
});
