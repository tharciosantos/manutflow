import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const storageMocks = vi.hoisted(() => ({
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    from: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        storage: { from: storageMocks.from },
    })),
}));

vi.mock('@/lib/auth', () => ({
    getUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: vi.fn(),
}));

vi.mock('@/lib/equipment-photo-storage', () => ({
    EQUIPMENT_PHOTOS_BUCKET: 'equipment-photos',
    removeEquipmentPhotoByPath: vi.fn(),
}));

import { getUser } from '@/lib/auth';
import { removeEquipmentPhotoByPath } from '@/lib/equipment-photo-storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { DELETE, POST } from '../route';

type AuthMockResult =
    | { user: { id: string }; supabase: null; error: null }
    | { user: null; supabase: null; error: Response };

const getUserMock = vi.mocked(getUser) as Mock<() => Promise<AuthMockResult>>;

function request(body: unknown) {
    return new Request('http://localhost/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('Upload API DELETE', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 9 });
        vi.mocked(removeEquipmentPhotoByPath).mockResolvedValue({ ok: true });
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
        storageMocks.upload.mockResolvedValue({ error: null });
        storageMocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://project.supabase.co/photo.jpg' },
        });
        storageMocks.from.mockReturnValue({
            upload: storageMocks.upload,
            getPublicUrl: storageMocks.getPublicUrl,
        });
        getUserMock.mockResolvedValue({
            user: { id: 'user-1' },
            supabase: null,
            error: null,
        });
    });

    it('retorna 401 quando o usuário não está autenticado', async () => {
        getUserMock.mockResolvedValue({
            user: null,
            supabase: null,
            error: new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 }),
        });

        const response = await DELETE(request({ path: 'user-1/photo.jpg' }));

        expect(response.status).toBe(401);
        expect(removeEquipmentPhotoByPath).not.toHaveBeenCalled();
    });

    it('retorna 429 quando o limite é excedido', async () => {
        vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 });

        const response = await DELETE(request({ path: 'user-1/photo.jpg' }));

        expect(response.status).toBe(429);
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('rejeita um caminho inválido ou de outro usuário', async () => {
        vi.mocked(removeEquipmentPhotoByPath).mockResolvedValue({
            ok: false,
            reason: 'invalid_path',
        });

        const response = await DELETE(request({ path: 'user-2/photo.jpg' }));

        expect(response.status).toBe(400);
        expect(removeEquipmentPhotoByPath).toHaveBeenCalledWith('user-2/photo.jpg', 'user-1');
    });

    it('remove a imagem pertencente ao usuário', async () => {
        const response = await DELETE(request({ path: 'user-1/photo.jpg' }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ message: 'Imagem excluída com sucesso.' });
    });

    it('retorna 500 quando o Storage falha', async () => {
        vi.mocked(removeEquipmentPhotoByPath).mockResolvedValue({
            ok: false,
            reason: 'storage_error',
            message: 'Storage error',
        });

        const response = await DELETE(request({ path: 'user-1/photo.jpg' }));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({ error: 'Erro ao excluir a imagem.' });
    });

    it('deriva a extensão do objeto pelo MIME validado', async () => {
        const formData = new FormData();
        formData.append('file', new File(['image'], 'nome-enganoso.exe', { type: 'image/jpeg' }));

        const response = await POST(new Request('http://localhost/api/upload', {
            method: 'POST',
            body: formData,
        }));

        expect(response.status).toBe(200);
        const [path] = storageMocks.upload.mock.calls[0];
        expect(path).toMatch(/^user-1\/\d+-[a-z0-9]{6}\.jpg$/);
    });
});
