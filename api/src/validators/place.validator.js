import { AppError } from '../errors/AppError.js';

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
    const categoryId = payload.categoryId ?? null;
    const exploitationTypeIds = payload.exploitationTypeIds ?? [];
    const imageIds = payload.imageIds ?? [];

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

    if (status === 'published' && (!description || !categoryId || exploitationTypeIds.length === 0 || imageIds.length === 0)) {
        throw new AppError('Un lieu publié requiert une description, une catégorie, un type d’exploitation et une image.', {
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
        status
    };
};
