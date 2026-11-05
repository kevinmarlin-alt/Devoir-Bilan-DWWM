import { createOne, findAll, deleteOne } from "../repositories/places.repository.js"

export const getAll = async () => {
    return await findAll()
}

export const createOnePlace = async (data) => {
    const slug = data.name.toLowerCase().replaceAll(' ', '-');

    return await createOne({
        ...data,
        slug
    });
}

export const deleteOnePlace = async (placeId) => {
    await deleteOne(placeId);
}
