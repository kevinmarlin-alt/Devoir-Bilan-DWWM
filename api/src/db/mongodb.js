import { MongoClient } from 'mongodb';
import { AppError } from '../errors/AppError.js';

const EVENTS_COLLECTION = 'events-private-place';

class MongoDatabase {
  constructor(uri) {
    this.client = new MongoClient(uri);
    this.collection = this.client.db().collection(EVENTS_COLLECTION);
  }

  async getCollection() {
    return this.collection;
  }

  async disconnect() {
    await this.client.close();
  }
}

const database = new MongoDatabase(process.env.MONGODB_URI);

export const mongoDatabase = await database.getCollection();
export const disconnectMongoDatabase = () => database.disconnect();
