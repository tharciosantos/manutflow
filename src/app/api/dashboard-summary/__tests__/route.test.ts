import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { GET } from '../route';

/**
 * Cria um mock de Supabase que suporta:
 * - .select('*', { count: 'exact', head: true }).eq().eq()
 * - .select('...').eq().order().limit()
 * - .select('created_at').eq().gte().order()
 *
 * Cada chamada a .from() produz um novo .eq() mock que retorna o PRÓXIMO
 * resultado do array callResults. O segundo .eq() (encadeado) retorna o
 * MESMO resultado (mesmo count), sem consumir índice extra.
 */
function createMockSupabase(callResults?: unknown[]) {
  let callIndex = 0;

  function makeEqFn() {
    return vi.fn().mockImplementation(() => {
      const result = (callResults?.[callIndex] ?? { data: [], count: 0, error: null }) as { data: unknown; count: number; error: unknown };
      if (callResults && callIndex < callResults.length) callIndex++;

      const promise = Promise.resolve(result) as Promise<{ data: unknown; count: number; error: unknown }> & Record<string, unknown>;

      // Segundo .eq() retorna o MESMO resultado (sem consumir novo índice)
      promise.eq = vi.fn().mockResolvedValue(result);

      // .order().limit() para recent queries
      promise.order = vi.fn().mockReturnThis();
      promise.limit = vi.fn().mockResolvedValue(result);

      // .gte().order() para ordersByMonth
      promise.gte = vi.fn().mockReturnThis();

      return promise;
    });
  }

  return {
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: makeEqFn(),
      }),
    })),
  };
}

describe('Dashboard Summary API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar totais zerados quando não há dados', async () => {
    const emptyResult = { data: [], count: 0, error: null };
    // 12 chamadas: 9 count queries + recentOrders + recentEquipments + ordersByMonth
    const mockSupabase = createMockSupabase(Array(12).fill(emptyResult));

    const mockGetUser = getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: mockSupabase,
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalEquipments).toBe(0);
    expect(body.totalServiceOrders).toBe(0);
    expect(body.openServiceOrders).toBe(0);
    expect(body.inProgressServiceOrders).toBe(0);
    expect(body.closedServiceOrders).toBe(0);
    expect(body.lowPriorityServiceOrders).toBe(0);
    expect(body.mediumPriorityServiceOrders).toBe(0);
    expect(body.highPriorityServiceOrders).toBe(0);
    expect(body.criticalPriorityServiceOrders).toBe(0);
    expect(body.completionRate).toBe(0);
    expect(body.recentOrders).toEqual([]);
    expect(body.recentEquipments).toEqual([]);
    expect(body.ordersByMonth).toBeDefined();
    expect(body.ordersByMonth.length).toBe(6);
  });

  it('deve retornar totais corretos com dados', async () => {
    const counts = [
      { data: [], count: 5, error: null },   // equipments total
      { data: [], count: 10, error: null },   // service_orders total
      { data: [], count: 3, error: null },    // open
      { data: [], count: 2, error: null },    // in_progress
      { data: [], count: 5, error: null },    // closed
      { data: [], count: 2, error: null },    // low priority
      { data: [], count: 3, error: null },    // medium priority
      { data: [], count: 3, error: null },    // high priority
      { data: [], count: 2, error: null },    // critical priority
      { data: [{ id: '1', title: 'Ordem 1', status: 'open', priority: 'high', created_at: new Date().toISOString(), equipment: { name: 'Equip A' } }], count: null, error: null },
      { data: [{ id: '2', name: 'Equip B', patrimony_code: 'PAT-002', status: 'active', created_at: new Date().toISOString() }], count: null, error: null },
      { data: [{ created_at: new Date().toISOString() }], count: null, error: null },
    ];

    const mockSupabase = createMockSupabase(counts);

    const mockGetUser = getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: mockSupabase,
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totalEquipments).toBe(5);
    expect(body.totalServiceOrders).toBe(10);
    expect(body.openServiceOrders).toBe(3);
    expect(body.inProgressServiceOrders).toBe(2);
    expect(body.closedServiceOrders).toBe(5);
    expect(body.completionRate).toBe(50);
    expect(body.recentOrders).toHaveLength(1);
    expect(body.recentEquipments).toHaveLength(1);
    expect(body.ordersByMonth).toHaveLength(6);
  });

  it('deve retornar 500 quando alguma query falha', async () => {
    const results = [
      { data: [], count: 0, error: { message: 'DB error' } }, // primeira query falha
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
      { data: [], count: 0, error: null },
    ];

    const mockSupabase = createMockSupabase(results);

    const mockGetUser = getUser as ReturnType<typeof vi.fn>;
    mockGetUser.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: mockSupabase,
      error: null,
    });

    const response = await GET();
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
