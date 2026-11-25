import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSupabaseEnv } from '../env';

const ORIGINAL = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function setEnv(url: string | undefined, anonKey: string | undefined) {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey);
}

describe('getSupabaseEnv (AUD-31)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (ORIGINAL.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL.url;
    if (ORIGINAL.anonKey !== undefined) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ORIGINAL.anonKey;
  });

  it('devolve url e anon key quando as duas variáveis estão definidas', () => {
    setEnv('https://projeto.supabase.co', 'chave-anon-real');

    expect(getSupabaseEnv()).toEqual({
      url: 'https://projeto.supabase.co',
      anonKey: 'chave-anon-real',
    });
  });

  it('remove espaços em volta do valor', () => {
    setEnv('  https://projeto.supabase.co  ', '  chave-anon-real\n');

    expect(getSupabaseEnv()).toEqual({
      url: 'https://projeto.supabase.co',
      anonKey: 'chave-anon-real',
    });
  });

  it('aponta a variável ausente pelo nome', () => {
    setEnv(undefined, 'chave-anon-real');

    expect(() => getSupabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(() => getSupabaseEnv()).not.toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it('lista as duas variáveis quando ambas faltam', () => {
    setEnv(undefined, undefined);

    expect(() => getSupabaseEnv()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  it('trata string vazia e só espaços como ausente', () => {
    setEnv('', '   ');

    expect(() => getSupabaseEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });

  it.each([
    ['sua-url-aqui', 'chave-anon-real', 'NEXT_PUBLIC_SUPABASE_URL'],
    ['https://projeto.supabase.co', 'sua-chave-anon-aqui', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  ])('rejeita o valor de exemplo do .env.example em %s', (url, anonKey, expected) => {
    setEnv(url, anonKey);

    expect(() => getSupabaseEnv()).toThrow(expected);
  });

  it('orienta onde configurar a variável', () => {
    setEnv(undefined, undefined);

    expect(() => getSupabaseEnv()).toThrow(/\.env/);
  });
});
