
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
