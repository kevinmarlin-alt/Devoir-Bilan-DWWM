import { describe, expect, it } from 'vitest';

import {
    arePlaceFormsEqual,
    isCompletePlaceForm,
    mergePlaceImages,
    normalizePlaceForm,
    placeToForm
} from '../placeForm.js';

const place = {
    name: 'Villa',
    description: 'Description',
    category: { categoryId: 3 },
    exploitationTypes: [
        { exploitationTypeId: 9 },
        { exploitationTypeId: 2 }
    ],
    images: [
        { imageId: 7, isMain: false },
        { imageId: 4, isMain: true }
    ]
};

describe('place form utilities', () => {
    it('maps an enriched place to the shared form contract', () => {
        expect(placeToForm(place)).toEqual({
            name: 'Villa',
            description: 'Description',
            categoryId: 3,
            exploitationTypeIds: [9, 2],
            imageIds: [7, 4],
            mainImageId: 4
        });
    });

    it('normalizes text and type order without sorting image order', () => {
        expect(normalizePlaceForm({
            ...placeToForm(place),
            name: '  Villa  ',
            exploitationTypeIds: ['9', '2'],
            imageIds: ['7', '4']
        })).toEqual({
            name: 'Villa',
            description: 'Description',
            categoryId: 3,
            exploitationTypeIds: [2, 9],
            imageIds: [7, 4],
            mainImageId: 4
        });
    });

    it('ignores normalized text and type-order differences but detects image reordering', () => {
        const form = placeToForm(place);

        expect(arePlaceFormsEqual(form, {
            ...form,
            name: ' Villa ',
            exploitationTypeIds: [2, 9]
        })).toBe(true);
        expect(arePlaceFormsEqual(form, {
            ...form,
            imageIds: [4, 7]
        })).toBe(false);
    });

    it('deduplicates the merged image library', () => {
        expect(mergePlaceImages(
            [{ imageId: 4 }, { imageId: 7 }],
            [{ imageId: 7 }, { imageId: 9 }]
        ).map((image) => image.imageId)).toEqual([4, 7, 9]);
    });

    it('requires a complete form whose main image is selected', () => {
        const form = placeToForm(place);

        expect(isCompletePlaceForm(form)).toBe(true);
        expect(isCompletePlaceForm({ ...form, mainImageId: 12 })).toBe(false);
    });
});
