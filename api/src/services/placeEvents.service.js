import { AppError } from '../errors/AppError.js';
import { insertPlaceEvent } from '../repositories/placeEvents.repository.js';
import { isPublishedPlace } from '../repositories/places.repository.js';
import { validatePlaceEvent } from '../validators/placeEvent.validator.js';

export function createRecordPlaceEvent({
    checkPublishedPlace = isPublishedPlace,
    insertEvent = insertPlaceEvent,
    now = () => new Date()
} = {}) {
    return async (body) => {
        const event = validatePlaceEvent(body);
        if (!await checkPublishedPlace(event.placeId)) {
            throw new AppError('Le lieu publié demandé n’existe pas.', {
                status: 404,
                code: 'PLACE_NOT_FOUND'
            });
        }

        const occurredAt = now();
        const expiresAt = new Date(occurredAt);
        expiresAt.setUTCFullYear(occurredAt.getUTCFullYear() + 2);
        // Le 29 février expire le dernier jour de février deux ans plus tard.
        if (expiresAt.getUTCMonth() !== occurredAt.getUTCMonth()) expiresAt.setUTCDate(0);

        await insertEvent({ ...event, occurredAt, source: 'showcase', expiresAt });
    };
}

export const recordPlaceEvent = createRecordPlaceEvent();
