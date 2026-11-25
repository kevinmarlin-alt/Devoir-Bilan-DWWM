import { MongoServerError } from 'mongodb';
import { placeEventsDatabase } from '../db/placeEventsDatabase.js';
import { AppError } from '../errors/AppError.js';

function metricsUnavailable() {
    return new AppError('Les métriques sont temporairement indisponibles.', {
        status: 503,
        code: 'METRICS_UNAVAILABLE'
    });
}

export async function insertPlaceEvent(event, getCollection = placeEventsDatabase.getCollection) {
    const collection = getCollection();
    if (!collection) throw metricsUnavailable();

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
