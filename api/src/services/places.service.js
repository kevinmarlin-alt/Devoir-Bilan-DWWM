import { createOne, findAll, deleteOne } from "../repositories/places.repository.js"
import { findCategoryById } from '../repositories/categories.repository.js';
import { getExploitationTypeById } from '../repositories/exploitationTypes.repository.js';
import { assignImagesToPlace, findImageById } from '../repositories/images.repository.js';
import { AppError } from '../errors/AppError.js';
import sequelize from '../db/database.js';

export const getAll = async () => {
    return await findAll()
}

export const createOnePlace = async (data) => {
    await validatePlaceReferences(data);

    const slug = data.name.toLowerCase().replaceAll(' ', '-');

    return await sequelize.transaction(async (transaction) => {
        const place = await createOne({
            ...data,
            slug
        }, transaction);

        await place.setExploitationTypes(data.exploitationTypeIds, { transaction });
        await assignImagesToPlace({
            imageIds: data.imageIds,
            placeId: place.placeId
        }, transaction);

        return place;
    });
}

const validatePlaceReferences = async (data) => {
    if (data.categoryId) {
        const category = await findCategoryById(data.categoryId);

        if (!category) {
            throw new AppError('La catégorie sélectionnée n’existe pas.', {
                status: 404,
                code: 'CATEGORY_NOT_FOUND'
            });
        }
    }

    for (const typeId of data.exploitationTypeIds) {
        const type = await getExploitationTypeById(typeId);

        if (!type) {
            throw new AppError('Un type d’exploitation sélectionné n’existe pas.', {
                status: 404,
                code: 'EXPLOITATION_TYPE_NOT_FOUND'
            });
        }
    }

    for (const imageId of data.imageIds) {
        const image = await findImageById(imageId);

        if (!image) {
            throw new AppError('Une image sélectionnée n’existe pas.', {
                status: 404,
                code: 'IMAGE_NOT_FOUND'
            });
        }

        if (image.placeId) {
            throw new AppError('Une image sélectionnée est déjà liée à un autre lieu.', {
                status: 400,
                code: 'IMAGE_ALREADY_ASSIGNED'
            });
        }
    }
}

export const deleteOnePlace = async (placeId) => {
    await deleteOne(placeId);
}
