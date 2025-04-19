import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createServer } from 'http';
import request from 'supertest';
import createApp from '../app.mjs';

import Task from '../frontend/src/model/task.mjs';
import MongoDBManager from '../MongoDBManager.mjs';
import MongoDBUserManager from '../MongoDBUserManager.mjs';

import createSampleUsers from './common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({path:`${__dirname}/../.env`});

let server, testJWT
let myMongoDBManager, myMongoDBUserManager

let dbName = 'HH2-be-user-test';
let dbHabitsCollectionName = 'habbits';
let dbUsersCollectionName = 'users';
let serverPort = 3003;


beforeAll(async (done) => {

  const DBUri = process.env.MONGODB_CONNECTION_STRING;

  myMongoDBManager = new MongoDBManager(DBUri, dbName, dbHabitsCollectionName);
  myMongoDBUserManager = new MongoDBUserManager(DBUri, dbName, dbUsersCollectionName);

  testJWT = "testingToken"

  const app = createApp(myMongoDBManager, myMongoDBUserManager);
  server = createServer(app)
  server.listen(serverPort, done)
})

afterAll((done) => {
  server.close(done)
})

describe('API Tests users', () => {
  beforeEach(async () => {

    await myMongoDBUserManager.dropCollection('users');
    console.log('deleted users col.')

    await createSampleUsers(server, testJWT);
    console.log('added users')
  })

  it('should invite user on PUT /invite', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const responseS = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200)

    expect(responseS.body).toHaveProperty('message', 'Invitation sent successfully')
    const response = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-321')
    .expect(200)
    expect(response.body).toHaveProperty('invites_received');
    expect(response.body.invites_received).toContain('fakeAuth-123');

  })
  it('should return user data on GET /user', async () => {

    const response = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-234')
    .expect(200)
    console.log(response.body);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('user_id', 'fakeAuth-234');
  })

  it('should return 404 for non-existent user on GET /user', async () => {
    const response = await request(server)
      .get('/user')
      .set('Authorization', `Bearer ${testJWT}`)
      .set('testUserId', 'nonExistentUser')
      .expect(404)

    expect(response.body).toHaveProperty('message', 'User not found')
  })

  it('should return users on GET /users', async () => {

    const response = await request(server)
    .get('/users')
    .set('Authorization', `Bearer ${testJWT}`)
    .query({nickname: 'nick-234'})
    .expect(200)

    expect(response.body).toBeDefined();
  })

  it('should return no users on GET /users', async () => {

    const response = await request(server)
    .get('/users')
    .set('Authorization', `Bearer ${testJWT}`)
    .query({nickname: 'nick-978'})
    .expect(404)
  })

  it('should accept invite on PUT /accept', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    await request(server)
    .put('/invite')
    .set('testUserId', 'fakeAuth-123')
    .query({nickname: 'nick-321'})
    .expect(200)

    const responseI = await request(server)
    .get('/user')
    .set('testUserId', 'fakeAuth-321')
    .expect(200)

    expect(responseI.body).toHaveProperty('invites_received');
    expect(responseI.body.invites_received).toContain('fakeAuth-123');

    const responseR = await request(server)
      .put('/accept')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .query({nickname: 'nick-123'})
      .expect(200)

    expect(responseR.body).toHaveProperty('message', 'Invitation accepted successfully')
    const response = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-321')
    .expect(200)

    /* Verify that the user is in friends array, and is not in invites_received array */
    expect(response.body).toHaveProperty('friends');
    expect(response.body.friends).toContain('fakeAuth-123');
    expect(response.body.invites_received).not.toContain('fakeAuth-123');
  })

  it.skip('should accept invite on PUT /accept and remove from invites sent or accepted', async () => {

    /* First send an invite from user 123 to user 321 */
    await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321')
      .query({nickname: 'nick-123'})
      .expect(200)

    /* Accept the invite */
    const responseR = await request(server)
      .put('/accept')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200)

    expect(responseR.body).toHaveProperty('message', 'Invitation accepted successfully')

    /* Verify that only the friends field is populated. Sent and invite fields should be empty */
    /* Load the friends */
    const user123 = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-123')
    .expect(200)

    const user321 = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-321')
    .expect(200)

    expect(user123.body).toHaveProperty('friends');
    expect(user123.body).toHaveProperty('invites_sent')
    expect(user123.body).toHaveProperty('invites_received');

    expect(user123.body.invites_sent.length).toEqual(0);
    expect(user321.body.invites_sent.length).toEqual(0);

    expect(user123.body.invites_received.length).toEqual(0);
    expect(user321.body.invites_received.length).toEqual(0);

    expect(user123.body.friends).toContain('fakeAuth-321');
    expect(user321.body.friends).toContain('fakeAuth-123');
  })

  it('should return 409 if user is already invited on PUT /invite', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }


    const responseS = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200)
    const responseS2 = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(409)

    // expect(responseS.body).toHaveProperty('message', 'Invitation sent successfully')
  })
  it('should return 409 if user is already a friend on PUT /accept', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const responseR = await request(server)
      .put('/accept')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .query({nickname: 'nick-123'})
      .expect(200)

    const responseR2 = await request(server)
      .put('/accept')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .query({nickname: 'nick-123'})
      .expect(409)

  });

  afterAll(async () => {
    await myMongoDBUserManager.close();
  })

  it('should throw error when sending invalid user object', async () => {

    const user = {
      nickname: 'nick-123',
      invites_sent: [],
      invites_received: [],
      friends: []
    }

    const response3 = await request(server)
    .put('/user')
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .set('testUserId', 'usertofail')
    .send(user)
    .expect(400)
  });

  it('should return error 403 if /invite is sent with the same nickname as of the given user', async () => {

    const response1 = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-123'})
      .expect(403);

      expect(response1.body).toHaveProperty('message', 'You cannot invite yourself');
  });

  it('should return error 406 if PUT /user (existing user) contains already existin nickname', async () => {

    const newUser = {
      name: 'New Nick 123',
      nickname: 'nick-123',
      email: 'new-nick123@example.com',
      schema_version: '1.0',
      invites_sent: [],
      invites_received: [],
      friends: []
    }

    const response1 = await request(server)
      .put('/user')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321') //set to nickname that already exists
      .send(newUser)
      .expect(406);

      expect(response1.body).toHaveProperty('message', 'Nickname already exists');
  });

  it('should return error 406 if PUT /user (new user) contains already existin nickname', async () => {

    const newUser = {
      name: 'New Nick 123',
      nickname: 'nick-123',
      email: 'new-nick123@example.com',
      schema_version: '1.0',
      invites_sent: [],
      invites_received: [],
      friends: []
    }

    const response1 = await request(server)
      .put('/user')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-new') //set to nickname that already exists
      .send(newUser)
      .expect(406);

      expect(response1.body).toHaveProperty('message', 'Nickname already exists');
  });

  it('should return an array of user id and nickname objects', async () => {

    const expectedResult = [
      { "user_id": "fakeAuth-234", "nickname": "nick-234" },
      { "user_id": "fakeAuth-321", "nickname": "nick-321" },
    ];

    /* set up my user (123) to have some invitations via rest call PUT /invite */
    const response1 = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200);

    const response2 = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-234'})
      .expect(200);

    const response3 = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-234')
      .query({nickname: 'nick-123'})
      .expect(200);

    const response = await request(server)
      .get('/nicknames')
      .set('Authorization', `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-123')
      .expect(200)

    expect(response.body).toBeDefined();
    expect(response.body).toEqual(expectedResult);
  });
  it('should add users to friends if they invite each other', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const responseS = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200)

      const responseR = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .query({nickname: 'nick-123'})
      .expect(200)

    // Add your assertions here based on the expected response
    expect(responseS.body).toHaveProperty('message', 'Invitation sent successfully')
    const response = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-321')
    .expect(200)
    expect(response.body.friends).toContain('fakeAuth-123');

  })
})
