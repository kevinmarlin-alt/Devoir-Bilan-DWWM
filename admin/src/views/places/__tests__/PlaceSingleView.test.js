import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { changeStatus, getOnePlace, getPlaceMetrics } from '@/services/places.service.js';
import InProgressCard from '@/views/sharedViews/inProgressCard.vue';
import SuccessCard from '@/views/sharedViews/successCard.vue';
import WarningCard from '@/views/sharedViews/WarningCard.vue';
import PlaceSingleView from '../PlaceSingleView.vue';

const router = { push: vi.fn() };

vi.mock('vue-router', () => ({
    useRoute: () => ({ params: { id: '12' } }),
    useRouter: () => router
}));

vi.mock('@/services/places.service.js', () => ({
    changeStatus: vi.fn(),
    deletePlace: vi.fn(),
    getOnePlace: vi.fn(),
    getPlaceMetrics: vi.fn()
}));

const place = (status, images = []) => ({
    placeId: 12,
    name: 'Villa',
    description: 'Description',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    category: null,
    exploitationTypes: [],
    images
});

const mountView = () => mount(PlaceSingleView, {
    global: {
        stubs: {
            RouterLink: { template: '<a><slot /></a>' }
        }
    }
});

const zeroMetrics = { views: 0, inquiries: 0, conversionRate: 0 };

describe('PlaceSingleView', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        getPlaceMetrics.mockResolvedValue(zeroMetrics);
    });

    it('loads the place and its metrics in parallel and renders the metrics when ready', async () => {
        let resolvePlace;
        let resolveMetrics;
        getOnePlace.mockReturnValue(new Promise((resolve) => { resolvePlace = resolve; }));
        getPlaceMetrics.mockReturnValue(new Promise((resolve) => { resolveMetrics = resolve; }));
        const wrapper = mountView();
        expect(getOnePlace).toHaveBeenCalledWith('12');
        expect(getPlaceMetrics).toHaveBeenCalledWith('12');

        resolvePlace(place('published'));
        await flushPromises();
        expect(wrapper.text()).toContain('Chargement des métriques');
        expect(wrapper.text()).toContain('Modifier');
        expect(wrapper.findAll('.metric-card')).toHaveLength(0);

        resolveMetrics({ views: 42, inquiries: 5, conversionRate: 12 });
        await flushPromises();
        expect(wrapper.findAll('.metric-card span').map((value) => value.text())).toEqual(['42', '5', '12 %']);
        expect(wrapper.text().match(/Données des 90 derniers jours/g)).toHaveLength(1);
    });

    it('renders zero values and the percent suffix for a draft place', async () => {
        getOnePlace.mockResolvedValue(place('draft'));
        const wrapper = mountView();
        await flushPromises();
        expect(wrapper.findAll('.metric-card span').map((value) => value.text())).toEqual(['0', '0', '0 %']);
    });

    it('keeps place details and the Modify action usable when metrics fail', async () => {
        getOnePlace.mockResolvedValue(place('archived'));
        getPlaceMetrics.mockRejectedValue(new Error('503'));
        const wrapper = mountView();
        await flushPromises();
        expect(wrapper.text()).toContain('Les métriques sont temporairement indisponibles.');
        expect(wrapper.text()).toContain('Informations générales');
        expect(wrapper.findAll('.metric-card')).toHaveLength(0);
        await wrapper.findAll('button').find((button) => button.text() === 'Modifier').trigger('click');
        expect(router.push).toHaveBeenCalledWith({ name: 'places_update', params: { id: 12 } });
    });

    it.each(['draft', 'published', 'archived'])('shows Modify for a %s place', async (status) => {
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

    it('opens the update route for an archived place', async () => {
        getOnePlace.mockResolvedValue(place('archived'));
        const wrapper = mountView();
        await flushPromises();

        await wrapper.findAll('button').find((button) => button.text() === 'Modifier').trigger('click');

        expect(router.push).toHaveBeenCalledWith({
            name: 'places_update',
            params: { id: 12 }
        });
    });

    it('completes the archive cycle while preserving the enriched place', async () => {
        vi.useFakeTimers();
        let resolveArchiving;
        const publishedPlace = place('published');
        const archivedPlace = {
            ...publishedPlace,
            status: 'archived',
            updatedAt: '2026-11-24T09:40:00.000Z'
        };
        getOnePlace.mockResolvedValue(publishedPlace);
        changeStatus.mockReturnValue(new Promise((resolve) => {
            resolveArchiving = resolve;
        }));

        try {
            const wrapper = mountView();
            await flushPromises();

            await wrapper.findAll('button').find((button) => button.text() === 'Archiver').trigger('click');
            wrapper.findComponent(WarningCard).vm.$emit('confirm');
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(InProgressCard).exists()).toBe(true);

            resolveArchiving(archivedPlace);
            await flushPromises();

            expect(changeStatus).toHaveBeenCalledWith('12', 'archived');
            expect(wrapper.findComponent(InProgressCard).exists()).toBe(false);
            expect(wrapper.findComponent(SuccessCard).exists()).toBe(true);
            expect(wrapper.text()).toContain('Villa');
            expect(wrapper.text()).toContain('Archivé');

            vi.advanceTimersByTime(3000);
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(SuccessCard).exists()).toBe(false);
            expect(wrapper.text()).toContain('Modifier');
            expect(wrapper.text()).toContain('Supprimer');
        } finally {
            vi.useRealTimers();
        }
    });

    it('renders the image count with the parent heading typography', async () => {
        getOnePlace.mockResolvedValue(place('published', [
            { imageId: 1, filename: 'one.jpg', isMain: true },
            { imageId: 2, filename: 'two.jpg', isMain: false }
        ]));
        const wrapper = mountView();
        await flushPromises();
        const imageHeading = wrapper.findAll('h3').find((heading) => heading.text() === 'Images (2)');

        expect(imageHeading.exists()).toBe(true);
        expect(imageHeading.find('span').exists()).toBe(false);
    });
});
