import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';

export const authenticate = (req, res, next) => {
    const pp_token = req.cookies.pp_token;

    if(!pp_token) {
        throw new AppError(
            'Authentification requise',
            {
                status: 401,
                code: 'UNAUTHORIZED'
            }
        )
    }

    try {
        const decodedToken = jwt.verify(
            pp_token,
            process.env.JWT_SECRET
        );

        req.user = decodedToken;

        next();

    } catch (error) {
        throw new AppError(
            'Authentification requise',
            {
                status: 401,
                code: 'UNAUTHORIZED'
            }
        )
    }
}