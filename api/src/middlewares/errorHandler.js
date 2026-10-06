import { AppError } from "../errors/AppError.js";

export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {})
            }
        })
    }

    console.error(err);

    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Une erreur interne est survenue'
        }
    })
}