import { createClient } from '@supabase/supabase-js';

export const EQUIPMENT_PHOTOS_BUCKET = 'equipment-photos';

export type EquipmentPhotoRemovalResult =
    | { ok: true }
    | { ok: false; reason: 'invalid_path' | 'missing_config' | 'storage_error'; message?: string };

export function isOwnedEquipmentPhotoPath(path: string, userId: string): boolean {
    const parts = path.split('/');

    return parts.length === 2
        && parts[0] === userId
        && /^[a-zA-Z0-9._-]+\.(jpe?g|png|webp)$/i.test(parts[1]);
}

export function getEquipmentPhotoPath(
    photoUrl: string,
    userId: string,
    supabaseUrl: string,
): string | null {
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return Boolean(
        supabaseUrl
        && getEquipmentPhotoPath(photoUrl, userId, supabaseUrl),
    );
}

export async function removeEquipmentPhotoByPath(
    path: string,
    userId: string,
): Promise<EquipmentPhotoRemovalResult> {
    if (!isOwnedEquipmentPhotoPath(path, userId)) {
        return { ok: false, reason: 'invalid_path' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return { ok: false, reason: 'missing_config' };
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const { error } = await serviceClient.storage
        .from(EQUIPMENT_PHOTOS_BUCKET)
        .remove([path]);

    if (error) {
        return { ok: false, reason: 'storage_error', message: error.message };
    }

    return { ok: true };
}

export async function removeEquipmentPhotoByUrl(
    photoUrl: string,
    userId: string,
): Promise<EquipmentPhotoRemovalResult | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return { ok: false, reason: 'missing_config' };
    }

    const path = getEquipmentPhotoPath(photoUrl, userId, supabaseUrl);
    if (!path) {
        return null;
    }

    return removeEquipmentPhotoByPath(path, userId);
}
