import { createClient } from '@supabase/supabase-js';
import {
    EQUIPMENT_PHOTOS_BUCKET,
    getOwnedEquipmentPhotoPath,
    isOwnedEquipmentPhotoPath,
} from '@/lib/equipment-photo-path';

/**
 * Operações de Storage que exigem `SUPABASE_SERVICE_ROLE_KEY` (ignora RLS).
 * Só pode ser importado por route handlers de escrita. As regras puras de
 * caminho vivem em `equipment-photo-path.ts`, para que leituras não tragam
 * este módulo para o grafo.
 */

export type EquipmentPhotoRemovalResult =
    | { ok: true }
    | { ok: false; reason: 'invalid_path' | 'missing_config' | 'storage_error'; message?: string };

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
    const path = getOwnedEquipmentPhotoPath(photoUrl, userId);
    if (!path) {
        return null;
    }

    return removeEquipmentPhotoByPath(path, userId);
}
