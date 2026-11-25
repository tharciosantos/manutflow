/**
 * AUD-31: ponto único de leitura das credenciais públicas do Supabase.
 *
 * Antes, os três clients (browser, servidor e proxy) montavam
 * `createBrowserClient(process.env.X!, process.env.Y!)`: a variável ausente
 * virava `undefined` e só aparecia como erro do supabase-js, sem dizer qual
 * env faltou nem onde configurá-la.
 */

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/** Variável ausente, vazia ou ainda com o valor de exemplo do `.env.example`. */
function isMissing(value: string | undefined): value is undefined {
  if (!value?.trim()) return true;
  // `next build` pré-renderiza páginas que só existem com env; em CI sem
  // `.env` isso precisa falhar aqui, com mensagem clara, e não no supabase-js.
  return /^sua-(url|chave)-/.test(value.trim());
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    isMissing(url) && "NEXT_PUBLIC_SUPABASE_URL",
    isMissing(anonKey) && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  if (!url || !anonKey || missing.length > 0) {
    throw new Error(
      `Configuração do Supabase ausente: ${missing.join(", ")}. ` +
        "Defina a variável no .env (ver .env.example) antes de iniciar a aplicação.",
    );
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}
