import assert from 'node:assert/strict';
import test from 'node:test';

import sequelize from '../src/db/database.js';
import { Category } from '../src/models/Category.js';
import { ExploitationType } from '../src/models/ExploitationType.js';
import { Image } from '../src/models/Image.js';
import { Place } from '../src/models/Place.js';
import { AppError } from '../src/errors/AppError.js';
import { createOnePlace, updateOnePlace } from '../src/services/places.service.js';

const transaction = {
    LOCK: { UPDATE: 'UPDATE' }
};

const completeDraft = {
    name: 'Château de l’Été',
    description: 'Description',
    categoryId: 1,
    exploitationTypeIds: [2],
    imageIds: [3],
    mainImageId: 3,
    status: 'draft'
};

const mockTransaction = (context, onRollback = () => {}) => {
    context.mock.method(sequelize, 'transaction', async (callback) => {
        try {
            return await callback(transaction);
        } catch (error) {
            onRollback();
            throw error;
        }
    });
};

const mockReferences = (context, placeId = 7) => {
    context.mock.method(Category, 'findOne', async () => ({ categoryId: 1 }));
    context.mock.method(ExploitationType, 'findOne', async () => ({ exploitationTypeId: 2 }));
    context.mock.method(Image, 'findOne', async () => ({
        imageId: 3,
        placeId: placeId === null ? null : String(placeId)
    }));
    context.mock.method(Image, 'update', async () => [1]);
};

test('updates associations and returns the final enriched place', async (context) => {
    mockTransaction(context);
    mockReferences(context);

    const associationCalls = [];
    const existingPlace = {
        placeId: 7,
        status: 'draft',
        setExploitationTypes: async (...args) => associationCalls.push(args)
    };
    const enrichedPlace = {
        placeId: 7,
        status: 'published',
        exploitationTypes: [{ exploitationTypeId: 2 }],
        images: [{ imageId: 3, isMain: true }]
    };
    let placeLookupCount = 0;
    context.mock.method(Place, 'findOne', async (options) => {
        if (options.where.slug) {
            return null;
        }

        placeLookupCount += 1;
        return placeLookupCount === 1 ? existingPlace : enrichedPlace;
    });
    const update = context.mock.method(Place, 'update', async () => [1]);

    const result = await updateOnePlace(7, {
        ...completeDraft,
        status: 'published'
    });

    assert.equal(result, enrichedPlace);
    assert.deepEqual(associationCalls, [[[2], { transaction }]]);
    assert.equal(update.mock.calls[0].arguments[0].slug, 'chateau-de-l-ete');
    assert.ok(update.mock.calls[0].arguments[0].updatedAt);
    assert.equal(update.mock.calls[0].arguments[1].transaction, transaction);
    assert.equal(Place.findOne.mock.calls[0].arguments[0].lock, transaction.LOCK.UPDATE);
});

test('rejects an archived place before writing', async (context) => {
    mockTransaction(context);
    context.mock.method(Place, 'findOne', async () => ({ placeId: 7, status: 'archived' }));
    const update = context.mock.method(Place, 'update', async () => [1]);

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'ARCHIVED_PLACE_UPDATE_FORBIDDEN'
    );
    assert.equal(update.mock.callCount(), 0);
});

test('rejects a published to draft transition', async (context) => {
    mockTransaction(context);
    context.mock.method(Place, 'findOne', async () => ({ placeId: 7, status: 'published' }));

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'STATUS_CHANGE_NOT_POSSIBLE'
    );
});

test('allows a published place to remain published', async (context) => {
    mockTransaction(context);
    mockReferences(context);
    const existingPlace = {
        placeId: 7,
        status: 'published',
        setExploitationTypes: async () => {}
    };
    const enrichedPlace = { placeId: 7, status: 'published' };
    let lookupCount = 0;
    context.mock.method(Place, 'findOne', async (options) => {
        if (options.where.slug) {
            return null;
        }

        lookupCount += 1;
        return lookupCount === 1 ? existingPlace : enrichedPlace;
    });
    context.mock.method(Place, 'update', async () => [1]);

    const result = await updateOnePlace(7, {
        ...completeDraft,
        status: 'published'
    });

    assert.equal(result, enrichedPlace);
});

test('returns PLACE_NOT_FOUND for an unknown place', async (context) => {
    mockTransaction(context);
    context.mock.method(Place, 'findOne', async () => null);

    await assert.rejects(
        () => updateOnePlace(99, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 404
            && error.code === 'PLACE_NOT_FOUND'
    );
});

test('rejects an image assigned to another place', async (context) => {
    mockTransaction(context);
    context.mock.method(Place, 'findOne', async (options) => (
        options.where.slug ? null : {
            placeId: 7,
            status: 'draft',
            setExploitationTypes: async () => {}
        }
    ));
    context.mock.method(Category, 'findOne', async () => ({ categoryId: 1 }));
    context.mock.method(ExploitationType, 'findOne', async () => ({ exploitationTypeId: 2 }));
    context.mock.method(Image, 'findOne', async () => ({ imageId: 3, placeId: 8 }));

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'IMAGE_ALREADY_ASSIGNED'
    );
});

test('maps a Sequelize slug collision to a conflict', async (context) => {
    mockTransaction(context);
    mockReferences(context);
    context.mock.method(Place, 'findOne', async (options) => (
        options.where.slug ? null : {
            placeId: 7,
            status: 'draft',
            setExploitationTypes: async () => {}
        }
    ));
    const sequelizeError = new Error('duplicate slug');
    sequelizeError.name = 'SequelizeUniqueConstraintError';
    context.mock.method(Place, 'update', async () => {
        throw sequelizeError;
    });

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'SLUG_ALREADY_EXISTS'
    );
});

test('rejects an application slug collision before writing', async (context) => {
    mockTransaction(context);
    mockReferences(context);
    const existingPlace = {
        placeId: 7,
        status: 'draft',
        setExploitationTypes: async () => {}
    };
    context.mock.method(Place, 'findOne', async (options) => (
        options.where.slug ? { placeId: 8 } : existingPlace
    ));
    const update = context.mock.method(Place, 'update', async () => [1]);

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'SLUG_ALREADY_EXISTS'
    );
    assert.equal(update.mock.callCount(), 0);
});

test('propagates an association failure through the transaction', async (context) => {
    let rolledBack = false;
    mockTransaction(context, () => {
        rolledBack = true;
    });
    mockReferences(context);
    context.mock.method(Place, 'findOne', async (options) => (
        options.where.slug ? null : {
            placeId: 7,
            status: 'draft',
            setExploitationTypes: async () => {
                throw new Error('association failed');
            }
        }
    ));
    context.mock.method(Place, 'update', async () => [1]);

    await assert.rejects(
        () => updateOnePlace(7, completeDraft),
        /association failed/
    );
    assert.equal(rolledBack, true);
});

test('rejects a place name that produces an empty slug', async (context) => {
    mockTransaction(context);
    mockReferences(context);
    context.mock.method(Place, 'findOne', async () => ({
        placeId: 7,
        status: 'draft',
        setExploitationTypes: async () => {}
    }));
    const update = context.mock.method(Place, 'update', async () => [1]);

    await assert.rejects(
        () => updateOnePlace(7, { ...completeDraft, name: '!!!' }),
        (error) => error instanceof AppError
            && error.statusCode === 400
            && error.code === 'INVALID_PLACE_DATA'
    );
    assert.equal(update.mock.callCount(), 0);
});

test('creates a place with the shared normalized slug', async (context) => {
    mockTransaction(context);
    mockReferences(context, null);
    context.mock.method(Place, 'findOne', async () => null);
    const createdPlace = {
        placeId: 9,
        setExploitationTypes: async () => {}
    };
    const create = context.mock.method(Place, 'create', async () => createdPlace);

    const result = await createOnePlace(completeDraft);

    assert.equal(result, createdPlace);
    assert.equal(create.mock.calls[0].arguments[0].slug, 'chateau-de-l-ete');
    assert.equal(create.mock.calls[0].arguments[1].transaction, transaction);
});

test('maps a Sequelize slug collision during creation', async (context) => {
    mockTransaction(context);
    mockReferences(context, null);
    context.mock.method(Place, 'findOne', async () => null);
    const sequelizeError = new Error('duplicate slug');
    sequelizeError.name = 'SequelizeUniqueConstraintError';
    context.mock.method(Place, 'create', async () => {
        throw sequelizeError;
    });

    await assert.rejects(
        () => createOnePlace(completeDraft),
        (error) => error instanceof AppError
            && error.statusCode === 409
            && error.code === 'SLUG_ALREADY_EXISTS'
    );
});
