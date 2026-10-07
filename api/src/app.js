import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';
import sequelize from './db/database.js'
import { AppUser } from './controllers/models/AppUser.js';


export const createApp = () => {

    const app = express();

    app.use(morgan("dev"))
    app.use(express.json());
    app.use(cors({
        origin: process.env.CORS_ORIGIN
    }))

    
    app.get('/', async (req, res) => {
        try {
            const users = await AppUser.findAll();
            console.log('All users:', JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    });

    app.use(errorHandler);

    return app;

};