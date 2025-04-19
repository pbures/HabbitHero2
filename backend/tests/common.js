import { createServer } from 'http';
import request from 'supertest';
import MongoDBManager from '../MongoDBManager.mjs';
import MongoDBUserManager from '../MongoDBUserManager.mjs';
import createApp from '../app.mjs';

async function createSampleUsers(server, testJWT) {
  const user1 = {
    name: 'Nick 123',
    nickname: 'nick-123',
    email: 'nick123@example.com',
    schema_version: '1.0',
    invites_sent: [],
    invites_received: [],
    friends: []
  }

  const user3 = {
    name: 'Nick 234',
    nickname: 'nick-234',
    email: 'nick234@example.com',
    schema_version: '1.0',
    invites_sent: [],
    invites_received: [],
    friends: []
  }

  const user2 = {
    name: 'Nick 321',
    nickname: 'nick-321',
    email: 'nick321@example.com',
    schema_version: '1.0',
    invites_sent: [],
    invites_received: [],
    friends: []
  }

  const response1 = await request(server)
  .put('/user')
  .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
  .set('testUserId', 'fakeAuth-123')
  .send(user1)
  .expect(200)

  const response2 = await request(server)
  .put('/user')
  .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
  .set('testUserId', 'fakeAuth-321')
  .send(user2)
  .expect(200)

  const response3 = await request(server)
  .put('/user')
  .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
  .set('testUserId', 'fakeAuth-234')
  .send(user3)
  .expect(200)

  console.log('added users')
}

export default createSampleUsers
