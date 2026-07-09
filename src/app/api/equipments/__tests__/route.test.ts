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

  // Configurar o comportamento final da chain
  chainableMock.order.mockResolvedValue({ data: data ?? [], error });
  chainableMock.single.mockResolvedValue({ data: data ?? null, error });
  chainableMock.maybeSingle.mockResolvedValue({ data: data ?? null, error });

  return {
    from: vi.fn().mockReturnValue(chainableMock),
    ...chainableMock,
  };
}

describe('Equipments API', () => {
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
      expect(response.status).toBe(401);
    });

    it('deve retornar lista de equipamentos quando autenticado', async () => {
      const mockEquipments = [
        {
          id: '1',
          name: 'Notebook Dell',
          patrimony_code: 'PAT-001',
          location: 'Sala 101',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          user_id: 'user-1',
        },
        {
          id: '2',
          name: 'Impressora HP',
          patrimony_code: 'PAT-002',
          location: 'Sala 102',
          status: 'maintenance',
          created_at: '2024-01-02T00:00:00Z',
          user_id: 'user-1',
        },
      ];

      const mockSupabase = createMockSupabase(mockEquipments);
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1', email: 'test@test.com' },
        supabase: mockSupabase,
        error: null,
      });

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.equipments).toHaveLength(2);
      expect(body.equipments[0].name).toBe('Notebook Dell');
    });

    it('deve retornar 500 quando o banco falha', async () => {
      const mockSupabase = createMockSupabase(null, { message: 'Erro no banco' });
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
      name: 'Notebook Dell',
      patrimony_code: 'PAT-001',
      location: 'Sala 101',
    };

    it('deve criar equipamento com dados válidos', async () => {
      const createdEquipment = { id: '1', ...validBody, status: 'active', user_id: 'user-1' };
      const mockSupabase = createMockSupabase(createdEquipment);
      // maybeSingle retorna null (não existe duplicata)
      mockSupabase.from('equipments').maybeSingle.mockResolvedValue({ data: null, error: null });

      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.equipment.name).toBe('Notebook Dell');
    });

    it('deve rejeitar nome vazio', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, name: '' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('obrigatório');
    });

    it('deve rejeitar patrimônio vazio', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, patrimony_code: '' }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('obrigatório');
    });

    it('deve rejeitar nome com mais de 255 caracteres', async () => {
      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: createMockSupabase(),
        error: null,
      });

      const request = new Request('http://localhost/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, name: 'A'.repeat(256) }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('255');
    });

    it('deve rejeitar patrimônio duplicado', async () => {
      const mockSupabase = createMockSupabase();
      // maybeSingle retorna um equipamento existente (duplicata)
      mockSupabase.from('equipments').maybeSingle.mockResolvedValue({
        data: { id: 'existing-id' },
        error: null,
      });

      const mockGetUser = getUser as ReturnType<typeof vi.fn>;
      mockGetUser.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: mockSupabase,
        error: null,
      });

      const request = new Request('http://localhost/api/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.error).toContain('patrimônio');
    });
  });
});
