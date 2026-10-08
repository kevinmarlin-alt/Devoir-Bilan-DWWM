import { authenticateUser, createAuthToken } from "../services/auth.service.js";
import { createAuthToken } from "../services/token.service.js";

export const loginHandler = async (req, res) => {
    const { email, password } = req.body;

    const user = await authenticateUser(email, password);

    const token = createAuthToken(user)

    res.cookie('pp_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000 //8h
    })

    res.status(200).json({ user });
 }

 export const currentUserHandler = (req, res) => {
    const user = req.user;

    res.status(200).json({ user })
 }