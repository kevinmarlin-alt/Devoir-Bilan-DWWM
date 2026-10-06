import express from 'express';
import morgan from 'morgan';


export const createApp = () => {

    const app = express();

    app.use(morgan("dev"))

    app.get('/', (req, res) => res.send('Hello world !'));

    return app;

};