export type FetchWithRetryOptions = RequestInit & {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
  retryOnStatusCodes?: number[];
};

const DEFAULT_RETRY_STATUS_CODES = [500, 502, 503, 504];

/**
 * Executa uma requisicao fetch com suporte a tentativas automaticas (retries)
 * em caso de falhas de rede ou erros temporarios de servidor (5xx).
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  options?: FetchWithRetryOptions
): Promise<Response> {
  const retries = options?.retries ?? 2;
  const initialDelay = options?.delayMs ?? 600;
  const backoffFactor = options?.backoffFactor ?? 1.5;
  const retryStatusCodes = options?.retryOnStatusCodes ?? DEFAULT_RETRY_STATUS_CODES;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = options !== undefined ? await fetch(input, options) : await fetch(input);

      if (response.ok || !retryStatusCodes.includes(response.status)) {
        return response;
      }

      if (attempt < retries) {
        const delay = Math.round(initialDelay * Math.pow(backoffFactor, attempt));
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        const delay = Math.round(initialDelay * Math.pow(backoffFactor, attempt));
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Falha na comunicacao com o servidor apos tentativas.');
}