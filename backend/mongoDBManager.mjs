import { MongoClient } from 'mongodb';

class MongoDBManager {
  // I dont know if the connection in the constructor will work because it is async
  constructor(uri = process.env.MONGODB_CONNECTION_STRING) {
    this.client = new MongoClient(uri);
    (async () => {
      await this.client.connect();
    })();
  }
  async connect() {
    await this.client.connect();
  }
  async close() {
    await this.client.close();
  }
  async insert(data) {
    const database = this.client.db('habbitHeroDatabase1');
    const collection = database.collection('habbits');
    if (data.length == 0) {
      return { status: 204, message: 'No data to insert' };
    } else if (data.length == 1) {
      await collection.insertOne(data);
    } else if (data.length > 1) {
      await collection.insertMany(data);
    }
  }
  async findOne(query) {
    const database = this.client.db('habbitHeroDatabase1');
    const collection = database.collection('habbits');
    return await collection.findOne(query);
  }
  async delete(query) {
    const database = this.client.db('habbitHeroDatabase1');
    const collection = database.collection('habbits');
    await collection.deleteOne(query);
  }
  async find(query = {}) {
    const database = this.client.db('habbitHeroDatabase1');
    const collection = database.collection('habbits');
    return await collection.find(query).toArray();
  }
}

export default MongoDBManager;