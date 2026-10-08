import 'dotenv/config';
import { createApp } from './src/app.js';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
})