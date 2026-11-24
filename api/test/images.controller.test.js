import assert from 'node:assert/strict';
import test from 'node:test';

import { getAvailableImages, getImages } from '../src/controllers/images.controller.js';
import { Image } from '../src/models/Image.js';

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.body = payload;
        return this;
    }
});

test('returns available images with HTTP 200', async (context) => {
    const availableImages = [{ imageId: 4, placeId: null }];
    context.mock.method(Image, 'findAll', async () => availableImages);
    const response = createResponse();

    await getAvailableImages({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, availableImages);
});

test('returns an empty available image list with HTTP 200', async (context) => {
    context.mock.method(Image, 'findAll', async () => []);
    const response = createResponse();

    await getAvailableImages({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, []);
});

test('keeps the legacy image handler functional', async (context) => {
    const availableImages = [{ imageId: 7, placeId: null }];
    context.mock.method(Image, 'findAll', async () => availableImages);
    const response = createResponse();

    await getImages({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, availableImages);
});
