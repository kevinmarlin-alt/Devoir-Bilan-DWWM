import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { placeEventsDatabase } from '../src/db/placeEventsDatabase.js';
import { Place } from '../src/models/Place.js';
import { countPlaceEvents } from '../src/repositories/placeEvents.repository.js';
import { createAuthToken } from '../src/services/auth.service.js';
import { createGetPlaceMetrics } from '../src/services/placeMetrics.service.js';

const to = new Date('2026-11-24T15:00:00.000Z');
const from = new Date('2026-08-26T15:00:00.000Z');

test('uses one inclusive UTC window and counts both event types in one aggregation', async (context) => {
    const collection = {
        aggregate: context.mock.fn(() => ({
            toArray: async () => [{ _id: 'view', count: 42 }, { _id: 'inquiry', count: 5 }]
        }))
    };
    const now = context.mock.fn(() => to);
    const getMetrics = createGetPlaceMetrics({
        checkPlaceExists: async () => true,
        countEvents: (id, start, end) => countPlaceEvents(id, start, end, () => collection),
        now
    });

    assert.deepEqual(await getMetrics(12), {
        placeId: 12, periodDays: 90, from, to, views: 42, inquiries: 5, conversionRate: 12
    });
    assert.equal(now.mock.callCount(), 1);
    assert.deepEqual(collection.aggregate.mock.calls.map(({ arguments: args }) => args), [[[
        { $match: { placeId: 12, occurredAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
    ]]]);
});

test('returns zero for absent counters and logs and caps an incoherent conversion rate', async (context) => {
    const warn = context.mock.fn();
    for (const [views, inquiries, expected] of [
        [0, 0, 0], [15, 0, 0], [0, 2, 0], [8, 1, 13], [4, 4, 100], [4, 5, 100],
        [250, 251, 100]
    ]) {
        const collection = {
            aggregate: () => ({
                toArray: async () => [{ _id: 'view', count: views }, { _id: 'inquiry', count: inquiries }]
                    .filter(({ count }) => count > 0)
            })
        };
        const getMetrics = createGetPlaceMetrics({
            checkPlaceExists: async () => true,
            countEvents: (id, start, end) => countPlaceEvents(id, start, end, () => collection),
            logger: { warn }
        });
        const result = await getMetrics(12);
        assert.deepEqual([result.views, result.inquiries, result.conversionRate], [views, inquiries, expected]);
    }
    assert.deepEqual(warn.mock.calls.map(({ arguments: args }) => args[1]), [
        { placeId: 12, views: 0, inquiries: 2 },
        { placeId: 12, views: 4, inquiries: 5 },
        { placeId: 12, views: 250, inquiries: 251 }
    ]);
});

test('returns an opaque 503 if an aggregation fails', async (context) => {
    const warn = context.mock.method(console, 'warn', () => {});
    const collection = {
        aggregate: () => ({ async toArray() { throw new Error('diagnostic simulé'); } })
    };
    await assert.rejects(() => countPlaceEvents(12, from, to, () => collection), {
        statusCode: 503, code: 'METRICS_UNAVAILABLE', message: 'Les métriques sont temporairement indisponibles.'
    });
    assert.deepEqual(warn.mock.calls[0].arguments, ['MongoDB : lecture des métriques de lieu impossible.']);
});

test('admin metrics route checks authentication and existence before reading MongoDB', async (context) => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    context.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });
    const cookie = 'pp_token=' + createAuthToken({});
    const places = new Map([[12, 'published'], [13, 'draft'], [14, 'archived']]);
    const findPlace = context.mock.method(Place, 'findByPk', async (id) =>
        places.has(id) ? { placeId: id, status: places.get(id) } : null);
    const getCollection = context.mock.method(placeEventsDatabase, 'getCollection', () => ({
        aggregate: () => ({ toArray: async () => [] })
    }));
    const server = createApp().listen(0, '127.0.0.1');
    context.after(() => new Promise((resolve) => server.close(resolve)));
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port + '/api/admin/places/';
    const get = (id, query = '') => fetch(base + id + '/metrics' + query, { headers: { cookie } });

    const unauthenticated = await fetch(base + '12/metrics');
    assert.equal(unauthenticated.status, 401);
    for (const id of ['invalid', '9007199254740992']) {
        const response = await get(id);
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error.code, 'INVALID_PLACE_ID');
    }
    assert.equal(findPlace.mock.callCount(), 0);
    const missing = await get(15);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'PLACE_NOT_FOUND');
    assert.equal(getCollection.mock.callCount(), 0);

    for (const placeId of [12, 13, 14]) {
        const response = await get(placeId, '?periodDays=7');
        assert.equal(response.status, 200);
        const { from, to, ...metrics } = await response.json();
        assert.deepEqual(metrics, { placeId, periodDays: 90, views: 0, inquiries: 0, conversionRate: 0 });
        assert.equal(Date.parse(to) - Date.parse(from), 90 * 24 * 60 * 60 * 1000);
    }
    assert.deepEqual(findPlace.mock.calls[1].arguments, [12, { attributes: ['placeId'] }]);

    getCollection.mock.mockImplementation(() => null);
    const unavailable = await get(12);
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).error.code, 'METRICS_UNAVAILABLE');
});
