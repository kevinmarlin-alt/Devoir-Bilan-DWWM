import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../src/errors/AppError.js';
import { validatePlacePayload } from '../src/validators/place.validator.js';

test('accepts a draft with only a name', () => {
    const place = validatePlacePayload({ name: '  Villa des Pins  ' });

    assert.deepEqual(place, {
        name: 'Villa des Pins',
        description: null,
        categoryId: null,
        exploitationTypeIds: [],
        imageIds: [],
        mainImageId: null,
        status: 'draft'
    });
});

test('accepts the minimal draft sent by the form', () => {
    const place = validatePlacePayload({
        name: 'lieu brouillon',
        description: '',
        categoryId: '',
        exploitationTypeIds: [],
        imageIds: [],
        mainImageId: null,
        status: 'draft'
    });

    assert.deepEqual(place, {
        name: 'lieu brouillon',
        description: null,
        categoryId: null,
        exploitationTypeIds: [],
        imageIds: [],
        mainImageId: null,
        status: 'draft'
    });
});

test('accepts a complete publication', () => {
    const place = validatePlacePayload({
        name: 'Villa des Pins',
        description: 'Une villa lumineuse.',
        categoryId: 1,
        exploitationTypeIds: [2, 3],
        imageIds: [4],
        mainImageId: 4,
        status: 'published'
    });

    assert.deepEqual(place.exploitationTypeIds, [2, 3]);
    assert.deepEqual(place.imageIds, [4]);
    assert.equal(place.mainImageId, 4);
});

test('accepts an archived place', () => {
    const place = validatePlacePayload({
        name: 'Villa des Pins',
        status: 'archived'
    });

    assert.equal(place.status, 'archived');
});

test('rejects an incomplete publication', () => {
    assert.throws(
        () => validatePlacePayload({ name: 'Villa des Pins', status: 'published' }),
        (error) => error instanceof AppError && error.code === 'INCOMPLETE_PLACE_PUBLICATION' && error.statusCode === 400
    );
});

test('rejects an unknown status', () => {
    assert.throws(
        () => validatePlacePayload({ name: 'Villa des Pins', status: 'online' }),
        (error) => error instanceof AppError && error.code === 'INVALID_PLACE_DATA' && error.statusCode === 400
    );
});

test('rejects a publication without a main image', () => {
    assert.throws(
        () => validatePlacePayload({
            name: 'Villa des Pins',
            description: 'Une villa lumineuse.',
            categoryId: 1,
            exploitationTypeIds: [2],
            imageIds: [4],
            status: 'published'
        }),
        (error) => error instanceof AppError && error.code === 'INCOMPLETE_PLACE_PUBLICATION' && error.statusCode === 400
    );
});
