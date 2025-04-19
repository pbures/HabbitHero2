import { MongoClient, ObjectId } from 'mongodb';

class MongoDBManager {
  // I dont know if the connection in the constructor will work because it is async
  constructor(
    uri = process.env.MONGODB_CONNECTION_STRING,
    dbName = 'habbitHeroDatabase1',
    collectionName = 'habbits'
  ) {
    console.log(`Connecting mongoDBManager to DB: ${uri}`);
    this.client = new MongoClient(uri,
      {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      }
    );
    this.database = this.client.db(dbName);
    this.habbitCollection = this.database.collection(collectionName);
  }
  async connect() {
    await this.client.connect();
  }

  async close() {
    await this.client.close();
  }

  async clearAllData() {
    await this.database.dropCollection(this.habbitCollection.collectionName);
  }

  async insert(data) {
    const collection = this.habbitCollection;
    console.log('inserting a habbit');
    const result = await collection.insertOne(data);
    console.log('habbit inserted');
    return result;
  }

  async findOne(query) {
    const collection = this.habbitCollection;
    return await collection.findOne(query);
  }

  async update(query, data) {
    const collection = this.habbitCollection;
    console.log(`tryng to update something with data: ....updateOne( ${query}, { $set: ${data} })`)

    const result = await collection.updateOne(query, { $set: data });
    console.log('The record was updated.\n\n')
    // resolve(result);
    return result;
  }

  async delete(query) {
    const collection = this.habbitCollection;
    await collection.deleteOne(query);
  }
  async find(query = {}) {
    console.log('trying to find a habbit with query:', query);
    const collection = this.habbitCollection;
    let ret = await collection.find(query).toArray();
    return ret;
  }
  async push(query, data, arrayName) {
    const collection = this.habbitCollection;
    const updateDoct = {
      $push: {
        [arrayName]: data
      }
    }
    await collection.updateOne(query, updateDoct);
  }
}

export default MongoDBManager;
