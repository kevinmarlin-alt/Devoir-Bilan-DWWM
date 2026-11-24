import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProgressBarCreatePlace from '../ProgressBarCreatePlace.vue';

describe('ProgressBarCreatePlace', () => {
    it('does not emit navigation when linear navigation is disabled', async () => {
        const wrapper = mount(ProgressBarCreatePlace, {
            props: { currentStep: 2, allowNavigation: false }
        });

        await wrapper.findAll('button')[0].trigger('click');

        expect(wrapper.emitted('selected-step')).toBeUndefined();
    });

    it('keeps previous-step navigation for the creation workflow', async () => {
        const wrapper = mount(ProgressBarCreatePlace, {
            props: { currentStep: 2 }
        });

        await wrapper.findAll('button')[0].trigger('click');

        expect(wrapper.emitted('selected-step')).toEqual([[1]]);
    });
});
