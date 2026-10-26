import { Place } from "../models/Place";

export const findById = async (id) => {
    return await Place.findOne({
        where: { placeId: id }
    })
}

export const findAll = async () => {
    return await Place.findAll()
}

export const createOne = async (data) => {
    return await Place.create({
        slug: data.slug,
        name: data.name,
        description: data.description,
        additionalInformation: data.additionalInformation,
        status: data.status,
        categoryId: data.categoryId
    })
}

export const updateOne = async (data) => {
    return await Place.update({
        slug: data.slug,
        name: data.name,
        description: data.description,
        additionalInformation: data.additionalInformation,
        status: data.status,
        categoryId: data.categoryId
    })
}

export const deleteOne = async (id) => {
    return await Place.destroy({
        where: { placeId: id }
    })
}