import { describe, expect, it } from 'vitest';

import { isUuid, toPostgrestSearchTerm } from '@/lib/validation';

describe('isUuid', () => {
  it('aceita UUID v4 válido', () => {
    expect(isUuid('8df99c9e-5058-4b0f-8f40-4e4b94c28980')).toBe(true);
  });

  it.each(['', 'equipment-1', '../equipment', '8df99c9e-5058'])('rejeita ID inválido: %s', (value) => {
    expect(isUuid(value)).toBe(false);
  });
});

describe('toPostgrestSearchTerm', () => {
  it('mantém termos simples', () => {
    expect(toPostgrestSearchTerm('compressor')).toBe('compressor');
  });

  it('remove caracteres de sintaxe do PostgREST (vírgula, parênteses, aspas)', () => {
    expect(toPostgrestSearchTerm('motor (novo),x')).toBe('motor  novo  x');
  });

  it('neutraliza injeção de filtro', () => {
    const injected = toPostgrestSearchTerm(
      'abc,name.ilike.%segredo%,and(user_id.neq.00000000-0000-4000-8000-000000000000)',
    );

    expect(injected).not.toContain(',');
    expect(injected).not.toContain('(');
    expect(injected).not.toContain(')');
    expect(injected).not.toContain('"');
  });

  it('escapa curingas do LIKE', () => {
    expect(toPostgrestSearchTerm('50%')).toBe('50\\%');
    expect(toPostgrestSearchTerm('a_b')).toBe('a\\_b');
    expect(toPostgrestSearchTerm('a\\b')).toBe('a\\\\b');
  });

  it('limita o tamanho do termo', () => {
    expect(toPostgrestSearchTerm('a'.repeat(500))).toHaveLength(100);
  });

  it('remove espaços nas pontas', () => {
    expect(toPostgrestSearchTerm('  motor  ')).toBe('motor');
  });
});
