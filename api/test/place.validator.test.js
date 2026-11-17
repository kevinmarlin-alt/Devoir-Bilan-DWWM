import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../src/errors/AppError.js';
import {
    validatePlacePayload,
    validatePlaceDeletion,
    validatePlaceStatusPayload,
    validatePlaceStatusTransition,
    validatePlaceUpdateTransition
} from '../src/validators/place.validator.js';

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

test('accepts the archived status payload', () => {
    assert.equal(validatePlaceStatusPayload({ status: 'archived' }), 'archived');
});

test('accepts the draft status payload', () => {
    assert.equal(validatePlaceStatusPayload({ status: 'draft' }), 'draft');
});

test('rejects an invalid status payload body', () => {
    assert.throws(
        () => validatePlaceStatusPayload(null),
        (error) => error instanceof AppError
            && error.code === 'INVALID_PLACE_STATUS'
            && error.statusCode === 400
    );
});

test('rejects a published status on the dedicated status endpoint', () => {
    assert.throws(
        () => validatePlaceStatusPayload({ status: 'published' }),
        (error) => error instanceof AppError
            && error.code === 'INVALID_PLACE_STATUS'
            && error.statusCode === 400
    );
});

test('allows saving and publishing a draft through the full update', () => {
    assert.doesNotThrow(() => validatePlaceUpdateTransition('draft', 'draft'));
    assert.doesNotThrow(() => validatePlaceUpdateTransition('draft', 'published'));
});

test('allows a published place to remain published through the full update', () => {
    assert.doesNotThrow(() => validatePlaceUpdateTransition('published', 'published'));
});

test('rejects forbidden transitions through the full update', () => {
    const forbiddenTransitions = [
        ['published', 'draft'],
        ['archived', 'draft'],
        ['archived', 'published']
    ];

    for (const [currentStatus, nextStatus] of forbiddenTransitions) {
        assert.throws(
            () => validatePlaceUpdateTransition(currentStatus, nextStatus),
            (error) => error instanceof AppError
                && error.code === 'INVALID_PLACE_TRANSITION'
                && error.statusCode === 409
        );
    }
});

test('allows publishing lifecycle transitions on the dedicated status endpoint', () => {
    assert.doesNotThrow(() => validatePlaceStatusTransition('published', 'archived'));
    assert.doesNotThrow(() => validatePlaceStatusTransition('archived', 'draft'));
});

test('rejects forbidden lifecycle transitions on the dedicated status endpoint', () => {
    const forbiddenTransitions = [
        ['draft', 'archived'],
        ['draft', 'draft'],
        ['published', 'draft'],
        ['archived', 'archived']
    ];

    for (const [currentStatus, nextStatus] of forbiddenTransitions) {
        assert.throws(
            () => validatePlaceStatusTransition(currentStatus, nextStatus),
            (error) => error instanceof AppError
                && error.code === 'INVALID_PLACE_TRANSITION'
                && error.statusCode === 409
        );
    }
});

test('allows deleting draft and archived places', () => {
    assert.doesNotThrow(() => validatePlaceDeletion('draft'));
    assert.doesNotThrow(() => validatePlaceDeletion('archived'));
});

test('rejects deleting published or unknown place statuses', () => {
    for (const status of ['published', 'unknown']) {
        assert.throws(
            () => validatePlaceDeletion(status),
            (error) => error instanceof AppError
                && error.code === 'PLACE_DELETE_FORBIDDEN'
                && error.statusCode === 409
        );
    }
});
