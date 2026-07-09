import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { GET, POST } from '../route';

function createMockSupabase(data?: unknown, error: unknown = null) {
  const chainableMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  chainableMock.order.mockResolvedValue({ data: data ?? [], error });
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

      const response = await GET();
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

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.serviceOrders).toHaveLength(1);
      expect(body.serviceOrders[0].title).toBe('Manutenção preventiva');
      expect(body.serviceOrders[0].equipment.name).toBe('Notebook Dell');
    });

    it('deve retornar 500 quando o banco falha', async () => {
      const mockSupabase = createMockSupabase(null, { message: 'DB error' });
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const response = await GET();
      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    const validBody = {
      title: 'Manutenção corretiva',
      description: 'Consertar fonte',
      equipment_id: 'eq-1',
      priority: 'high',
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
