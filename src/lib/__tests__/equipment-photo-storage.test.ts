import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const removeMock = vi.fn();
const fromMock = vi.fn(() => ({ remove: removeMock }));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        storage: { from: fromMock },
    })),
}));

import { EQUIPMENT_PHOTOS_BUCKET } from '@/lib/equipment-photo-path';
import {
    removeEquipmentPhotoByPath,
    removeEquipmentPhotoByUrl,
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

    describe('removeEquipmentPhotoByUrl', () => {
        it('devolve null sem tocar o Storage quando a URL não é do usuário', async () => {
            const result = await removeEquipmentPhotoByUrl('/api/photos/user-2/photo.jpg', 'user-1');

            expect(result).toBeNull();
            expect(fromMock).not.toHaveBeenCalled();
        });

        it('remove a foto a partir da URL interna do proxy', async () => {
            const result = await removeEquipmentPhotoByUrl('/api/photos/user-1/photo.jpg', 'user-1');

            expect(result).toEqual({ ok: true });
            expect(removeMock).toHaveBeenCalledWith(['user-1/photo.jpg']);
        });
    });
});
