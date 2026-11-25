import { MongoClient } from 'mongodb';

const indexes = [
    { key: { eventId: 1 }, unique: true },
    { key: { placeId: 1, occurredAt: -1, type: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
];
const retryDelayMs = 30_000;

export function createPlaceEventsDatabase({
    uri,
    databaseName,
    createClient = (uri) => new MongoClient(uri, {
        connectTimeoutMS: 5_000,
        serverSelectionTimeoutMS: 5_000,
        socketTimeoutMS: 5_000,
        waitQueueTimeoutMS: 5_000
    }),
    logger = console
}) {
    let collection = null;
    let started = false;

    async function connect() {
        let client;
        try {
            client = createClient(uri);
            await client.connect();
            const placeEvents = client.db(databaseName).collection('place_events');
            await placeEvents.createIndexes(indexes);
            collection = placeEvents;
            logger.info('MongoDB : stockage des métriques initialisé.');
        } catch {
            if (client) await client.close().catch(() => {});
            logger.warn('MongoDB : stockage des métriques indisponible. Nouvelle tentative dans 30 s.');
            setTimeout(connect, retryDelayMs).unref();
        }
    }

    return {
        async start() {
            if (started) return;
            started = true;

            if (!uri || !databaseName) {
                logger.warn('MongoDB : métriques désactivées (MONGODB_URI ou MONGODB_DB_NAME manquante).');
                return;
            }

            await connect();
        },
        getCollection() {
            return collection;
        }
    };
}

export const placeEventsDatabase = createPlaceEventsDatabase({
    uri: process.env.MONGODB_URI,
    databaseName: process.env.MONGODB_DB_NAME
});
