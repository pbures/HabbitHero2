import { strict as assert } from 'assert';
import MongoDBManager from '../mongoDBManager.mjs';

describe('MongoDBManager', function() {
  // before(function () {
  //   // runs before each test in this block
  //   const myMongoDBManager = new MongoDBManager();
  // });

  // after(async function () {
  //     await myMongoDBManager.close();
  // });
  describe('insert', function() {
    it('should insert a document into the collection and find it', async function() {
        const myMongoDBManager = new MongoDBManager();
        const data = {name: 'test', description: 'test description'};
        await myMongoDBManager.insert(data);
        const query = {name: 'test'};
        const result = await myMongoDBManager.findOne(query);
        await myMongoDBManager.close();
        assert.deepStrictEqual(result, data);
    });
  });
});