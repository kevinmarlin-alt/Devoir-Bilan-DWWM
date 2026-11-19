import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../src/errors/AppError.js';
import { isParamsExiste } from '../src/validators/params.validator.js';

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
            && error.code === 'NO_CONTENT'
            && error.message === 'Le paramettre "slug" de la requêtte HTTP est manquant.'
        )
    );
});
