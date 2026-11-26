import { MongoClient } from 'mongodb';
import { AppError } from '../errors/AppError.js';

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    throw new AppError('Le serveur de stockage des événements est indisponible.', {
      status: 503,
      code: 'EVENTS_SERVER_UNAVAILABLE',
      cause: err
    })
  }
}

export async function connectToEventsCollection () {
  const db = await connectToMongoDB();
  return db.db().collection('events-private-place');

}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}