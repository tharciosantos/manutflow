const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Caracteres com significado na mini-linguagem de filtros do PostgREST.
 * Uma vírgula encerra o filtro atual e inicia outro; parênteses abrem grupos.
 */
const POSTGREST_SYNTAX_CHARS = /[,()*:"']/g;

/**
 * Curingas do LIKE. Precisam ser escapados com `\` para virarem literais.
 */
const LIKE_WILDCARDS = /[\\%_]/g;

/** Limite defensivo do termo de busca, aplicado antes do escape. */
const MAX_SEARCH_TERM_LENGTH = 100;

/**
 * Normaliza um termo digitado pelo usuário para uso seguro em filtros
 * do PostgREST (`.or()`, `.ilike()`).
 *
 * Sem isso, um termo como `x,name.neq.y` encerraria o valor do `ilike` e
 * injetaria um novo filtro na consulta.
 *
 * @example
 * toPostgrestSearchTerm('motor (novo)') // 'motor  novo'
 * toPostgrestSearchTerm('50%_off')      // '50\%\_off'
 */
export function toPostgrestSearchTerm(value: string): string {
  return value
    .slice(0, MAX_SEARCH_TERM_LENGTH)
    .replace(POSTGREST_SYNTAX_CHARS, ' ')
    .replace(LIKE_WILDCARDS, (char) => `\\${char}`)
    .trim();
}
