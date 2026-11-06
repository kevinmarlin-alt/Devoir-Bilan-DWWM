import { Category } from "../models/Category.js";
import { Place } from "../models/Place.js";
import { ExploitationType } from '../models/ExploitationType.js'
import { Image } from '../models/Image.js'

export const findById = async (placeId) => {
    return await Place.findOne({
        where: { placeId },
        include: [
            {
                model: Category,
                as: 'category',
                attributes: [
                    'categoryId',
                    'categoryName'
                ]
            },
            {
                model: ExploitationType,
                as: 'exploitationTypes',
                attributes: [
                    'exploitationTypeId',
                    'exploitationTypeName',
                ],
                through: {
                    attributes: []
                }
            },
            {
                model: Image,
                as: 'images',
                attributes: [
                    'imageId',
                    'slug',
                    'filename',
                    'alt',
                    'isMain'
                ]
            }
        ]
    })
}

export const findBySlug = async (slug) => {
    return await Place.findOne({
        where: { slug }
    });
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
