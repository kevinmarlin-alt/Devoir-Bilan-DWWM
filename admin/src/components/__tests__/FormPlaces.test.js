import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FormPlaces from '../FormPlaces.vue';
import ImagePlace from '../ImagePlace.vue';

const emptyForm = () => ({
    name: '',
    description: '',
    categoryId: null,
    exploitationTypeIds: [],
    imageIds: [],
    mainImageId: null
});

const images = [
    { imageId: 1, filename: 'one.jpg', alt: 'One' },
    { imageId: 2, filename: 'two.jpg', alt: 'Two' }
];

const findImage = (wrapper, imageId) => (
    wrapper.findAllComponents(ImagePlace)
        .find((component) => component.props('source').imageId === imageId)
);

describe('FormPlaces', () => {
    it('emits a complete immutable model when a field changes', async () => {
        const modelValue = emptyForm();
        const wrapper = mount(FormPlaces, {
            props: {
                modelValue,
                currentStep: 1
            }
        });

        await wrapper.get('#name').setValue('Villa Méditerranée');

        expect(modelValue.name).toBe('');
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual({
            ...emptyForm(),
            name: 'Villa Méditerranée'
        });
    });

    it('selects the first image as main and preserves image order', async () => {
        const wrapper = mount(FormPlaces, {
            props: {
                modelValue: emptyForm(),
                currentStep: 2,
                images
            }
        });

        findImage(wrapper, 2).vm.$emit('image', 2);
        const firstSelection = wrapper.emitted('update:modelValue').at(-1)[0];
        expect(firstSelection.imageIds).toEqual([2]);
        expect(firstSelection.mainImageId).toBe(2);

        await wrapper.setProps({ modelValue: firstSelection });
        findImage(wrapper, 1).vm.$emit('image', 1);
        const secondSelection = wrapper.emitted('update:modelValue').at(-1)[0];
        expect(secondSelection.imageIds).toEqual([2, 1]);
        expect(secondSelection.mainImageId).toBe(2);
    });

    it('promotes the first remaining image and resets the main image for an empty list', async () => {
        const wrapper = mount(FormPlaces, {
            props: {
                modelValue: {
                    ...emptyForm(),
                    imageIds: [2, 1],
                    mainImageId: 2
                },
                currentStep: 2,
                images
            }
        });

        findImage(wrapper, 2).vm.$emit('image', 2);
        const remainingSelection = wrapper.emitted('update:modelValue').at(-1)[0];
        expect(remainingSelection.imageIds).toEqual([1]);
        expect(remainingSelection.mainImageId).toBe(1);

        await wrapper.setProps({ modelValue: remainingSelection });
        findImage(wrapper, 1).vm.$emit('image', 1);
        const emptySelection = wrapper.emitted('update:modelValue').at(-1)[0];
        expect(emptySelection.imageIds).toEqual([]);
        expect(emptySelection.mainImageId).toBeNull();
    });

    it('allows a selected image to become the only main image', () => {
        const wrapper = mount(FormPlaces, {
            props: {
                modelValue: {
                    ...emptyForm(),
                    imageIds: [1, 2],
                    mainImageId: 1
                },
                currentStep: 2,
                images
            }
        });

        findImage(wrapper, 2).vm.$emit('main-image', 2);

        expect(wrapper.emitted('update:modelValue').at(-1)[0].mainImageId).toBe(2);
    });
});
