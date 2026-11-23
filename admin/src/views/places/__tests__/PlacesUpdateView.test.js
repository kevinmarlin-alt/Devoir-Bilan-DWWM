import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FormPlaces from '@/components/FormPlaces.vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import RegistrationStatus from '@/components/RegistrationStatus.vue';
import successPublication from '@/components/publication/successPublication.vue';
import { getAvailableImages, getOnePlace, updatePlace } from '@/services/places.service.js';
import errorCard from '@/views/sharedViews/errorCard.vue';
import PlacesUpdateView from '../PlacesUpdateView.vue';

const route = { params: { id: '12' } };
const router = {
    push: vi.fn(),
    replace: vi.fn()
};

vi.mock('vue-router', () => ({
    useRoute: () => route,
    useRouter: () => router
}));

vi.mock('@/services/places.service.js', () => ({
    getAvailableImages: vi.fn(),
    getOnePlace: vi.fn(),
    updatePlace: vi.fn()
}));

vi.mock('@/services/categories.service.js', () => ({
    getAllCategories: vi.fn().mockResolvedValue([
        { categoryId: 1, categoryName: 'Villa' }
    ])
}));

vi.mock('@/services/exploitationTypes.service', () => ({
    getAll: vi.fn().mockResolvedValue([
        { exploitationTypeId: 2, exploitationTypeName: 'Shooting' }
    ])
}));

const draftPlace = () => ({
    placeId: 12,
    name: 'Villa Méditerranée',
    description: 'Une villa lumineuse.',
    status: 'draft',
    slug: 'villa-mediterranee',
    category: { categoryId: 1, categoryName: 'Villa' },
    exploitationTypes: [
        { exploitationTypeId: 2, exploitationTypeName: 'Shooting' }
    ],
    images: [
        { imageId: 3, filename: 'current.jpg', isMain: true }
    ]
});

const mountView = () => mount(PlacesUpdateView, {
    global: {
        stubs: {
            RouterLink: { template: '<a><slot /></a>' }
        }
    }
});

const buttonWithText = (wrapper, text) => (
    wrapper.findAll('button').find((button) => button.text() === text)
);

describe('PlacesUpdateView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getOnePlace.mockResolvedValue(draftPlace());
        getAvailableImages.mockResolvedValue([
            { imageId: 3, filename: 'duplicate.jpg' },
            { imageId: 4, filename: 'available.jpg' }
        ]);
        updatePlace.mockImplementation(async (_placeId, payload) => ({
            ...draftPlace(),
            name: payload.name,
            description: payload.description,
            status: payload.status,
            images: payload.imageIds.map((imageId) => ({
                imageId,
                filename: `${imageId}.jpg`,
                isMain: imageId === payload.mainImageId
            }))
        }));
    });

    it('prefills the shared form and deduplicates the image library', async () => {
        const wrapper = mountView();
        await flushPromises();

        const form = wrapper.findComponent(FormPlaces);
        expect(form.props('modelValue')).toEqual({
            name: 'Villa Méditerranée',
            description: 'Une villa lumineuse.',
            categoryId: 1,
            exploitationTypeIds: [2],
            imageIds: [3],
            mainImageId: 3
        });
        expect(form.props('images').map((image) => image.imageId)).toEqual([3, 4]);
        expect(wrapper.findComponent(ProgressBarCreatePlace).props('allowNavigation')).toBe(false);
        expect(wrapper.findComponent(RegistrationStatus).props('isSaved')).toBe(true);
    });

    it('tracks normalized changes and saves with the current status', async () => {
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);
        const initialForm = form.props('modelValue');

        form.vm.$emit('update:modelValue', { ...initialForm, name: '  Villa Méditerranée  ' });
        await wrapper.vm.$nextTick();
        expect(buttonWithText(wrapper, 'Enregistrer').attributes('disabled')).toBeDefined();

        form.vm.$emit('update:modelValue', { ...initialForm, name: 'Villa Atlantique' });
        await wrapper.vm.$nextTick();
        expect(buttonWithText(wrapper, 'Enregistrer').attributes('disabled')).toBeUndefined();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenCalledWith(12, {
            ...initialForm,
            name: 'Villa Atlantique',
            status: 'draft'
        });
        expect(wrapper.findComponent(RegistrationStatus).props('isSaved')).toBe(true);
    });

    it('publishes a complete draft from the verification step', async () => {
        const wrapper = mountView();
        await flushPromises();

        await buttonWithText(wrapper, 'Suivant').trigger('click');
        await buttonWithText(wrapper, 'Suivant').trigger('click');
        await buttonWithText(wrapper, 'Publier').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenCalledWith(12, expect.objectContaining({
            status: 'published'
        }));
        expect(wrapper.findComponent(successPublication).exists()).toBe(true);
    });

    it('preserves published status when saving changes', async () => {
        getOnePlace.mockResolvedValue({ ...draftPlace(), status: 'published' });
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);

        form.vm.$emit('update:modelValue', {
            ...form.props('modelValue'),
            description: 'Description mise à jour'
        });
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenCalledWith(12, expect.objectContaining({
            description: 'Description mise à jour',
            status: 'published'
        }));
        expect(wrapper.findComponent(successPublication).exists()).toBe(false);
    });

    it('disables saving an incomplete published place', async () => {
        getOnePlace.mockResolvedValue({ ...draftPlace(), status: 'published' });
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);

        form.vm.$emit('update:modelValue', {
            ...form.props('modelValue'),
            description: ''
        });
        await wrapper.vm.$nextTick();

        expect(buttonWithText(wrapper, 'Enregistrer').attributes('disabled')).toBeDefined();
    });

    it('keeps a successful save when refreshing available images fails', async () => {
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);
        getAvailableImages.mockRejectedValueOnce(new Error('Bibliothèque indisponible'));

        form.vm.$emit('update:modelValue', {
            ...form.props('modelValue'),
            name: 'Villa sauvegardée'
        });
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenCalledOnce();
        expect(wrapper.findComponent(errorCard).exists()).toBe(false);
        expect(wrapper.findComponent(RegistrationStatus).props('isSaved')).toBe(true);
    });

    it('redirects an archived place without rendering the editor', async () => {
        getOnePlace.mockResolvedValue({ ...draftPlace(), status: 'archived' });
        getAvailableImages.mockRejectedValue(new Error('Ne doit pas être appelée'));
        const wrapper = mountView();
        await flushPromises();

        expect(router.replace).toHaveBeenCalledWith({
            name: 'places_single',
            params: { id: 12 }
        });
        expect(getAvailableImages).not.toHaveBeenCalled();
        expect(wrapper.findComponent(FormPlaces).exists()).toBe(false);
    });

    it('ignores a concurrent submission while a request is active', async () => {
        let resolveUpdate;
        updatePlace.mockReturnValue(new Promise((resolve) => {
            resolveUpdate = resolve;
        }));
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);

        form.vm.$emit('update:modelValue', {
            ...form.props('modelValue'),
            name: 'Villa concurrente'
        });
        await wrapper.vm.$nextTick();
        const saveButton = buttonWithText(wrapper, 'Enregistrer');

        saveButton.trigger('click');
        saveButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(updatePlace).toHaveBeenCalledOnce();

        resolveUpdate(draftPlace());
        await flushPromises();
    });

    it('retries the last failed action', async () => {
        updatePlace
            .mockRejectedValueOnce(new Error('Échec temporaire'))
            .mockResolvedValueOnce(draftPlace());
        const wrapper = mountView();
        await flushPromises();
        const form = wrapper.findComponent(FormPlaces);

        form.vm.$emit('update:modelValue', {
            ...form.props('modelValue'),
            name: 'Villa modifiée'
        });
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();
        expect(wrapper.findComponent(errorCard).exists()).toBe(true);

        wrapper.findComponent(errorCard).vm.$emit('retry');
        await flushPromises();
        expect(updatePlace).toHaveBeenCalledTimes(2);
    });
});
