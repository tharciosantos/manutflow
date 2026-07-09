type StoreEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, StoreEntry>();

/**
 * Rate limiter em memória.
 * Permite `limit` requisições por janela de `windowMs` milissegundos.
 *
 * @param key - Identificador único (ex: user.id ou IP)
 * @param limit - Máximo de requisições permitidas na janela
 * @param windowMs - Duração da janela em milissegundos (padrão: 60s)
 * @returns Objeto com `allowed` e `remaining`
 */
export function checkRateLimit(
    key: string,
    limit = 30,
    windowMs = 60_000,
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = store.get(key);

    // Se não existe entrada ou a janela expirou, criar nova
    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    // Dentro da janela: incrementar contador
    entry.count++;

    if (entry.count > limit) {
        return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: limit - entry.count };
}

/**
 * Limpa entradas expiradas do store (opcional, para evitar vazamento de memória).
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

// Executar cleanup a cada 5 minutos
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
