import { Category } from "../models/Category.js";
import { Place } from "../models/Place.js";
import { ExploitationType } from '../models/ExploitationType.js';
import { Image } from '../models/Image.js'

export const findById = async (id, transaction) => {
    return await Place.findOne({
        where: { placeId: id },
        transaction,
        exclude: ['category'],
        include: [
            {
                model: ExploitationType,
                as: 'exploitationTypes',
                attributes: [
                    'exploitationTypeId',
                    'exploitationTypeName'
                ],
                through: { attributes: [] }
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
            },
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

export const findByIdForUpdate = async (id, transaction) => {
    return await Place.findOne({
        where: { placeId: id },
        transaction,
        lock: transaction.LOCK.UPDATE
    });
}

export const findBySlug = async (slug, transaction) => {
    return await Place.findOne({
        where: { slug },
        transaction
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
        status: data.status,
        categoryId: data.categoryId
    }, { transaction })
}

export const changeStatus = async (placeId, status) => {
    return await Place.update({
        status,
        updatedAt: new Date().toISOString()
    }, {
        where: { placeId }
    })
}

export const updateOne = async (placeId, data, transaction) => {
    await Place.update({
        slug: data.slug,
        name: data.name,
        description: data.description,
        status: data.status,
        categoryId: data.categoryId,
        updatedAt: new Date().toISOString()
    }, {
        where: { placeId },
        transaction
    });

}

export const deleteOne = async (id, transaction) => {
    return await Place.destroy({
        where: { placeId: id },
        transaction
    })
}
