import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { MongoServerError } from 'mongodb';
import { createApp } from '../src/app.js';
import { placeEventsDatabase } from '../src/db/placeEventsDatabase.js';
import { Place } from '../src/models/Place.js';

const showcase = 'https://showcase.example.test';
const admin = 'https://admin.example.test';
const endpoint = '/api/public/place-events';
const view = { eventId: '550e8400-e29b-41d4-a716-446655440000', placeId: 12, type: 'view' };

async function startApi(context, overrides = {}) {
    const config = {
        SHOWCASE_ORIGIN: showcase,
        CORS_ORIGIN: admin,
        PLACE_EVENT_VIEW_LIMIT: '60',
        PLACE_EVENT_INQUIRY_LIMIT: '10',
        ...overrides
    };
    const previous = Object.fromEntries(Object.keys(config).map((key) => [key, process.env[key]]));
    const applyConfig = (values) => {
        for (const [key, value] of Object.entries(values)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    };
    applyConfig(config);
    try {
        const server = createApp().listen(0, '127.0.0.1');
        context.after(() => new Promise((resolve, reject) =>
            server.close((error) => error ? reject(error) : resolve())));
        await once(server, 'listening');
        return 'http://127.0.0.1:' + server.address().port;
    } finally {
        applyConfig(previous);
    }
}

function mockStorage(context) {
    const stored = new Map();
    const placeLookup = context.mock.method(Place, 'findOne', async ({ where }) =>
        where.placeId === 12 && where.status === 'published' ? { placeId: 12 } : null);
    const collection = {
        async insertOne(event) {
            if (stored.has(event.eventId)) {
                throw new MongoServerError({ code: 11000, keyPattern: { eventId: 1 } });
            }
            stored.set(event.eventId, event);
        }
    };
    const getCollection = context.mock.method(placeEventsDatabase, 'getCollection', () => collection);
    return { placeLookup, getCollection, stored };
}

const postEvent = (api, body, origin = showcase) => fetch(api + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body)
});
const preflight = (api, origin, path = endpoint) => fetch(api + path, {
    method: 'OPTIONS',
    headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
    }
});

test('records valid public events idempotently without persisting request metadata', async (context) => {
    const { stored } = mockStorage(context);
    const api = await startApi(context);
    const response = await postEvent(api, view);
    assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    assert.equal(response.headers.get('access-control-allow-origin'), showcase);
    assert.equal(response.headers.get('access-control-allow-credentials'), null);
    assert.equal((await postEvent(api, { ...view, eventId: view.eventId.toUpperCase() }, null)).status, 204);
    assert.equal(stored.size, 1);
    assert.deepEqual(Object.keys(stored.get(view.eventId)).sort(), [
        'eventId', 'expiresAt', 'occurredAt', 'placeId', 'source', 'type'
    ]);
});

test('uses the shared error response for invalid events, missing places and unavailable storage', async (context) => {
    const { placeLookup, getCollection } = mockStorage(context);
    const api = await startApi(context);

    for (const invalid of [{ ...view, source: 'client' }, '{"type":', JSON.stringify({ text: 'x'.repeat(1100) })]) {
        const response = await postEvent(api, invalid);
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error.code, 'INVALID_PLACE_EVENT');
    }
    assert.equal(placeLookup.mock.callCount(), 0);

    const missing = await postEvent(api, { ...view, placeId: 13 });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'PLACE_NOT_FOUND');

    getCollection.mock.mockImplementation(() => null);
    const unavailable = await postEvent(api, view);
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), {
        error: { code: 'METRICS_UNAVAILABLE', message: 'Les métriques sont temporairement indisponibles.' }
    });
});

test('restricts ingestion preflight and POST to the showcase origin while preserving admin CORS', async (context) => {
    const { placeLookup } = mockStorage(context);
    const api = await startApi(context);
    const allowed = await preflight(api, showcase);
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get('access-control-allow-origin'), showcase);
    assert.equal(allowed.headers.get('access-control-allow-methods'), 'POST');
    assert.equal(allowed.headers.get('access-control-allow-headers'), 'Content-Type');

    for (const response of [await preflight(api, admin), await postEvent(api, view, admin)]) {
        assert.equal(response.status, 403);
        assert.equal(response.headers.get('access-control-allow-origin'), null);
        assert.equal((await response.json()).error.code, 'PLACE_EVENT_ORIGIN_FORBIDDEN');
    }
    assert.equal(placeLookup.mock.callCount(), 0);

    const adminPreflight = await preflight(api, admin, '/api/admin/places');
    assert.equal(adminPreflight.status, 204);
    assert.equal(adminPreflight.headers.get('access-control-allow-origin'), admin);
    assert.equal(adminPreflight.headers.get('access-control-allow-credentials'), 'true');
    const adminRequest = await fetch(api + '/api/admin/places', { headers: { Origin: admin } });
    assert.equal(adminRequest.status, 401);
});

test('requires a configured web origin for browser ingestion and keeps originless calls public', async (context) => {
    mockStorage(context);
    const api = await startApi(context, { SHOWCASE_ORIGIN: undefined });
    assert.equal((await preflight(api, showcase)).status, 403);
    assert.equal((await postEvent(api, view)).status, 403);
    assert.equal((await postEvent(api, view, null)).status, 204);
});

test('enforces configurable per-IP limits independently for both event types', async (context) => {
    const { placeLookup } = mockStorage(context);
    const api = await startApi(context, { PLACE_EVENT_VIEW_LIMIT: '2', PLACE_EVENT_INQUIRY_LIMIT: '1' });
    const inquiry = { ...view, eventId: '550e8400-e29b-41d4-a716-446655440001', type: 'inquiry' };
    assert.equal((await preflight(api, showcase)).status, 204);
    assert.equal((await postEvent(api, view)).status, 204);
    assert.equal((await postEvent(api, view)).status, 204);
    const viewsLimited = await postEvent(api, view);
    assert.equal(viewsLimited.status, 429);
    assert.equal((await viewsLimited.json()).error.code, 'PLACE_EVENT_RATE_LIMIT');
    assert.equal(viewsLimited.headers.get('access-control-allow-origin'), showcase);
    assert.ok(Number(viewsLimited.headers.get('retry-after')) > 0);

    assert.equal((await postEvent(api, inquiry)).status, 204);
    const inquiriesLimited = await postEvent(api, inquiry);
    assert.equal(inquiriesLimited.status, 429);
    assert.ok(Number(inquiriesLimited.headers.get('retry-after')) > 60);
    assert.equal(placeLookup.mock.callCount(), 3);
});
