import assert from 'node:assert/strict';
import test from 'node:test';

import { Image } from '../src/models/Image.js';
import { findAvailableImages } from '../src/repositories/images.repository.js';

test('finds only images without an assigned place', async (context) => {
    const availableImages = [
        { imageId: 2, placeId: null },
        { imageId: 5, placeId: null }
    ];
    const findAll = context.mock.method(Image, 'findAll', async () => availableImages);

    const result = await findAvailableImages();

    assert.deepEqual(result, availableImages);
    assert.deepEqual(findAll.mock.calls[0].arguments, [
        { where: { placeId: null } }
    ]);
});

test('returns an empty list when no image is available', async (context) => {
    context.mock.method(Image, 'findAll', async () => []);

    const result = await findAvailableImages();

    assert.deepEqual(result, []);
});
