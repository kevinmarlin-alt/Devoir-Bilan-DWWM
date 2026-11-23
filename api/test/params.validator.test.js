import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../src/errors/AppError.js';
import { isParamsExiste, validatePositiveIntegerParam } from '../src/validators/params.validator.js';

test('accepts existing HTTP request parameters', () => {
    assert.doesNotThrow(() => {
        isParamsExiste({ params: { id: '12', slug: 'villa-des-pins' } }, ['id', 'slug']);
    });
});

test('rejects a missing HTTP request parameter', () => {
    assert.throws(
        () => isParamsExiste({ params: { id: '12' } }, ['id', 'slug']),
        (error) => (
            error instanceof AppError
            && error.statusCode === 402
            && error.code === 'NO_CONTENT_PARAMS'
            && error.message === 'Le paramettre "slug" de la requêtte HTTP est manquant.'
        )
    );
});

test('normalizes a positive integer parameter', () => {
    assert.equal(validatePositiveIntegerParam('12'), 12);
});

test('rejects an invalid place identifier', () => {
    assert.throws(
        () => validatePositiveIntegerParam('place'),
        (error) => error instanceof AppError
            && error.statusCode === 400
            && error.code === 'INVALID_PLACE_ID'
    );
});

test('rejects non-canonical integer parameters', () => {
    for (const value of ['1.5', '1e2', '0', '-1']) {
        assert.throws(
            () => validatePositiveIntegerParam(value),
            (error) => error instanceof AppError
                && error.statusCode === 400
                && error.code === 'INVALID_PLACE_ID'
        );
    }
});
