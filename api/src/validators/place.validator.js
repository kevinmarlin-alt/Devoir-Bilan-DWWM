import { AppError } from '../errors/AppError.js';

const invalidPlaceData = (message) => {
    throw new AppError(message, {
        status: 400,
        code: 'INVALID_PLACE_DATA'
    });
};

const normalizePositiveInteger = (value, fieldName, { nullable = false } = {}) => {
    if (nullable && (value === null || value === '')) {
        return null;
    }

    const isIntegerNumber = typeof value === 'number' && Number.isInteger(value);
    const isIntegerString = typeof value === 'string' && /^[1-9]\d*$/.test(value.trim());

    if (!isIntegerNumber && !isIntegerString) {
        invalidPlaceData(`Le champ "${fieldName}" doit contenir un identifiant entier positif.`);
    }

    const normalizedValue = Number(value);

    if (!Number.isInteger(normalizedValue) || normalizedValue <= 0) {
        invalidPlaceData(`Le champ "${fieldName}" doit contenir un identifiant entier positif.`);
    }

    return normalizedValue;
};

const normalizeIdentifierList = (value, fieldName) => {
    if (!Array.isArray(value)) {
        invalidPlaceData(`Le champ "${fieldName}" doit être un tableau.`);
    }

    const normalizedValues = value.map((identifier) => (
        normalizePositiveInteger(identifier, fieldName)
    ));

    if (new Set(normalizedValues).size !== normalizedValues.length) {
        invalidPlaceData(`Le champ "${fieldName}" ne peut pas contenir de doublons.`);
    }

    return normalizedValues;
};

export const validatePlacePayload = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new AppError('Le corps de la requête est invalide.', {
            status: 400,
            code: 'INVALID_PLACE_DATA'
        });
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description.trim() : '';
    const status = payload.status ?? 'draft';
    const categoryId = normalizePositiveInteger(payload.categoryId ?? null, 'categoryId', { nullable: true });
    const exploitationTypeIds = normalizeIdentifierList(payload.exploitationTypeIds ?? [], 'exploitationTypeIds');
    const imageIds = normalizeIdentifierList(payload.imageIds ?? [], 'imageIds');
    const mainImageId = normalizePositiveInteger(payload.mainImageId ?? null, 'mainImageId', { nullable: true });

    if (!name || name.length > 50) {
        throw new AppError('Le nom du lieu est obligatoire et ne peut pas dépasser 50 caractères.', {
            status: 400,
            code: 'INVALID_PLACE_DATA'
        });
    }

    if (!['draft', 'published'].includes(status)) {
        throw new AppError('Le statut du lieu est invalide.', {
            status: 400,
            code: 'INVALID_PLACE_DATA'
        });
    }

    if (mainImageId !== null && !imageIds.includes(mainImageId)) {
        throw new AppError('La photo principale doit faire partie des images sélectionnées.', {
            status: 400,
            code: 'INVALID_MAIN_IMAGE'
        });
    }

    if (status === 'published' && (!description || !categoryId || exploitationTypeIds.length === 0 || imageIds.length === 0 || !mainImageId)) {
        throw new AppError('Un lieu publié requiert une description, une catégorie, un type d’exploitation, une image et une photo principale.', {
            status: 400,
            code: 'INCOMPLETE_PLACE_PUBLICATION'
        });
    }

    return {
        name,
        description: description || null,
        categoryId,
        exploitationTypeIds,
        imageIds,
        mainImageId,
        status
    };
};
