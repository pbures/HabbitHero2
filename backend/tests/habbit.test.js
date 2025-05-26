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

let dbName = 'HH2-be-habbit-test';
let dbHabitsCollectionName = 'habbits';
let dbUsersCollectionName = 'users';
let serverPort = 3002;


beforeAll((done) => {

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

describe('API Tests habbits', () => {

  beforeEach(async () => {
    await myMongoDBManager.database.dropCollection('habbits');
    await myMongoDBUserManager.database.dropCollection('users');
    await createSampleUsers(server, testJWT);
  });

  it('should return exactly one habbit', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit',
      user_ids: [],
      observer_ids: ['fakeAuth-123']
    }

    const response = await request(server)
    .put('/habbit')
    .set('testUserId', 'fakeAuth-123')
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('testUserId', 'fakeAuth-123')
    .send(habitData)
    .expect(200)

    expect(response2.body).toBeDefined();
    expect(response2.body.length).toBe(1);
    expect(response2.body[0].name).toEqual('Test Habit');
    expect(response2.body[0].description).toEqual('This is a test habit');
  });

  it('should return habbits even of a friend that has sent an invite', async () => {

    const habitDataOfUser123 = Task.createExampleInstance()
    createSampleUsers(server, testJWT);

    //User 123 stores the habbit, setting the observer_ids to the user 321
    const response = await request(server)
    .put('/habbit')
    .set('testUserId', 'fakeAuth-123')
    .send({...habitDataOfUser123, observer_ids: ['fakeAuth-321']})
    .expect(200)

    //User 321 asks for the habbits, he should see the habbit of user 123
    const response2 = await request(server)
    .get('/habbits')
    .set('testUserId', 'fakeAuth-321')
    .expect(200)

    expect(response2.body).toBeDefined();
    expect(response2.body.length).toBeGreaterThan(0);
    const habbitOfUser123 = response2.body.find(habbit => habbit.user_ids.includes('fakeAuth-123'));
    expect(habbitOfUser123.is_observer).toBe(true);
  });

  it('should update habit on PUT /habbit', async () => {
    const habbit = Task.createExampleInstance()

    const response = await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habbit)
      .expect(200)

    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully')
  })

  it('should not update & delete habit on PUT /habbit when not owner', async () => {
    const habbit = Task.createExampleInstance()
    // habbit.user_ids = ['fakeAuth-123']

    const response1 = await request(server)
    .put('/habbit')
    .set('testUserId', 'fakeAuth-123')
    .send(habbit)
    .expect(200)

    const response15 = await request(server)
      .get('/habbits')
      .set('testUserId', 'fakeAuth-123')
      .expect(200)

    const response2 = await request(server)
      .put('/habbit')
      .set('testUserId', 'fakeAuth-321')
      .send(response15.body[0])
      .expect(403)
    
    const response3 = await request(server)
      .delete('/habbit')
      .set('testUserId', 'fakeAuth-321')
      .query({ habbitId: response15.body[0]._id })
      .expect(403)

    // Add your assertions here based on the expected response
    expect(response2.body).toHaveProperty('message', 'Forbidden')
    expect(response3.body).toHaveProperty('message', 'Forbidden')
  })

  it('should update habit on PUT /habbit and not create a new one', async () => {
    const habbit = Task.createExampleInstance()

    /* Create the habbit first */
    const response = await request(server)
      .put('/habbit')
      .set('testUserId',  'fakeAuth-1234') // Replace with a valid test JWT
      .send(habbit)
      .expect(200)

    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully')

    /* Get habbits and verify there is just one returned */
    const response2 = await request(server)
      .get('/habbits')
      .set('testUserId',  'fakeAuth-1234')
      .expect(200)

    expect(response2.body).toBeDefined();
    expect(response2.body.length).toBe(1);
    expect(response2.body[0].name).toEqual(habbit.name);
    expect(response2.body[0]._id).toBeDefined();

    /* Update the very same habbit */
    const updatedHabbit = response2.body[0];
    updatedHabbit.name = 'Updated Test Habit';
    updatedHabbit.description = 'This is an updated test habit';

    const response3 = await request(server)
    .put('/habbit')
    .set('testUserId',  'fakeAuth-1234') // Replace with a valid test JWT
    .send(updatedHabbit)
    .expect(200)

    /* Get habbits and verify there is just one returned */
    const response4 = await request(server)
    .get('/habbits')
    .set('testUserId',  'fakeAuth-1234')
    .expect(200)

    expect(response4.body).toBeDefined();
    expect(response4.body.length).toBe(1);
    expect(response4.body[0].name).toEqual('Updated Test Habit');
    expect(response4.body[0].description).toEqual('This is an updated test habit');
  })

  it('should delete a habbit', async () => {
    const habitData = Task.createExampleInstance();

    const response = await request(server)
    .put('/habbit')
    .set('testUserId',  'fakeAuth-123')
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('testUserId', 'fakeAuth-123')
    .expect(200)

    // console.log(response2.body[0]._id)
    const response3 = await request(server)
      .delete('/habbit')
      .set('testUserId', 'fakeAuth-123')
      .query({ habbitId: response2.body[0]._id })
      .expect(200)

    const response4 = await request(server)
      .get('/habbits')
      .set('testUserId', 'fakeAuth-123')
      .expect(200)

    expect(response4.body).toBeDefined();
    expect(response4.body.length).toBe(0);
    
    
    // Add your assertions here based on the expected response
  }) 
  it('should throw 400 when bad request at /delete a habbit', async () => {
    const habitData = Task.createExampleInstance();

    const response = await request(server)
    .put('/habbit')
    .set('testUserId',  'fakeAuth-123')
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('testUserId', 'fakeAuth-123')
    .expect(200)

    // console.log(response2.body[0]._id)
    const response3 = await request(server)
      .delete('/habbit')
      .set('testUserId', 'fakeAuth-123')
      .query({ nonGudID: response2.body[0]._id })
      .expect(400)

    
    // Add your assertions here based on the expected response
  }) 
  it('should return friends habbits', async () => {
    let habitData = Task.createExampleInstance();
    // habitData.user_ids = ['fakeAuth-123'];
    // habitData._id = 'habibi123';
    habitData.observer_ids = [];

    await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321')
      .send(habitData)
      .expect(200)

    const responseHabibi1 = await request(server)
      .get('/habbits')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321')
      .expect(200)

    habitData._id = responseHabibi1.body[0]._id;
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

    const responseRe = await request(server)
      .put('/habbit_invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .send({friend_id: 'fakeAuth-123', habbit_id: habitData._id})
      .expect(200)

    const responseHabibi = await request(server)
      .get('/habbits')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .expect(200)

    expect(responseHabibi.body).toBeDefined();
    expect(responseHabibi.body.length).toBeGreaterThan(0);

    // Filter from the habbits that was invited, based on the habbitData._id
    const invitedHabbit = responseHabibi.body.find(habit => habit._id === habitData._id);
    expect(invitedHabbit).toBeDefined();
    console.log(`Invited habbit: user_ids: `, invitedHabbit);

    expect(invitedHabbit.user_ids).toContain('fakeAuth-321');
    expect(invitedHabbit.observer_ids).toContain('fakeAuth-123');

  }, 1500)
  it('should accept habbit invite on PUT /habbit_invite', async () => {
    let habitData = Task.createExampleInstance();
    // habitData.user_ids = ['fakeAuth-123'];
    // habitData._id = 'habibi123';
    habitData.observer_ids = [];

    await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321')
      .send(habitData)
      .expect(200)

    const responseHabibi1 = await request(server)
      .get('/habbits')
      .set('Authorization',  `Bearer ${testJWT}`)
      .set('testUserId', 'fakeAuth-321')
      .expect(200)

    habitData._id = responseHabibi1.body[0]._id;
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

    const responseRe = await request(server)
      .put('/habbit_invite')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .send({friend_id: 'fakeAuth-123', habbit_id: habitData._id})
      .expect(200)

    const responseHabibi = await request(server)
      .get('/habbits')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .set('testUserId', 'fakeAuth-321')
      .expect(200)

    expect(responseHabibi.body).toBeDefined();
    expect(responseHabibi.body.length).toBeGreaterThan(0);

    // Filter from the habbits that was invited, based on the habbitData._id
    const invitedHabbit = responseHabibi.body.find(habit => habit._id === habitData._id);
    expect(invitedHabbit).toBeDefined();
    console.log(`Invited habbit: user_ids: `, invitedHabbit);

    expect(invitedHabbit.user_ids).toContain('fakeAuth-321');
    expect(invitedHabbit.observer_ids).toContain('fakeAuth-123');

  }, 1500),
  it('should update habbit notes on PUT /habbit', async () => {
    const habbit = Task.createExampleInstance()
    expect(habbit.notes).toEqual('This is an example task for demonstration purposes.')

    const response = await request(server)
      .put('/habbit')
      .set('testUserId', 'fakeAuth-321') // Replace with a valid test JWT
      .send(habbit)
      .expect(200)
    
    const response2 = await request(server)
      .get('/habbits')
      .set('testUserId', 'fakeAuth-321') // Replace with a valid test JWT
      .expect(200)
    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully');
    expect(response2.body[0].notes).toEqual('This is an example task for demonstration purposes.'); //This isnt working. It cant find it idk its just stupid, but it works :D
  }, 1000)
}, 500)
