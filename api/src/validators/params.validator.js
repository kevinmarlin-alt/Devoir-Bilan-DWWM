
import { AppError } from '../errors/AppError.js';

export const isParamsExiste = (req, params) => {
    params.forEach((param) => {
        if (!req.params?.[param]) {
            throw new AppError(`Le paramettre "${param}" de la requêtte HTTP est manquant.`, {
                status: 402,
                code: 'NO_CONTENT_PARAMS'
            });
        }
    });
};

export const validatePositiveIntegerParam = (value, name = 'id') => {
    const isIntegerNumber = typeof value === 'number' && Number.isInteger(value);
    const isIntegerString = typeof value === 'string' && /^[1-9]\d*$/.test(value.trim());

    if (!isIntegerNumber && !isIntegerString) {
        throw new AppError(`Le paramètre "${name}" doit être un entier positif.`, {
            status: 400,
            code: 'INVALID_PLACE_ID'
        });
    }

    const normalizedValue = Number(value);

    if (normalizedValue <= 0) {
        throw new AppError(`Le paramètre "${name}" doit être un entier positif.`, {
            status: 400,
            code: 'INVALID_PLACE_ID'
        });
    }

    return normalizedValue;
};
