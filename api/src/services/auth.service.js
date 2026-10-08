import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from "../errors/AppError.js";
import { getUserByEmail } from "../repositories/user.repository.js";

export const authenticateUser = async (email, password) => {
    const normalizeEmail = email.trim().toLowerCase();

    const user = await getUserByEmail(normalizeEmail);

    if(!user) {
        throw new AppError('Identifiants incorrects',
            {
                status: 401,
                code: 'INVALID_CREDENTIALS'
            }
        )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if(!passwordMatch) {
        throw new AppError('Identifiants incorrects',
            {
                status: 401,
                code: 'INVALID_CREDENTIALS'
            }
        )
    }

    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    };
}

export const createAuthToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });
};

export const verifyAuthToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}