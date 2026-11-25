import assert from 'node:assert/strict';
import test from 'node:test';
import sequelize from '../src/db/database.js';
import { placeEventsDatabase } from '../src/db/placeEventsDatabase.js';
import { Image } from '../src/models/Image.js';
import { Place } from '../src/models/Place.js';
import { deleteOnePlace, updateStatus } from '../src/services/places.service.js';

function mockDeletion(context, { status = 'archived', commit = async () => {}, cleanup } = {}) {
    const steps = [];
    context.mock.method(sequelize, 'transaction', async (run) => {
        const result = await run({});
        await commit();
        steps.push('commit');
        return result;
    });
    context.mock.method(Place, 'findOne', async () => ({ placeId: 12, status }));
    context.mock.method(Image, 'update', async () => {
        steps.push('releaseImages');
    });
    context.mock.method(Place, 'destroy', async () => {
        steps.push('deletePlace');
        return 1;
    });
    const deleteMany = context.mock.fn(cleanup ?? (async () => steps.push('deleteEvents')));
    context.mock.method(placeEventsDatabase, 'getCollection', () => ({ deleteMany }));
    return { steps, deleteMany };
}

test('cleans up MongoDB only after the MariaDB commit, using the numeric place ID', async (context) => {
    const { steps, deleteMany } = mockDeletion(context);

    await deleteOnePlace('12');

    assert.deepEqual(steps, ['releaseImages', 'deletePlace', 'commit', 'deleteEvents']);
    assert.deepEqual(deleteMany.mock.calls[0].arguments, [{ placeId: 12 }]);
});

test('skips MongoDB if MariaDB rejects the transaction or the place is published', async (context) => {
    const { deleteMany } = mockDeletion(context, {
        commit: async () => { throw new Error('commit failed'); }
    });
    await assert.rejects(() => deleteOnePlace('12'), /commit failed/);
    Place.findOne.mock.mockImplementation(async () => ({ placeId: 12, status: 'published' }));
    await assert.rejects(() => deleteOnePlace('12'), { code: 'PUBLISHED_PLACE_DELETE_FORBIDDEN' });
    assert.equal(deleteMany.mock.callCount(), 0);
});

test('preserves a successful deletion if MongoDB cleanup fails', async (context) => {
    const { steps } = mockDeletion(context, {
        cleanup: async () => { throw new Error('internal test diagnosis'); }
    });
    const warn = context.mock.method(console, 'warn', () => {});

    await deleteOnePlace('12');

    assert.deepEqual(steps, ['releaseImages', 'deletePlace', 'commit']);
    assert.deepEqual(warn.mock.calls[0].arguments, [
        'MongoDB : nettoyage des événements de lieu impossible.', { placeId: 12 }
    ]);
});

test('preserves all events when archiving a place', async (context) => {
    let status = 'published';
    context.mock.method(Place, 'findOne', async () => ({ placeId: 12, status }));
    context.mock.method(Place, 'update', async (updates) => { status = updates.status; });
    const getCollection = context.mock.method(placeEventsDatabase, 'getCollection');

    assert.equal((await updateStatus(12, 'archived')).status, 'archived');
    assert.equal(getCollection.mock.callCount(), 0);
});
