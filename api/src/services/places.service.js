import { findAll, deleteOne } from "../repositories/places.repository.js"

export const getAll = async () => {
    return await findAll()
}

export const deleteOnePlace = async (placeId) => {
    await deleteOne(placeId);
}