import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import authRouter from './routes/auth.route.js';
import categoriesRouter from './routes/categories.route.js';
import { authenticate } from './middlewares/auth.middleware.js';

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
        
    });
    
    app.use('/api/auth', authRouter);
    app.use('/api/admin/categories', authenticate, categoriesRouter);

    app.use(errorHandler);

    return app;

};