import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const downloadMock = vi.fn();
const fromMock = vi.fn();

vi.mock('@/lib/auth', () => ({ getUser: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: vi.fn() }));

import { getUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// O handler vive em `[...path]`; o teste fica fora da pasta catch-all.
import { GET } from '../[...path]/route';

type AuthMockResult =
    | { user: { id: string }; supabase: unknown; error: null }
    | { user: null; supabase: null; error: Response };

const getUserMock = vi.mocked(getUser) as Mock<() => Promise<AuthMockResult>>;

function context(...segments: string[]) {
    return { params: Promise.resolve({ path: segments }) };
}

function authenticate() {
    getUserMock.mockResolvedValue({
        user: { id: 'user-1' },
        supabase: { storage: { from: fromMock } },
        error: null,
    });
}

describe('GET /api/photos/[...path]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fromMock.mockReturnValue({ download: downloadMock });
        downloadMock.mockResolvedValue({
            data: new Blob(['imagem'], { type: 'image/jpeg' }),
            error: null,
        });
    });

    it('retorna 401 sem sessão', async () => {
        getUserMock.mockResolvedValue({
            user: null,
            supabase: null,
            error: new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 }),
        });

        const response = await GET(new Request('http://localhost/api/photos/user-1/a.jpg'), context('user-1', 'a.jpg'));

        expect(response.status).toBe(401);
        expect(fromMock).not.toHaveBeenCalled();
    });

    it('retorna 404 para a pasta de outro usuário, sem tocar no Storage', async () => {
        authenticate();

        const response = await GET(
            new Request('http://localhost/api/photos/user-2/a.jpg'),
            context('user-2', 'a.jpg'),
        );

        expect(response.status).toBe(404);
        expect(fromMock).not.toHaveBeenCalled();
    });

    it.each([
        ['user-1', '..', 'a.jpg'],
        ['user-1', 'a.svg'],
        ['user-1'],
        ['user-1', '%E0%A4%A'],
    ])('retorna 404 para caminho inválido: %j', async (...segments) => {
        authenticate();

        const response = await GET(new Request('http://localhost/api/photos/x'), context(...segments));

        expect(response.status).toBe(404);
        expect(fromMock).not.toHaveBeenCalled();
    });

    it('retorna 404 quando o objeto não existe no bucket', async () => {
        authenticate();
        downloadMock.mockResolvedValue({ data: null, error: { message: 'Object not found' } });

        const response = await GET(
            new Request('http://localhost/api/photos/user-1/a.jpg'),
            context('user-1', 'a.jpg'),
        );

        expect(response.status).toBe(404);
        expect(logger).toHaveBeenCalledWith(
            'warn',
            'photo.download_failed',
            expect.objectContaining({ userId: 'user-1' }),
        );
    });

    it('entrega a imagem com headers de cache privado', async () => {
        authenticate();

        const response = await GET(
            new Request('http://localhost/api/photos/user-1/a.jpg'),
            context('user-1', 'a.jpg'),
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/jpeg');
        expect(response.headers.get('cache-control')).toBe('private, max-age=3600');
        expect(await response.text()).toBe('imagem');
        expect(fromMock).toHaveBeenCalledWith('equipment-photos');
        expect(downloadMock).toHaveBeenCalledWith('user-1/a.jpg');
    });
});
