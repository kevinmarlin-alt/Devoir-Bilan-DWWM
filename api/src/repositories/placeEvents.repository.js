import { MongoServerError } from 'mongodb';
import { placeEventsDatabase } from '../db/placeEventsDatabase.js';
import { AppError } from '../errors/AppError.js';

function metricsUnavailable() {
    return new AppError('Les métriques sont temporairement indisponibles.', {
        status: 503,
        code: 'METRICS_UNAVAILABLE'
    });
}

function requireCollection(getCollection) {
    const collection = getCollection();
    if (!collection) throw metricsUnavailable();
    return collection;
}

export async function insertPlaceEvent(event, getCollection = placeEventsDatabase.getCollection) {
    const collection = requireCollection(getCollection);

    try {
        await collection.insertOne(event);
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000 && error.keyPattern?.eventId === 1) {
            return;
        }
        console.warn('MongoDB : enregistrement d’un événement de lieu impossible.');
        throw metricsUnavailable();
    }
}

export async function countPlaceEvents(placeId, from, to, getCollection = placeEventsDatabase.getCollection) {
    const collection = requireCollection(getCollection);

    try {
        const counts = await collection.aggregate([
            { $match: { placeId, occurredAt: { $gte: from, $lte: to } } },
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray();

        return {
            views: counts.find(({ _id }) => _id === 'view')?.count ?? 0,
            inquiries: counts.find(({ _id }) => _id === 'inquiry')?.count ?? 0
        };
    } catch {
        console.warn('MongoDB : lecture des métriques de lieu impossible.');
        throw metricsUnavailable();
    }
}

export async function deletePlaceEvents(placeId, getCollection = placeEventsDatabase.getCollection) {
    await requireCollection(getCollection).deleteMany({ placeId });
}
