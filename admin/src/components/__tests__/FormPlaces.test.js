import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FormPlaces from '../FormPlaces.vue';

describe('FormPlaces', () => {
  it('emits trimmed form data when the name changes', async () => {
    const wrapper = mount(FormPlaces, {
      props: {
        categories: [],
        types: [],
        images: [],
        currentStep: 1,
      },
    });

    await wrapper.get('#name').setValue('  Villa Méditerranée  ');

    expect(wrapper.emitted('data-form')?.at(-1)?.[0]).toEqual({
      name: 'Villa Méditerranée',
      description: '',
      category: '',
      types: [],
      images: [],
      mainImageId: null,
    });
  });
});
