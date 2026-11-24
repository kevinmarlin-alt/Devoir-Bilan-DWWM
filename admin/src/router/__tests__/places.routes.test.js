import { describe, expect, it } from 'vitest';

import router from '../index.js';

describe('place routes', () => {
    it('registers the update route before the detail route', () => {
        const placeRoutes = router.getRoutes().filter((route) => route.path.startsWith('/admin/places'));
        const updateRoute = placeRoutes.find((route) => route.name === 'places_update');
        const detailRoute = placeRoutes.find((route) => route.name === 'places_single');

        expect(updateRoute.path).toBe('/admin/places/:id/update');
        expect(placeRoutes.indexOf(updateRoute)).toBeLessThan(placeRoutes.indexOf(detailRoute));
    });
});
