import { describe, it, expect } from 'vitest';
import { GET } from '../route';

describe('Health API', () => {
  it('deve retornar status 200 com status ok', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'ok',
      message: 'API do Manutflow funcionando',
    });
  });
});
