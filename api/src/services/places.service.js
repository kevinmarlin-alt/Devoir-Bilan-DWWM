import { createOne, findAll, findById, findBySlug, updateOne, deleteOne, changeStatus } from "../repositories/places.repository.js"
import { findCategoryById } from '../repositories/categories.repository.js';
import { getExploitationTypeById } from '../repositories/exploitationTypes.repository.js';
import { assignImagesToPlace, clearImagesFromPlace, findImageById } from '../repositories/images.repository.js';
import { AppError } from '../errors/AppError.js';
import sequelize from '../db/database.js';

export const getAll = async () => {
    return await findAll()
}

export const getOnePlaceById = async (placeId) => {
    const place = await findById(placeId);

    if (!place) {
        throw new AppError('Le lieu à modifier n’existe pas.', {
            status: 404,
            code: 'PLACE_NOT_FOUND'
        });
    }
    return place;
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
    const place = getOnePlaceById(placeId);

    await validatePlaceReferences(data, placeId);

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

export const updateStatus = async (placeId, status) => {
    const place = await getOnePlaceById(placeId);

    if (place.status === status) {
        throw new AppError('Le status est identique, aucun changement n\'a été effectué.',
            {
                status: 400,
                code: 'STATUS_NOT_CHANGE'
            }
        )
    }

    const isStatusChangeForbidden =
        (place.status === 'published' && status === 'draft') ||
        (place.status === 'archived' && status === 'published') ||
        (place.status === 'draft' && status === 'archived');

    if (isStatusChangeForbidden) {
        throw new AppError(`Le passage du statut "${place.status}" au statut "${status}" n'est pas autorisé.`,
            {
                status: 400,
                code: 'STATUS_CHANGE_NOT_POSSIBLE'
            }
        );
    }

    return await changeStatus(place.placeId, status)
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
