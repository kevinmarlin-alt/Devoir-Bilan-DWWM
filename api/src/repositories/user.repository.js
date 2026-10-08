import { AppUser } from "../models/AppUser.js"

export const getUserByEmail = async (email) => {
    return await AppUser.findOne({
        where: { email }
    })
}
