import { connectToEventsCollection } from "../db/mongodb.js"

/**
 * 
 * @param {number} placeId 
 * @returns 
 */
export const findEventsById = async (placeId) => {
    const eventsCollection = await connectToEventsCollection();

    return eventsCollection.find({placeId}).toArray()
}