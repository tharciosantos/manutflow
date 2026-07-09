import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

describe('Auth (getUser)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar user e supabase quando autenticado', async () => {
    const mockUser = { id: 'user-1', email: 'test@manutflow.com' };

    const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    });

    const result = await getUser();

    expect(result.error).toBeNull();
    expect(result.user).toBeDefined();
    expect(result.user!.id).toBe('user-1');
    expect(result.user!.email).toBe('test@manutflow.com');
    expect(result.supabase).toBeDefined();
  });

  it('deve retornar erro 401 quando não autenticado', async () => {
    const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Não autenticado' },
        }),
      },
    });

    const result = await getUser();

    expect(result.user).toBeNull();
    expect(result.supabase).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);

    const errorBody = await result.error!.json();
    expect(errorBody.error).toBe('Não autorizado');
  });

  it('deve retornar erro 401 quando getUser retorna erro', async () => {
    const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Token inválido' },
        }),
      },
    });

    const result = await getUser();

    expect(result.user).toBeNull();
    expect(result.supabase).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
  });
});
