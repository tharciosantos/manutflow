import { describe, expect, it } from 'vitest';

import {
    getEquipmentPhotoPath,
    isOwnedEquipmentPhotoPath,
    isOwnedEquipmentPhotoUrl,
    toEquipmentPhotoUrl,
} from '@/lib/equipment-photo-path';

describe('Equipment photo path', () => {
    describe('isOwnedEquipmentPhotoPath', () => {
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
    });

    describe('getEquipmentPhotoPath', () => {
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
    });

    describe('URL interna do proxy (AUD-15)', () => {
        it('monta a URL do proxy a partir do caminho', () => {
            expect(toEquipmentPhotoUrl('user-1/1712345678-a1b2c3.jpg'))
                .toBe('/api/photos/user-1/1712345678-a1b2c3.jpg');
        });

        it('codifica cada segmento do caminho', () => {
            expect(toEquipmentPhotoUrl('user-1/foto com espaço.jpg'))
                .toBe('/api/photos/user-1/foto%20com%20espa%C3%A7o.jpg');
        });

        it('extrai o caminho de uma URL do proxy', () => {
            expect(getEquipmentPhotoPath('/api/photos/user-1/photo.jpg', 'user-1', ''))
                .toBe('user-1/photo.jpg');
        });

        it('rejeita nome de arquivo com caractere fora da lista permitida', () => {
            // A lista é [A-Za-z0-9._-]; espaço decodificado não passa.
            expect(getEquipmentPhotoPath('/api/photos/user-1/foto%20a.jpg', 'user-1', ''))
                .toBeNull();
        });

        it.each([
            '/api/photos/user-2/photo.jpg',
            '/api/photos/user-1/../photo.jpg',
            '/api/photos/user-1/photo.svg',
            '/api/photos/user-1',
            '/api/photos/user-1/%E0%A4%A',
        ])('rejeita URL do proxy de outro usuário ou malformada: %s', (url) => {
            expect(getEquipmentPhotoPath(url, 'user-1', '')).toBeNull();
        });
    });

    describe('isOwnedEquipmentPhotoUrl', () => {
        it('usa NEXT_PUBLIC_SUPABASE_URL para validar o formato legado', () => {
            const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
            process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';

            try {
                expect(isOwnedEquipmentPhotoUrl(
                    'https://project.supabase.co/storage/v1/object/public/equipment-photos/user-1/photo.jpg',
                    'user-1',
                )).toBe(true);
                expect(isOwnedEquipmentPhotoUrl('/api/photos/user-2/photo.jpg', 'user-1')).toBe(false);
            } finally {
                if (original === undefined) {
                    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
                } else {
                    process.env.NEXT_PUBLIC_SUPABASE_URL = original;
                }
            }
        });
    });
});
