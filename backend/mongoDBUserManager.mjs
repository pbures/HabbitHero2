import { MongoClient } from 'mongodb';

class MongoDBUserManager {
  // I dont know if the connection in the constructor will work because it is async
  constructor(
    uri = process.env.MONGODB_CONNECTION_STRING,
    dbName = 'habbitHeroDatabase1',
    collectionName = 'users'
  ){
    console.log(`Connecting MongoDBUserManager to DB: ${uri}`);

    this.client = new MongoClient(uri,
      {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      }
    );
    this.database = this.client.db(dbName);
    this.userCollection = this.database.collection(collectionName);
  }
  async connect() {
    await this.client.connect();
  }
  async close() {
    await this.client.close();
  }

  async clearAllData() {
    await this.database.dropCollection(this.userCollection.collectionName);
  }

  async insert(data) {
    const collection = this.userCollection;
    await collection.insertOne(data);
  }
  async findOne(query) {
    const collection = this.userCollection;
    return await collection.findOne(query);
  }
  async update(query, data) {
    const collection = this.userCollection;
    console.log(`tryng to update something with data: ....updateOne( ${query}, { $set: ${data} })`)

    await collection.updateOne(query, { $set: data });
  }
  async delete(query) {
    const collection = this.userCollection;
    await collection.deleteOne(query);
  }

  async dropCollection(collection) {
    return this.database.dropCollection(collection);
  }

  async push(query, data, arrayName) {
    const collection = this.userCollection;
    const updateDoct = {
      $push: {
        [arrayName]: data
      }
    }
    await collection.updateOne(query, updateDoct);
  }
  async deleteFromArray(user_id, arrayName, friend_id) {
    const collection = this.userCollection;
    await collection.updateOne(
      { user_id: user_id },
      { $pull: { [arrayName]: friend_id } }
   )

  }
  async find(query = {}) {
    console.log('trying to find a user with query:', query);
    const collection = this.userCollection;
    let ret = await collection.find(query).toArray();
    console.log('query:', query,'found this:', ret);
    return ret;
  }
}

export default MongoDBUserManager;
