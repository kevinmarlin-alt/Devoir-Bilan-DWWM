import assert from 'node:assert/strict';
import test from 'node:test';
import { MongoServerError } from 'mongodb';
import { AppError } from '../src/errors/AppError.js';
import { Place } from '../src/models/Place.js';
import { insertPlaceEvent } from '../src/repositories/placeEvents.repository.js';
import { createRecordPlaceEvent } from '../src/services/placeEvents.service.js';
import { validatePlaceEvent } from '../src/validators/placeEvent.validator.js';

const view = { eventId: '550e8400-e29b-41d4-a716-446655440000', placeId: 12, type: 'view' };
const hasAppError = (status, code) => (error) =>
    error instanceof AppError && error.statusCode === status && error.code === code;

test('accepts views and inquiries and normalizes the UUID case', () => {
    assert.deepEqual(validatePlaceEvent(view), view);
    const inquiry = { ...view, type: 'inquiry' };
    assert.deepEqual(validatePlaceEvent({ ...inquiry, eventId: view.eventId.toUpperCase() }), inquiry);
});

test('rejects invalid bodies, missing fields and properties outside the contract', () => {
    for (const body of [
        null, [], {}, { ...view, type: undefined }, { ...view, type: 'click' },
        { ...view, eventId: 'invalid' }, { ...view, eventId: view.eventId + '\n' },
        ...['12', 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1].map((placeId) => ({ ...view, placeId })),
        ...['occurredAt', 'expiresAt', 'source', 'ip', 'email'].map((field) => ({ ...view, [field]: null }))
    ]) {
        assert.throws(() => validatePlaceEvent(body), hasAppError(400, 'INVALID_PLACE_EVENT'));
    }
});

test('checks the published place in MariaDB before enriching and inserting the event', async (context) => {
    const findPlace = context.mock.method(Place, 'findOne', async () => ({ placeId: 12 }));
    const insertEvent = context.mock.fn(async () => {});
    const occurredAt = new Date('2028-02-29T15:30:00.000Z');
    const record = createRecordPlaceEvent({ insertEvent, now: () => occurredAt });

    await record(view);

    assert.deepEqual(findPlace.mock.calls[0].arguments, [{
        where: { placeId: 12, status: 'published' },
        attributes: ['placeId']
    }]);
    assert.deepEqual(insertEvent.mock.calls[0].arguments, [{
        ...view,
        occurredAt: new Date('2028-02-29T15:30:00.000Z'),
        source: 'showcase',
        expiresAt: new Date('2030-02-28T15:30:00.000Z')
    }]);
    assert.equal(occurredAt.toISOString(), '2028-02-29T15:30:00.000Z');
});

test('rejects invalid events before MariaDB and never inserts for unpublished or missing places', async (context) => {
    const places = new Map([[1, 'draft'], [2, 'archived']]);
    const findPlace = context.mock.method(Place, 'findOne', async ({ where }) =>
        places.get(where.placeId) === where.status ? { placeId: where.placeId } : null);
    const insertEvent = context.mock.fn(async () => {});
    const record = createRecordPlaceEvent({ insertEvent });

    await assert.rejects(() => record({}), hasAppError(400, 'INVALID_PLACE_EVENT'));
    assert.equal(findPlace.mock.callCount(), 0);
    for (const placeId of [1, 2, 3]) {
        await assert.rejects(() => record({ ...view, placeId }), hasAppError(404, 'PLACE_NOT_FOUND'));
    }
    assert.equal(insertEvent.mock.callCount(), 0);
});

test('treats collisions on the MongoDB eventId index as successful retries', async () => {
    const stored = new Map();
    const collection = {
        async insertOne(event) {
            if (stored.has(event.eventId)) {
                throw new MongoServerError({ code: 11000, keyPattern: { eventId: 1 } });
            }
            stored.set(event.eventId, event);
        }
    };
    const insertEvent = (event) => insertPlaceEvent(event, () => collection);
    const record = createRecordPlaceEvent({ insertEvent, checkPublishedPlace: async () => true });

    await Promise.all([record(view), record({ ...view, eventId: view.eventId.toUpperCase() })]);

    assert.equal(stored.size, 1);
});

test('returns 503 for unavailable storage and unexpected insert failures', async (context) => {
    const warn = context.mock.method(console, 'warn', () => {});
    const unavailable = hasAppError(503, 'METRICS_UNAVAILABLE');
    await assert.rejects(() => insertPlaceEvent(view, () => null), unavailable);
    for (const error of [
        new Error('synthetic network failure'),
        new MongoServerError({ code: 11000, keyPattern: { _id: 1 } })
    ]) {
        const collection = { async insertOne() { throw error; } };
        await assert.rejects(() => insertPlaceEvent(view, () => collection), unavailable);
    }
    assert.doesNotMatch(JSON.stringify(warn.mock.calls.map((call) => call.arguments)), /synthetic network failure/);
});
