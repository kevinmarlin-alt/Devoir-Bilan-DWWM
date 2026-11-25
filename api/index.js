import 'dotenv/config';
import './src/models/associations.js'
import { createApp } from './src/app.js';
import { placeEventsDatabase } from './src/db/placeEventsDatabase.js';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
    void placeEventsDatabase.start();
})
