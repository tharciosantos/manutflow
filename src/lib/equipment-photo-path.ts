/**
 * Regras puras de caminho das fotos de equipamento — sem acesso ao Storage,
 * sem `SUPABASE_SERVICE_ROLE_KEY` e sem I/O.
 *
 * A separação de `equipment-photo-storage.ts` é deliberada: este arquivo pode ser
 * importado por qualquer camada, inclusive route handlers de leitura. O módulo
 * que cria o client com `service_role` (que ignora RLS) fica isolado lá, para
 * que ninguém o importe sem precisar gravar ou remover no bucket.
 */

export const EQUIPMENT_PHOTOS_BUCKET = 'equipment-photos';

/**
 * Prefixo da rota interna que serve as fotos com validação de sessão.
 * O bucket é privado desde a migration 0004: o navegador nunca fala com o
 * Storage diretamente, sempre com `GET /api/photos/<user>/<arquivo>`.
 */
export const EQUIPMENT_PHOTOS_ROUTE_PREFIX = '/api/photos/';

export function isOwnedEquipmentPhotoPath(path: string, userId: string): boolean {
    const parts = path.split('/');

    return parts.length === 2
        && parts[0] === userId
        && /^[a-zA-Z0-9._-]+\.(jpe?g|png|webp)$/i.test(parts[1]);
}

/**
 * Monta a URL interna de uma foto a partir do caminho no bucket.
 * Cada segmento é codificado, para que nenhum caractere do nome quebre a rota.
 */
export function toEquipmentPhotoUrl(path: string): string {
    const encoded = path.split('/').map((segment) => encodeURIComponent(segment)).join('/');

    return `${EQUIPMENT_PHOTOS_ROUTE_PREFIX}${encoded}`;
}

/**
 * Extrai o caminho no bucket a partir da URL guardada em `equipments.photo_url`.
 *
 * Aceita dois formatos:
 *  - `/api/photos/<user>/<arquivo>` — formato atual, servido pelo proxy;
 *  - `<supabase>/storage/v1/object/public/equipment-photos/<user>/<arquivo>` —
 *    formato legado, aceito para não invalidar registros antigos.
 *
 * Devolve `null` quando o caminho é externo, de outro usuário ou malformado.
 */
export function getEquipmentPhotoPath(
    photoUrl: string,
    userId: string,
    supabaseUrl: string,
): string | null {
    if (photoUrl.startsWith(EQUIPMENT_PHOTOS_ROUTE_PREFIX)) {
        const encodedPath = photoUrl.slice(EQUIPMENT_PHOTOS_ROUTE_PREFIX.length).split('?')[0];

        try {
            const path = encodedPath
                .split('/')
                .map((segment) => decodeURIComponent(segment))
                .join('/');

            return isOwnedEquipmentPhotoPath(path, userId) ? path : null;
        } catch {
            // Percent-encoding inválido
            return null;
        }
    }

    try {
        const target = new URL(photoUrl);
        const base = new URL(supabaseUrl);
        const marker = `/storage/v1/object/public/${EQUIPMENT_PHOTOS_BUCKET}/`;

        if (target.origin !== base.origin || !target.pathname.startsWith(marker)) {
            return null;
        }

        const path = decodeURIComponent(target.pathname.slice(marker.length));
        return isOwnedEquipmentPhotoPath(path, userId) ? path : null;
    } catch {
        return null;
    }
}

export function isOwnedEquipmentPhotoUrl(photoUrl: string, userId: string): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

    return getEquipmentPhotoPath(photoUrl, userId, supabaseUrl) !== null;
}

/**
 * Extrai o caminho de uma foto do usuário a partir da URL, para uso na remoção.
 * Devolve `null` quando a URL não pertence ao usuário ou é malformada.
 */
export function getOwnedEquipmentPhotoPath(
    photoUrl: string,
    userId: string,
): string | null {
    return getEquipmentPhotoPath(
        photoUrl,
        userId,
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    );
}
