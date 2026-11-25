import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { MongoServerError } from 'mongodb';
import { createApp } from '../src/app.js';
import sequelize from '../src/db/database.js';
import { placeEventsDatabase } from '../src/db/placeEventsDatabase.js';
import { Image } from '../src/models/Image.js';
import { Place } from '../src/models/Place.js';
import { createAuthToken } from '../src/services/auth.service.js';

test('connects public ingestion, admin metrics and the place lifecycle over HTTP', async (context) => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    context.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });

    const places = new Map([
        [12, { placeId: 12, status: 'published' }],
        [13, { placeId: 13, status: 'draft' }]
    ]);
    const events = new Map();
    let mongoAvailable = true;
    context.mock.method(Place, 'findByPk', async (id) => places.get(id) ?? null);
    context.mock.method(Place, 'findOne', async ({ where }) => {
        const place = places.get(Number(where.placeId));
        return place && (!where.status || where.status === place.status) ? place : null;
    });
    context.mock.method(Place, 'update', async (changes, { where }) => {
        Object.assign(places.get(Number(where.placeId)), changes);
        return [1];
    });
    context.mock.method(Place, 'destroy', async ({ where }) => Number(places.delete(Number(where.placeId))));
    context.mock.method(Image, 'update', async () => [0]);
    context.mock.method(sequelize, 'transaction', async (run) => run({}));

    const collection = {
        async insertOne(event) {
            if (events.has(event.eventId)) {
                throw new MongoServerError({ code: 11000, keyPattern: { eventId: 1 } });
            }
            events.set(event.eventId, event);
        },
        aggregate([{ $match }]) {
            return {
                async toArray() {
                    const counts = new Map();
                    for (const { placeId, type, occurredAt } of events.values()) {
                        if (placeId === $match.placeId && occurredAt >= $match.occurredAt.$gte
                            && occurredAt <= $match.occurredAt.$lte) {
                            counts.set(type, (counts.get(type) ?? 0) + 1);
                        }
                    }
                    return Array.from(counts, ([_id, count]) => ({ _id, count }));
                }
            };
        }
    };
    context.mock.method(placeEventsDatabase, 'getCollection', () => mongoAvailable ? collection : null);
    const warn = context.mock.method(console, 'warn', () => {});
    const server = createApp().listen(0, '127.0.0.1');
    context.after(() => new Promise((resolve) => server.close(resolve)));
    await once(server, 'listening');

    const base = 'http://127.0.0.1:' + server.address().port + '/api';
    const cookie = 'pp_token=' + createAuthToken({});
    const publicEvent = (event) => fetch(base + '/public/place-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });
    const adminRequest = (path, method = 'GET', body) => fetch(base + '/admin/places/' + path, {
        method,
        headers: { cookie, ...(body && { 'Content-Type': 'application/json' }) },
        body: body && JSON.stringify(body)
    });
    const view = { eventId: randomUUID(), type: 'view', placeId: 12 };

    assert.equal((await publicEvent({ ...view, placeId: 13 })).status, 404);
    assert.equal((await publicEvent(view)).status, 204);
    assert.equal((await publicEvent(view)).status, 204);
    assert.equal((await publicEvent({ ...view, eventId: randomUUID(), type: 'inquiry' })).status, 204);
    assert.equal(events.size, 2);

    const archived = await adminRequest('12/status', 'PATCH', { status: 'archived' });
    assert.equal(archived.status, 200);
    assert.equal((await archived.json()).status, 'archived');
    assert.equal((await publicEvent({ ...view, eventId: randomUUID() })).status, 404);

    const metricsResponse = await adminRequest('12/metrics');
    assert.equal(metricsResponse.status, 200);
    const { views, inquiries, conversionRate } = await metricsResponse.json();
    assert.deepEqual([views, inquiries, conversionRate], [1, 1, 100]);
    assert.ok([...events.values()].every(({ expiresAt, occurredAt }) => expiresAt > occurredAt));

    mongoAvailable = false;
    assert.equal((await adminRequest('12/metrics')).status, 503);
    assert.equal((await adminRequest('12')).status, 200);
    assert.equal((await adminRequest('12', 'DELETE')).status, 204);
    assert.equal(warn.mock.callCount(), 1);

    mongoAvailable = true;
    assert.equal(events.size, 2);
    assert.equal((await adminRequest('12/metrics')).status, 404);
    assert.equal((await adminRequest('13/metrics')).status, 200);
});
