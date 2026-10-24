import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
    EQUIPMENT_PHOTOS_BUCKET,
    isOwnedEquipmentPhotoPath,
} from '@/lib/equipment-photo-storage';

export const dynamic = 'force-dynamic';

type RouteParams = {
    params: Promise<{
        path: string[];
    }>;
};

/**
 * 404 — e não 403 — para não confirmar a existência de foto de outro usuário.
 */
function notFound() {
    return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 });
}

/**
 * Entrega uma foto do bucket privado `equipment-photos`.
 *
 * AUD-15: o bucket deixou de ser público, então a imagem não tem URL acessível
 * sem sessão. Esta rota valida a sessão, confere se o caminho pertence ao usuário
 * autenticado e só então lê o objeto — usando o client do próprio usuário, de modo
 * que a RLS do Storage continua sendo a última palavra.
 */
export async function GET(_request: Request, { params }: RouteParams) {
    const { user, supabase, error: authError } = await getUser();
    if (authError) return authError;

    const segments = (await params).path ?? [];

    let photoPath: string;

    try {
        photoPath = segments.map((segment) => decodeURIComponent(segment)).join('/');
    } catch {
        return notFound();
    }

    if (!isOwnedEquipmentPhotoPath(photoPath, user.id)) {
        return notFound();
    }

    const { data: file, error } = await supabase.storage
        .from(EQUIPMENT_PHOTOS_BUCKET)
        .download(photoPath);

    if (error || !file) {
        logger('warn', 'photo.download_failed', {
            userId: user.id,
            error: error?.message ?? 'arquivo ausente',
        });

        return notFound();
    }

    return new Response(file.stream(), {
        status: 200,
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'Content-Length': String(file.size),
            // Cache privado: o navegador reaproveita por 1h, nenhum proxy público guarda.
            'Cache-Control': 'private, max-age=3600',
        },
    });
}
