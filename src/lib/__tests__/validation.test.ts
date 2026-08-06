import { describe, expect, it } from 'vitest';

import { isUuid } from '@/lib/validation';

describe('isUuid', () => {
  it('aceita UUID v4 válido', () => {
    expect(isUuid('8df99c9e-5058-4b0f-8f40-4e4b94c28980')).toBe(true);
  });

  it.each(['', 'equipment-1', '../equipment', '8df99c9e-5058'])('rejeita ID inválido: %s', (value) => {
    expect(isUuid(value)).toBe(false);
  });
});
