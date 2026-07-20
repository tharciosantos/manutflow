import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const removeMock = vi.fn();
const fromMock = vi.fn(() => ({ remove: removeMock }));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        storage: { from: fromMock },
    })),
}));

import {
    EQUIPMENT_PHOTOS_BUCKET,
    getEquipmentPhotoPath,
    isOwnedEquipmentPhotoPath,
    removeEquipmentPhotoByPath,
} from '@/lib/equipment-photo-storage';

describe('Equipment photo storage', () => {
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
        removeMock.mockResolvedValue({ error: null });
    });

    afterEach(() => {
        if (originalSupabaseUrl === undefined) {
            delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        } else {
            process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
        }

        if (originalServiceRoleKey === undefined) {
            delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        } else {
            process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
        }
    });

    it.each([
        'user-1/photo.jpg',
        'user-1/1712345678-a1b2c3.png',
        'user-1/equipment_image.webp',
    ])('aceita um caminho de imagem pertencente ao usuário: %s', (path) => {
        expect(isOwnedEquipmentPhotoPath(path, 'user-1')).toBe(true);
    });

    it.each([
        'user-2/photo.jpg',
        'user-1/folder/photo.jpg',
        'user-1/../photo.jpg',
        '/user-1/photo.jpg',
        'user-1/photo.svg',
        'user-1/photo',
    ])('rejeita um caminho não pertencente ou inválido: %s', (path) => {
        expect(isOwnedEquipmentPhotoPath(path, 'user-1')).toBe(false);
    });

    it('extrai o caminho de uma URL pública válida', () => {
        const path = getEquipmentPhotoPath(
            'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-1/photo.jpg',
            'user-1',
            'https://project.supabase.co',
        );

        expect(path).toBe('user-1/photo.jpg');
    });

    it.each([
        'https://other.supabase.co/storage/v1/object/public/equipment-photos/user-1/photo.jpg',
        'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-2/photo.jpg',
        'https://project.supabase.co/storage/v1/object/public/other-bucket/user-1/photo.jpg',
        'not-a-url',
    ])('não extrai caminhos de uma URL externa ou inválida: %s', (url) => {
        expect(getEquipmentPhotoPath(url, 'user-1', 'https://project.supabase.co')).toBeNull();
    });

    it('remove uma foto válida do bucket', async () => {
        const result = await removeEquipmentPhotoByPath('user-1/photo.jpg', 'user-1');

        expect(result).toEqual({ ok: true });
        expect(fromMock).toHaveBeenCalledWith(EQUIPMENT_PHOTOS_BUCKET);
        expect(removeMock).toHaveBeenCalledWith(['user-1/photo.jpg']);
    });

    it('não acessa o Storage para um caminho de outro usuário', async () => {
        const result = await removeEquipmentPhotoByPath('user-2/photo.jpg', 'user-1');

        expect(result).toEqual({ ok: false, reason: 'invalid_path' });
        expect(fromMock).not.toHaveBeenCalled();
    });

    it('informa erro de configuração quando as credenciais não existem', async () => {
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        const result = await removeEquipmentPhotoByPath('user-1/photo.jpg', 'user-1');

        expect(result).toEqual({ ok: false, reason: 'missing_config' });
    });

    it('propaga falha de remoção do Storage sem expor credenciais', async () => {
        removeMock.mockResolvedValue({ error: { message: 'Storage error' } });

        const result = await removeEquipmentPhotoByPath('user-1/photo.jpg', 'user-1');

        expect(result).toEqual({
            ok: false,
            reason: 'storage_error',
            message: 'Storage error',
        });
    });
});
