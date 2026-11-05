import { Category } from "../models/Category.js";
import { Place } from "../models/Place.js";

export const findById = async (id, transaction) => {
    return await Place.findOne({
        where: { placeId: id },
        transaction
    })
}

export const findAll = async () => {
    return await Place.findAll({
        include: [
            {
                model: Category,
                as: 'category',
                attributes: [
                    'categoryId',
                    'categoryName'
                ]
            }
        ]
    })
}

export const createOne = async (data, transaction) => {
    return await Place.create({
        slug: data.slug,
        name: data.name,
        description: data.description,
        additionalInformation: data.additionalInformation,
        status: data.status,
        categoryId: data.categoryId
    }, { transaction })
}

export const updateOne = async (placeId, data, transaction) => {
    await Place.update({
        slug: data.slug,
        name: data.name,
        description: data.description,
        additionalInformation: data.additionalInformation,
        status: data.status,
        categoryId: data.categoryId
    }, {
        where: { placeId },
        transaction
    });

    return await findById(placeId, transaction);
}

export const deleteOne = async (id) => {
    return await Place.destroy({
        where: { placeId: id }
    })
}
