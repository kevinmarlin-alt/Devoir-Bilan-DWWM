import { AppError } from "../errors/AppError.js";

export const isBodyExiste = (req, fields) => {
    fields.forEach(field => {
        if (!req.body?.[field]) {
            throw new AppError(`Le corps de la requete http ne contient pas le parametre ${field}`,{
                status: 402,
                code: 'NO_CONTENT_BODY_PARAMS'
            })
        }
    });
}