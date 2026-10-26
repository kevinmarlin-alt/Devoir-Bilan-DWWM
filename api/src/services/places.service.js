import { findAll } from "../repositories/places.repository.js"

export const getAll = async () => {
    return await findAll()
}