import { NextResponse } from 'next/server';
import { getUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
    const { user, error: authError } = await getUser();
    if (authError) return authError;

    const { allowed, remaining } = checkRateLimit(`upload:${user.id}`, 10, 60_000);
    if (!allowed) {
        logger('warn', 'rate_limit.exceeded', { userId: user.id, route: 'upload', method: 'POST' });
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente mais tarde.' },
            {
                status: 429,
                headers: { 'X-RateLimit-Remaining': String(remaining) },
            },
        );
    }

    // Validar service role key
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseServiceRoleKey || !supabaseUrl) {
        logger('error', 'upload.missing_env', { vars: ['SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL'] });
        return NextResponse.json(
            { error: 'Erro de configuração do servidor.' },
            { status: 500 },
        );
    }

    let formData: FormData;

    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            { error: 'FormData inválido.' },
            { status: 400 },
        );
    }

    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
        return NextResponse.json(
            { error: 'Arquivo não enviado.' },
            { status: 400 },
        );
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
            { status: 400 },
        );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { error: 'Arquivo muito grande. O tamanho máximo é 5MB.' },
            { status: 400 },
        );
    }

    // Gerar nome único: userId/timestamp-random.ext
    const extension = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    // Criar client do Supabase com service role para ter permissão de escrita no storage
    const serviceClient = createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await serviceClient
        .storage
        .from('equipment-photos')
        .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        logger('error', 'upload.error', { userId: user.id, error: uploadError.message });
        return NextResponse.json(
            { error: 'Erro ao fazer upload da imagem.' },
            { status: 500 },
        );
    }

    // Obter URL pública
    const { data: { publicUrl } } = serviceClient
        .storage
        .from('equipment-photos')
        .getPublicUrl(fileName);

    return NextResponse.json({
        url: publicUrl,
        path: fileName,
    });
}
