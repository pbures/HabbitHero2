// tests/api.test.js
import { createServer } from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.mjs'; // Adjust the path to your main.mjs file

import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';

let server
let testJWT

const uri = process.env.MONGODB_CONNECTION_STRING;

const myMongoDBManager = new MongoDBManager(uri);
const myMongoDBUserManager = new MongoDBUserManager(uri);

beforeAll((done) => {
  server = createServer(app)
  server.listen(3001, done)

  testJWT = "testingToken"
})

afterAll((done) => {
  server.close(done)
})

describe('API Tests habbits', () => {


  it('should update habit on PUT /habbit', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const response = await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habitData)
      .expect(200)

    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully')
  })


  it('should delete a habbit', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const response = await request(server)
    .put('/habbit')
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .send(habitData)
    .expect(200)

    // console.log(response2.body[0]._id)
    const response3 = await request(server)
      .delete('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habitData)
      .query({habbitId: response2.body[0]._id})
      .expect(200)

    // Add your assertions here based on the expected response
  })
})

describe('API Tests users', () => {
  beforeEach(async () => {

    await myMongoDBUserManager.dropCollection('users');

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

  })
  // beforeEach(async () => {
  //   await myMongoDBUserManager.dropCollection('users');
  // });
  it('should invite user on PUT /invite', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    // const user = await request(server)
    // .get('/users')
    // .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    // .set('testUserId', '123')
    // .query({nickname: '321'})
    // .expect(200)

    const responseS = await request(server)
      .put('/invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-123')
      .query({nickname: 'nick-321'})
      .expect(200)

      // const responseR = await request(server)
      // .put('/invite')
      // .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      // .set('testUserId', 'fakeAuth-321')
      // .query({nickname: 'fakeAuth-123'})
      // .expect(200)

    // Add your assertions here based on the expected response
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

    // const user = await request(server)
    // .get('/users')
    // .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    // .set('testUserId', '123')
   // .query({nickname: '321'})
    // .expect(200)

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
    expect(response.body).toHaveProperty('friends');
    expect(response.body.friends).toContain('fakeAuth-123');

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

    // const user = await request(server)
    // .get('/users')
    // .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    // .set('testUserId', '123')
   // .query({nickname: '321'})
    // .expect(200)

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

    // expect(responseR.body).toHaveProperty('message', 'You are already friends')
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

  it('should return error 406 if PUT /user contains already existin nickname', async () => {

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
      .set('testUserId', 'fakeAuth-123') //set to nickname that already exists
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


})

