import express from 'express'


export const createApp = () => {

    const app = express();

    app.get('/', (req, res) => res.send('Hello world !'));

    return app;

};