import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOnePlace } from '@/services/places.service.js';
import PlaceSingleView from '../PlaceSingleView.vue';

const router = { push: vi.fn() };

vi.mock('vue-router', () => ({
    useRoute: () => ({ params: { id: '12' } }),
    useRouter: () => router
}));

vi.mock('@/services/places.service.js', () => ({
    changeStatus: vi.fn(),
    deletePlace: vi.fn(),
    getOnePlace: vi.fn()
}));

const place = (status) => ({
    placeId: 12,
    name: 'Villa',
    description: 'Description',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    category: null,
    exploitationTypes: [],
    images: []
});

const mountView = () => mount(PlaceSingleView, {
    global: {
        stubs: {
            RouterLink: { template: '<a><slot /></a>' }
        }
    }
});

describe('PlaceSingleView update action', () => {
    beforeEach(() => vi.clearAllMocks());

    it.each(['draft', 'published'])('shows Modify for a %s place', async (status) => {
        getOnePlace.mockResolvedValue(place(status));
        const wrapper = mountView();
        await flushPromises();

        expect(wrapper.text()).toContain('Modifier');
    });

    it('opens the update route from the Modify action', async () => {
        getOnePlace.mockResolvedValue(place('draft'));
        const wrapper = mountView();
        await flushPromises();

        await wrapper.findAll('button').find((button) => button.text() === 'Modifier').trigger('click');

        expect(router.push).toHaveBeenCalledWith({
            name: 'places_update',
            params: { id: 12 }
        });
    });

    it('hides Modify for an archived place', async () => {
        getOnePlace.mockResolvedValue(place('archived'));
        const wrapper = mountView();
        await flushPromises();

        expect(wrapper.text()).not.toContain('Modifier');
    });
});
