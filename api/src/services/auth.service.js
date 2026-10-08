import bcrypt from 'bcryptjs';
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