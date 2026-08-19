import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from '../fetch-with-retry';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna a resposta imediatamente quando o fetch tem sucesso (200)', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchWithRetry('/api/test', { delayMs: 10 });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retorna resposta de erro do cliente (404) imediatamente sem retentativa desnecessária', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const fetchMock = vi.fn().mockResolvedValue(mockResponse);
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchWithRetry('/api/test', { delayMs: 10 });
    expect(res.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('executa retentativa e tem sucesso quando a primeira tentativa falha com 500', async () => {
    const errorResponse = new Response(JSON.stringify({ error: 'Cold start' }), { status: 500 });
    const successResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchWithRetry('/api/test', { delayMs: 10 });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('executa retentativa quando o fetch dispara exceção de rede', async () => {
    const successResponse = new Response(JSON.stringify({ data: 'recovered' }), { status: 200 });

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error / connection dropped'))
      .mockResolvedValueOnce(successResponse);
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchWithRetry('/api/test', { delayMs: 10 });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retorna a resposta final de erro após esgotar todas as tentativas 5xx', async () => {
    const errorResponse = new Response(JSON.stringify({ error: 'Server down' }), { status: 503 });

    const fetchMock = vi.fn().mockResolvedValue(errorResponse);
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchWithRetry('/api/test', { retries: 2, delayMs: 5 });
    expect(res.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});