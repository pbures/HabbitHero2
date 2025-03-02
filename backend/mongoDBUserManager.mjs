import { MongoClient } from 'mongodb';

class MongoDBUserManager {
  // I dont know if the connection in the constructor will work because it is async
  constructor(uri){
    console.log(`Connecting MongoDBUserManager to DB: ${uri}`);

    this.client = new MongoClient(uri,
      {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000
      }
    );
    this.database = this.client.db('habbitHeroDatabase1');
    this.habbitCollection = this.database.collection('users');
  }
  async connect() {
    await this.client.connect();
  }
  async close() {
    await this.client.close();
  }
  async insert(data) {
    const collection = this.habbitCollection;
    await collection.insertOne(data);
  }
  async findOne(query) {
    const collection = this.habbitCollection;
    return await collection.findOne(query);
  }
  async update(query, data) {
    const collection = this.habbitCollection;
    console.log(`tryng to update something with data: ....updateOne( ${query}, { $set: ${data} })`)

    await collection.updateOne(query, { $set: data });
  }
  async delete(query) {
    const collection = this.habbitCollection;
    await collection.deleteOne(query);
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
  async find(query = {}) {
    console.log('trying to find a habbit with query:', query);
    const collection = this.habbitCollection;
    let ret = await collection.find(query).toArray();
    console.log('query:', query,'found this:', ret);
    return ret;
  }
}

export default MongoDBUserManager;
