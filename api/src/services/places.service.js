import { createOne, findAll, findById, findByIdForUpdate, findBySlug, updateOne, deleteOne, changeStatus } from "../repositories/places.repository.js"
import { findCategoryById } from '../repositories/categories.repository.js';
import { getExploitationTypeById } from '../repositories/exploitationTypes.repository.js';
import { assignImagesToPlace, clearImagesFromPlace, findImageById } from '../repositories/images.repository.js';
import { AppError } from '../errors/AppError.js';
import sequelize from '../db/database.js';
import { createPlaceSlug } from '../utilities/placeSlug.js';

export const getAll = async () => {
    return await findAll()
}

export const getOnePlaceById = async (placeId, transaction) => {
    const place = await findById(placeId, transaction);

    if (!place) {
        throw new AppError('Le lieu demandé n’existe pas.', {
            status: 404,
            code: 'PLACE_NOT_FOUND'
        });
    }
    return place;
}

export const createOnePlace = async (data) => {
    await validatePlaceReferences(data);

    const slug = buildPlaceSlug(data.name);
    await validateSlugAvailability(slug);

    try {
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
    } catch (error) {
        throwSlugConflict(error);
    }
}

export const updateOnePlace = async (placeId, data) => {
    try {
        return await sequelize.transaction(async (transaction) => {
            const place = await findByIdForUpdate(placeId, transaction);

            if (!place) {
                throw new AppError('Le lieu demandé n’existe pas.', {
                    status: 404,
                    code: 'PLACE_NOT_FOUND'
                });
            }

            validateUpdateStatus(place.status, data.status);
            await validatePlaceReferences(data, placeId, transaction);

            const slug = buildPlaceSlug(data.name);
            await validateSlugAvailability(slug, placeId, transaction);

            await updateOne(placeId, { ...data, slug }, transaction);
            await place.setExploitationTypes(data.exploitationTypeIds, { transaction });
            await clearImagesFromPlace(placeId, transaction);
            await assignImagesToPlace({
                imageIds: data.imageIds,
                mainImageId: data.mainImageId,
                placeId
            }, transaction);

            return await getOnePlaceById(placeId, transaction);
        });
    } catch (error) {
        throwSlugConflict(error);
    }
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
        place.status === 'archived' ||
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

const validatePlaceReferences = async (data, placeId = null, transaction) => {
    if (data.categoryId) {
        const category = await findCategoryById(data.categoryId, transaction);

        if (!category) {
            throw new AppError('La catégorie sélectionnée n’existe pas.', {
                status: 404,
                code: 'CATEGORY_NOT_FOUND'
            });
        }
    }

    for (const typeId of data.exploitationTypeIds) {
        const type = await getExploitationTypeById(typeId, transaction);

        if (!type) {
            throw new AppError('Un type d’exploitation sélectionné n’existe pas.', {
                status: 404,
                code: 'EXPLOITATION_TYPE_NOT_FOUND'
            });
        }
    }

    for (const imageId of data.imageIds) {
        const image = await findImageById(imageId, transaction);

        if (!image) {
            throw new AppError('Une image sélectionnée n’existe pas.', {
                status: 404,
                code: 'IMAGE_NOT_FOUND'
            });
        }

        if (image.placeId !== null && Number(image.placeId) !== Number(placeId)) {
            throw new AppError('Une image sélectionnée est déjà liée à un autre lieu.', {
                status: 409,
                code: 'IMAGE_ALREADY_ASSIGNED'
            });
        }
    }
}

const validateSlugAvailability = async (slug, placeId = null, transaction) => {
    const placeWithSameSlug = await findBySlug(slug, transaction);

    if (placeWithSameSlug && Number(placeWithSameSlug.placeId) !== Number(placeId)) {
        throw new AppError('Un lieu avec ce nom existe déjà. Veuillez choisir un autre nom.', {
            status: 409,
            code: 'SLUG_ALREADY_EXISTS'
        });
    }
}

const validateUpdateStatus = (currentStatus, nextStatus) => {
    if (currentStatus === 'archived' && nextStatus !== 'draft') {
        throw new AppError('La modification d’un lieu archivé doit le réactiver en brouillon.', {
            status: 409,
            code: 'STATUS_CHANGE_NOT_POSSIBLE'
        });
    }

    if (currentStatus === 'published' && nextStatus === 'draft') {
        throw new AppError('Un lieu publié ne peut pas être repassé en brouillon par cette route.', {
            status: 409,
            code: 'STATUS_CHANGE_NOT_POSSIBLE'
        });
    }
}

const buildPlaceSlug = (name) => {
    const slug = createPlaceSlug(name);

    if (!slug) {
        throw new AppError('Le nom du lieu doit contenir au moins un caractère utilisable dans son URL.', {
            status: 400,
            code: 'INVALID_PLACE_DATA'
        });
    }

    return slug;
}

const throwSlugConflict = (error) => {
    if (error?.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Un lieu avec ce nom existe déjà. Veuillez choisir un autre nom.', {
            status: 409,
            code: 'SLUG_ALREADY_EXISTS',
            cause: error
        });
    }

    throw error;
}

export const deleteOnePlace = async (placeId) => {
    return await sequelize.transaction(async (transaction) => {
        const place = await getOnePlaceById(placeId, transaction);

        if (place.status === 'published') {
            throw new AppError('Un lieu publié doit être archivé avant d’être supprimé.', {
                status: 409,
                code: 'PUBLISHED_PLACE_DELETE_FORBIDDEN'
            });
        }

        await clearImagesFromPlace(placeId, transaction);
        await deleteOne(placeId, transaction);
    });
}
