import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import sequelize from './db/database.js'


export const createApp = () => {

    const app = express();

    app.use(morgan("dev"))
    app.use(express.json());
    app.use(cors({
        origin: process.env.CORS_ORIGIN
    }))

    
    app.get('/', async (req, res) => {
        try {
            await sequelize.authenticate()
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    app.use(errorHandler);

    return app;

};