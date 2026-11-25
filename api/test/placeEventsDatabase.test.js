import assert from 'node:assert/strict';
import test from 'node:test';
import { MongoClient } from 'mongodb';
import { createPlaceEventsDatabase } from '../src/db/placeEventsDatabase.js';

const config = { uri: 'mongodb://localhost', databaseName: 'metrics_test' };

function fixture(context, createIndexes = async () => {}) {
    const collection = { createIndexes: context.mock.fn(createIndexes) };
    const selectCollection = context.mock.fn(() => collection);
    const client = {
        connect: context.mock.fn(async () => {}),
        db: context.mock.fn(() => ({ collection: selectCollection })),
        close: context.mock.fn(async () => {})
    };
    const logger = { info: context.mock.fn(), warn: context.mock.fn() };
    const createClient = context.mock.fn(() => client);
    return { collection, selectCollection, client, logger, createClient };
}

test('disables metrics when either MongoDB environment variable is missing', async (context) => {
    const { createClient, logger } = fixture(context);
    for (const configKey of ['uri', 'databaseName']) {
        const database = createPlaceEventsDatabase({
            ...config, [configKey]: undefined, createClient, logger
        });

        await database.start();

        assert.equal(database.getCollection(), null);
    }
    assert.equal(createClient.mock.callCount(), 0);
    assert.equal(logger.warn.mock.callCount(), 2);
});

test('exposes the collection after ensuring all three indexes once per startup', async (context) => {
    const { client, collection, selectCollection, createClient, logger } = fixture(context);
    const database = createPlaceEventsDatabase({ ...config, createClient, logger });
    assert.equal(database.getCollection(), null);

    await Promise.all([database.start(), database.start()]);

    assert.equal(database.getCollection(), collection);
    assert.equal(client.connect.mock.callCount(), 1);
    assert.deepEqual(client.db.mock.calls[0].arguments, ['metrics_test']);
    assert.deepEqual(selectCollection.mock.calls[0].arguments, ['place_events']);
    assert.equal(collection.createIndexes.mock.callCount(), 1);
    assert.deepEqual(collection.createIndexes.mock.calls[0].arguments[0], [
        { key: { eventId: 1 }, unique: true },
        { key: { placeId: 1, occurredAt: -1, type: 1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
    ]);
});

test('sets supported MongoDB timeouts to bound connection and socket waits', async (context) => {
    const { client, logger } = fixture(context);
    const connect = context.mock.method(MongoClient.prototype, 'connect', async () => {});
    context.mock.method(MongoClient.prototype, 'db', client.db);
    const database = createPlaceEventsDatabase({ ...config, logger });

    await database.start();

    const { options } = connect.mock.calls[0].this;
    for (const name of ['connectTimeoutMS', 'serverSelectionTimeoutMS', 'socketTimeoutMS', 'waitQueueTimeoutMS']) {
        assert.equal(options[name], 5_000);
    }
});

test('stays unavailable on connection or index failure and retries in the background', async (context) => {
    const { client, collection, createClient, logger } = fixture(context);
    client.connect.mock.mockImplementationOnce(async () => { throw new Error(config.uri); });
    collection.createIndexes.mock.mockImplementationOnce(async () => { throw new Error(config.uri); });
    const unref = context.mock.fn();
    const setTimeout = context.mock.method(globalThis, 'setTimeout', () => ({ unref }));
    const database = createPlaceEventsDatabase({ ...config, createClient, logger });

    await database.start();
    assert.equal(database.getCollection(), null);
    await setTimeout.mock.calls[0].arguments[0]();
    assert.equal(database.getCollection(), null);
    await setTimeout.mock.calls[1].arguments[0]();

    assert.equal(database.getCollection(), collection);
    assert.equal(client.close.mock.callCount(), 2);
    assert.equal(unref.mock.callCount(), 2);
    assert.equal(setTimeout.mock.calls[0].arguments[1], 30_000);
    assert.equal(logger.warn.mock.callCount(), 2);
    assert.doesNotMatch(JSON.stringify(logger.warn.mock.calls.map((call) => call.arguments)), /mongodb:\/\//);
});
