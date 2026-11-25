import { AppError } from '../errors/AppError.js';
import { countPlaceEvents } from '../repositories/placeEvents.repository.js';
import { placeExists } from '../repositories/places.repository.js';

const periodDays = 90;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function createGetPlaceMetrics({
    checkPlaceExists = placeExists,
    countEvents = countPlaceEvents,
    now = () => new Date(),
    logger = console
} = {}) {
    return async (placeId) => {
        const to = now();
        const from = new Date(to.getTime() - periodDays * millisecondsPerDay);
        if (!await checkPlaceExists(placeId)) {
            throw new AppError('Le lieu demandé n’existe pas.', { status: 404, code: 'PLACE_NOT_FOUND' });
        }

        const { views, inquiries } = await countEvents(placeId, from, to);
        if (inquiries > views) {
            logger.warn('Métriques de lieu : demandes supérieures aux consultations.', { placeId, views, inquiries });
        }
        const conversionRate = views === 0 ? 0 : Math.min(100, Math.round(inquiries / views * 100));

        return { placeId, periodDays, from, to, views, inquiries, conversionRate };
    };
}

export const getPlaceMetrics = createGetPlaceMetrics();
