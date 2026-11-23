import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FormPlaces from '@/components/FormPlaces.vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import successPublication from '@/components/publication/successPublication.vue';
import { createPlace, getAvailableImages, updatePlace } from '@/services/places.service.js';
import PlacesCreateView from '../PlacesCreateView.vue';

vi.mock('@/router', () => ({
    default: { push: vi.fn() }
}));

vi.mock('@/services/places.service.js', () => ({
    createPlace: vi.fn(),
    getAvailableImages: vi.fn(),
    updatePlace: vi.fn()
}));

vi.mock('@/services/categories.service.js', () => ({
    getAllCategories: vi.fn().mockResolvedValue([])
}));

vi.mock('@/services/exploitationTypes.service', () => ({
    getAll: vi.fn().mockResolvedValue([])
}));

const completeForm = {
    name: 'Villa Méditerranée',
    description: 'Une villa lumineuse.',
    categoryId: 1,
    exploitationTypeIds: [2],
    imageIds: [3],
    mainImageId: 3
};

const mountView = () => mount(PlacesCreateView, {
    global: {
        stubs: {
            RouterLink: {
                template: '<a><slot /></a>'
            }
        }
    }
});

const buttonWithText = (wrapper, text) => (
    wrapper.findAll('button').find((button) => button.text() === text)
);

describe('PlacesCreateView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getAvailableImages.mockResolvedValue([]);
    });

    it('creates, updates and publishes a draft with the normalized form contract', async () => {
        createPlace.mockResolvedValue({ placeId: 12, status: 'draft' });
        updatePlace.mockResolvedValue({ placeId: 12, status: 'draft' });
        const wrapper = mountView();
        await flushPromises();

        expect(getAvailableImages).toHaveBeenCalledOnce();
        wrapper.findComponent(FormPlaces).vm.$emit('update:modelValue', completeForm);
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();

        expect(createPlace).toHaveBeenCalledWith({
            ...completeForm,
            status: 'draft'
        });

        wrapper.findComponent(FormPlaces).vm.$emit('update:modelValue', {
            ...completeForm,
            name: 'Villa mise à jour'
        });
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Enregistrer').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenCalledWith(12, {
            ...completeForm,
            name: 'Villa mise à jour',
            status: 'draft'
        });

        wrapper.findComponent(ProgressBarCreatePlace).vm.$emit('selected-step', 3);
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Publier').trigger('click');
        await flushPromises();

        expect(updatePlace).toHaveBeenLastCalledWith(12, {
            ...completeForm,
            name: 'Villa mise à jour',
            status: 'published'
        });
    });

    it('publishes a complete form and renders success outside the form', async () => {
        createPlace.mockResolvedValue({
            placeId: 14,
            status: 'published',
            slug: 'villa-mediterranee'
        });
        const wrapper = mountView();
        await flushPromises();

        wrapper.findComponent(FormPlaces).vm.$emit('update:modelValue', completeForm);
        wrapper.findComponent(ProgressBarCreatePlace).vm.$emit('selected-step', 3);
        await wrapper.vm.$nextTick();
        await buttonWithText(wrapper, 'Publier').trigger('click');
        await flushPromises();

        expect(createPlace).toHaveBeenCalledWith({
            ...completeForm,
            status: 'published'
        });
        expect(wrapper.findComponent(successPublication).exists()).toBe(true);
        expect(wrapper.findComponent(FormPlaces).props()).not.toHaveProperty('status');
        expect(wrapper.findComponent(FormPlaces).props()).not.toHaveProperty('place');
    });
});
