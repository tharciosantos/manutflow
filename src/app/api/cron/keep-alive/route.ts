import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function isValidBearerToken(authHeader: string | null, secret: string): boolean {
    if (!authHeader) return false;

    const receivedBuffer = Buffer.from(authHeader);
    const expectedBuffer = Buffer.from(`Bearer ${secret}`);

    if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
}

/**
 * Registra um heartbeat diário no PostgreSQL para evitar a pausa automática
 * de projetos inativos no plano gratuito do Supabase.
 *
 * Protegida por `Authorization: Bearer <CRON_SECRET>` (injetado nativamente
 * pelo Vercel Cron ou por um agendador externo). Usa tabela técnica isolada
 * (`public.keep_alive`) sem tocar dados de usuários ou de negócio.
 */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET?.trim();

    if (!cronSecret) {
        logger('error', 'cron_keep_alive.missing_env', { vars: ['CRON_SECRET'] });

        return NextResponse.json(
            { error: 'Cron keep-alive não configurado.' },
            { status: 503 },
        );
    }

    if (!isValidBearerToken(request.headers.get('authorization'), cronSecret)) {
        logger('warn', 'cron_keep_alive.unauthorized');

        return NextResponse.json(
            { error: 'Não autorizado.' },
            { status: 401 },
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        logger('error', 'cron_keep_alive.missing_env', {
            vars: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
        });

        return NextResponse.json(
            { error: 'Erro de configuração do servidor.' },
            { status: 500 },
        );
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const timestamp = new Date().toISOString();
    const { error } = await serviceClient
        .from('keep_alive')
        .upsert({ id: 1, last_ping_at: timestamp }, { onConflict: 'id' });

    if (error) {
        logger('error', 'cron_keep_alive.db_error', { error: error.message });

        return NextResponse.json(
            { error: 'Erro ao registrar keep-alive no banco.' },
            { status: 500 },
        );
    }

    logger('info', 'cron_keep_alive.success', { timestamp });

    return NextResponse.json({ ok: true, timestamp });
}
