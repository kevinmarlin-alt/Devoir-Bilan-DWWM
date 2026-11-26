import { mongoDatabase } from '../db/mongodb.js';
import { AppError } from '../errors/AppError.js';

/**
 * 
 * @param {number} placeId 
 * @returns 
 */
export const findEventsById = async (placeId) => {
    try {
        return await mongoDatabase.find({ placeId }).toArray();
    } catch (error) {
        throw new AppError('Le serveur de stockage des événements est indisponible.', {
            status: 503,
            code: 'EVENTS_SERVER_UNAVAILABLE',
            cause: error
        });
    }
}
