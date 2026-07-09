export type LogLevel = 'info' | 'warn' | 'error';

export type LogData = Record<string, unknown>;

/**
 * Logger estruturado que imprime logs em formato JSON.
 * Facilita o parsing por ferramentas externas (Datadog, CloudWatch, etc.).
 *
 * Uso:
 *   logger('info', 'api.request', { method: 'GET', path: '/api/health' });
 *   logger('error', 'api.error', { route: 'equipments', error: message });
 */
export function logger(level: LogLevel, event: string, data?: LogData): void {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...(data ? { data } : {}),
    };

    const output = JSON.stringify(entry);

    switch (level) {
        case 'error':
            console.error(output);
            break;
        case 'warn':
            console.warn(output);
            break;
        default:
            console.log(output);
    }
}
