import { recordPlaceEvent } from '../services/placeEvents.service.js';

export async function createPlaceEvent(req, res) {
    await recordPlaceEvent(req.body);
    res.status(204).end();
}
