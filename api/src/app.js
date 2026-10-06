import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './errors/AppError.js';


export const createApp = () => {

    const app = express();

    app.use(morgan("dev"))
    app.use(express.json());
    app.use(cors({
        origin: process.env.CORS_ORIGIN
    }))

    app.get('/', (req, res) => {
        throw new AppError('Ressource introuvable', { 
            status: 404, 
            code: 'RESSOURCE_NOT_FOUND'
        });
    });

    app.use(errorHandler);

    return app;

};