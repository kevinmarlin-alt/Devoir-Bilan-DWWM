import express from 'express';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './errors/AppError.js';


export const createApp = () => {

    const app = express();

    app.use(morgan("dev"))

    app.get('/', (req, res) => {
        throw new AppError('Ressource introuvable', { 
            status: 404, 
            code: 'RESSOURCE_NOT_FOUND'
        });
    });

    app.use(errorHandler);

    return app;

};