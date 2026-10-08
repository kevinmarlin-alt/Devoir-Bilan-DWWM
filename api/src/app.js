import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppUser } from './models/AppUser.js';
import { loginHandler } from './controllers/auth.controller.js'

export const createApp = () => {

    const app = express();

    app.use(cookieParser());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }))

    
    app.get('/', async (req, res) => {
        try {
            const users = await AppUser.findAll();
            console.log('All users:', JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    app.post('/api/auth/login', loginHandler);

    app.use(errorHandler);

    return app;

};