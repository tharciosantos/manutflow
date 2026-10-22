import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Limite de tentativas por IP, por janela. */
const DEMO_LOGIN_LIMIT = 5;
const DEMO_LOGIN_WINDOW_MS = 60_000;

/**
 * Cria a sessão da conta de demonstração no servidor.
 *
 * A senha vive em `DEMO_PASSWORD` (server-side) e nunca chega ao bundle do
 * navegador. A rota é pública por natureza — qualquer visitante continua podendo
 * entrar na demo; o que muda é que não existe mais segredo no JavaScript, a senha
 * pode ser rotacionada sem redeploy e o acesso passa a ser limitado por IP.
 *
 * Respostas:
 *   200 — sessão criada (cookies gravados pelo client SSR)
 *   401 — o Supabase recusou as credenciais
 *   429 — limite de tentativas por IP
 *   503 — `DEMO_PASSWORD` ausente no ambiente
 */
export async function POST(request: Request) {
    const email = process.env.DEMO_EMAIL?.trim() || 'demo@manutflow.com';
    const password = process.env.DEMO_PASSWORD;

    // Falha alto e claro. Nunca cair em senha padrão no código.
    if (!password) {
        logger('error', 'demo_login.missing_env', { vars: ['DEMO_PASSWORD'] });

        return NextResponse.json(
            { error: 'Demonstração indisponível no momento.' },
            { status: 503 },
        );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || 'local';

    const { allowed, remaining } = checkRateLimit(
        `demo-login:${clientIp}`,
        DEMO_LOGIN_LIMIT,
        DEMO_LOGIN_WINDOW_MS,
    );

    if (!allowed) {
        // Sem log do IP: dado pessoal desnecessário para diagnóstico.
        logger('warn', 'demo_login.rate_limited', { limit: DEMO_LOGIN_LIMIT });

        return NextResponse.json(
            { error: 'Muitas tentativas. Tente novamente em instantes.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        logger('warn', 'demo_login.failed', { status: error.status, code: error.code });

        return NextResponse.json(
            { error: 'Demonstração indisponível no momento.' },
            { status: 401 },
        );
    }

    logger('info', 'demo_login.success', { email });

    return NextResponse.json({ ok: true });
}
