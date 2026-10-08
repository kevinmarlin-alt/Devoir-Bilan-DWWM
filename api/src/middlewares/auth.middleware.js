import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError.js';
import { verifyAuthToken } from '../services/auth.service.js';

export const authenticate = (req, res, next) => {
    const token = req.cookies.pp_token;

    if(!token) {
        throw new AppError(
            'Authentification requise',
            {
                status: 401,
                code: 'UNAUTHORIZED'
            }
        )
    }

    try {
        req.user = verifyAuthToken(token);
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