import { createOne, findAll, findById, findBySlug, updateOne, deleteOne } from "../repositories/places.repository.js"
import { findCategoryById } from '../repositories/categories.repository.js';
import { getExploitationTypeById } from '../repositories/exploitationTypes.repository.js';
import { assignImagesToPlace, clearImagesFromPlace, findImageById } from '../repositories/images.repository.js';
import { AppError } from '../errors/AppError.js';
import sequelize from '../db/database.js';

export const getAll = async () => {
    return await findAll()
}

export const getPlaceById = async (placeId) => {
    return await findById(placeId);
}

export const createOnePlace = async (data) => {
    await validatePlaceReferences(data);

    const slug = data.name.toLowerCase().replaceAll(' ', '-');
    await validateSlugAvailability(slug);

    return await sequelize.transaction(async (transaction) => {
        const place = await createOne({
            ...data,
            slug
        }, transaction);

        await place.setExploitationTypes(data.exploitationTypeIds, { transaction });
        await assignImagesToPlace({
            imageIds: data.imageIds,
            mainImageId: data.mainImageId,
            placeId: place.placeId
        }, transaction);

        return place;
    });
}

export const updateOnePlace = async (placeId, data) => {
    const place = await findById(placeId);

    if (!place) {
        throw new AppError('Le lieu à modifier n’existe pas.', {
            status: 404,
            code: 'PLACE_NOT_FOUND'
        });
    }

    await validatePlaceReferences(data, place.placeId);

    const slug = data.name.toLowerCase().replaceAll(' ', '-');
    await validateSlugAvailability(slug, placeId);

    return await sequelize.transaction(async (transaction) => {
        const updatedPlace = await updateOne(placeId, { ...data, slug }, transaction);

        await updatedPlace.setExploitationTypes(data.exploitationTypeIds, { transaction });
        await clearImagesFromPlace(placeId, transaction);
        await assignImagesToPlace({
            imageIds: data.imageIds,
            mainImageId: data.mainImageId,
            placeId
        }, transaction);

        return updatedPlace;
    });
}

const validatePlaceReferences = async (data, placeId = null) => {
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

        if (image.placeId && image.placeId !== placeId) {
            throw new AppError('Une image sélectionnée est déjà liée à un autre lieu.', {
                status: 400,
                code: 'IMAGE_ALREADY_ASSIGNED'
            });
        }
    }
}

const validateSlugAvailability = async (slug, placeId = null) => {
    const placeWithSameSlug = await findBySlug(slug);

    if (placeWithSameSlug && placeWithSameSlug.placeId !== Number(placeId)) {
        throw new AppError('Un lieu avec ce nom existe déjà. Veuillez choisir un autre nom.', {
            status: 409,
            code: 'SLUG_ALREADY_EXISTS'
        });
    }
}

export const deleteOnePlace = async (placeId) => {
    await deleteOne(placeId);
}
