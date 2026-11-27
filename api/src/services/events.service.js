import { findEventsById } from "../repositories/events.repository.js";

export const getEventsPlaceById = async (placeId) => {
    const id = Number(placeId)
    const events = await findEventsById(id);

    return events;

}