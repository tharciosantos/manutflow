import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { GET } from '../route';

/**
 * Cria um mock de Supabase que suporta encadeamento duplo de .eq().
 *
 * O truque: .eq() retorna um objeto que É um Promise (thenable) E também
 * tem um método .eq() para suportar chains como:
 *   supabase.from('x').select('*').eq('user_id', uid).eq('status', 'open')
 *
 * Queries com 1 eq: await resolve para o resultado diretamente no Promise.
 * Queries com 2 eq: 1º eq retorna objeto thenable, 2º eq retorna o resultado.
 */
function createEqReturn(data: unknown, count: number, error: unknown) {
  const result = { data, count, error };
  const promise = Promise.resolve(result);
  // Adiciona .eq() ao próprio Promise para suportar segundo encadeamento
  (promise as Record<string, unknown>).eq = vi.fn().mockResolvedValue(result);
  return promise;
}

function createMockSupabase(options?: {
  equipmentsCount?: number;
  serviceOrdersCount?: number;
  failOnFirstCall?: boolean;
}) {
  let isFirstEquipmentsCall = true;

  const defaultEq = vi.fn().mockImplementation(() => {
    if (options?.failOnFirstCall && isFirstEquipmentsCall) {
      isFirstEquipmentsCall = false;
      return createEqReturn([], 0, { message: 'DB error' });
    }
    return createEqReturn([], 0, null);
  });

  // Para queries com 2 .eq() (status/priority), retorna o count do último eq
  const eqWithCount = (count: number) =>
    vi.fn().mockImplementation(() => {
      const result = { data: [], count, error: null };
      const promise = Promise.resolve(result);
      (promise as Record<string, unknown>).eq = vi.fn().mockResolvedValue(result);
      return promise;
    });

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'equipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: eqWithCount(options?.equipmentsCount ?? 0),
          }),
        };
      }
      // service_orders
      return {
        select: vi.fn().mockReturnValue({
          eq: defaultEq,
        }),
      };
    }),
  };
}

describe('Dashboard Summary API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar totais zerados quando não há dados', async () => {
    const mockSupabase = createMockSupabase();

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
  });

  it('deve retornar totais corretos com dados', async () => {
    // Configura o mock para retornar contagens específicas por tipo de query
    let callIndex = 0;
    const counts = [
      5,   // equipments total
      10,  // service_orders total
      3,   // open
      2,   // in_progress
      5,   // closed
      2,   // low priority
      3,   // medium priority
      3,   // high priority
      2,   // critical priority
    ];

    const eqFn = vi.fn().mockImplementation(() => {
      const count = callIndex < counts.length ? counts[callIndex++] : 0;
      const result = { data: [], count, error: null };
      const promise = Promise.resolve(result);
      (promise as Record<string, unknown>).eq = vi.fn().mockResolvedValue(result);
      return promise;
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqFn,
        }),
      }),
    };

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
  });

  it('deve retornar 500 quando alguma query falha', async () => {
    let firstCall = true;

    const eqFn = vi.fn().mockImplementation(() => {
      if (firstCall) {
        firstCall = false;
        const errorResult = { data: [], count: 0, error: { message: 'DB error' } };
        const promise = Promise.resolve(errorResult);
        (promise as Record<string, unknown>).eq = vi
          .fn()
          .mockResolvedValue(errorResult);
        return promise;
      }
      const result = { data: [], count: 0, error: null };
      const promise = Promise.resolve(result);
      (promise as Record<string, unknown>).eq = vi.fn().mockResolvedValue(result);
      return promise;
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqFn,
        }),
      }),
    };

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
