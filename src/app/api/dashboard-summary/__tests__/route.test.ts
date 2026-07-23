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
 * Cada chamada a .from() recebe o próximo resultado e cria uma query
 * encadeável que pode ser aguardada como uma Promise.
 */
function createMockSupabase(callResults?: unknown[]) {
  let callIndex = 0;

  return {
    from: vi.fn().mockImplementation(() => {
      const result = (callResults?.[callIndex] ?? { data: [], count: 0, error: null }) as {
        data: unknown;
        count: number | null;
        error: unknown;
      };
      if (callResults && callIndex < callResults.length) callIndex++;

      const query = Promise.resolve(result) as Promise<typeof result> & Record<string, unknown>;
      const chain = vi.fn().mockReturnValue(query);

      query.eq = chain;
      query.neq = chain;
      query.lt = chain;
      query.gt = chain;
      query.lte = chain;
      query.gte = chain;
      query.order = chain;
      query.limit = chain;

      return {
        select: vi.fn().mockReturnValue(query),
      };
    }),
  };
}

describe('Dashboard Summary API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar totais zerados quando não há dados', async () => {
    const emptyResult = { data: [], count: 0, error: null };
    // 16 chamadas: resumo atual + 3 contagens de prazo + ordens urgentes
    const mockSupabase = createMockSupabase(Array(16).fill(emptyResult));

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
    expect(body.overdueServiceOrders).toBe(0);
    expect(body.dueTodayServiceOrders).toBe(0);
    expect(body.dueNextSevenDaysServiceOrders).toBe(0);
    expect(body.completionRate).toBe(0);
    expect(body.recentOrders).toEqual([]);
    expect(body.recentEquipments).toEqual([]);
    expect(body.urgentOrders).toEqual([]);
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
      { data: [], count: 4, error: null },       // overdue
      { data: [], count: 2, error: null },       // due today
      { data: [], count: 3, error: null },       // next seven days
      { data: [{ id: '3', title: 'Ordem urgente', status: 'open', priority: 'critical', due_date: '2026-07-22', equipment: { name: 'Equip C' } }], count: null, error: null },
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
    expect(body.overdueServiceOrders).toBe(4);
    expect(body.dueTodayServiceOrders).toBe(2);
    expect(body.dueNextSevenDaysServiceOrders).toBe(3);
    expect(body.completionRate).toBe(50);
    expect(body.recentOrders).toHaveLength(1);
    expect(body.recentEquipments).toHaveLength(1);
    expect(body.urgentOrders).toHaveLength(1);
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
