import { AppError } from '../errors/AppError.js';

const eventFields = ['eventId', 'placeId', 'type'];
const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validatePlaceEvent(body) {
    if (
        !body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).length !== eventFields.length
        || !eventFields.every((field) => Object.hasOwn(body, field))
        || typeof body.eventId !== 'string' || body.eventId.length !== 36 || !uuidFormat.test(body.eventId)
        || !Number.isSafeInteger(body.placeId) || body.placeId <= 0
        || (body.type !== 'view' && body.type !== 'inquiry')
    ) {
        throw new AppError('Fournissez uniquement eventId (UUID), placeId (entier positif) et type (view ou inquiry).', {
            status: 400,
            code: 'INVALID_PLACE_EVENT'
        });
    }

    return { eventId: body.eventId.toLowerCase(), placeId: body.placeId, type: body.type };
}
