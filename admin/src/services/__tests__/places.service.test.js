import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '../api.service.js';
import { getAvailableImages } from '../places.service.js';

vi.mock('../api.service.js', () => ({
    apiFetch: vi.fn()
}));

describe('places service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads images from the explicit available-images endpoint', async () => {
        const images = [{ imageId: 3 }];
        apiFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(images)
        });

        await expect(getAvailableImages()).resolves.toEqual(images);
        expect(apiFetch).toHaveBeenCalledWith('api/admin/images/available');
    });

    it('reports an unavailable image library', async () => {
        apiFetch.mockResolvedValue({ ok: false });

        await expect(getAvailableImages()).rejects.toThrow(
            'Impossible de récupérer les images disponibles'
        );
    });
});
