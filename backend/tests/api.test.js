// tests/api.test.js
import { createServer } from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.mjs'; // Adjust the path to your main.mjs file
import Task from '../frontend/src/model/task.mjs';

import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';

let server
let testJWT

const uri = process.env.MONGODB_CONNECTION_STRING;

let myMongoDBManager = undefined
let myMongoDBUserManager = undefined;

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

beforeAll((done) => {
  server = createServer(app)
  server.listen(3002, done)

  myMongoDBManager = new MongoDBManager(uri);
  myMongoDBUserManager = new MongoDBUserManager(uri)

  testJWT = "testingToken"
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
    .set('Authorization',  `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-123')
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('Authorization',  `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-123')
    .send(habitData)
    .expect(200)

    expect(response2.body).toBeDefined();
    expect(response2.body.length).toBe(1);
    expect(response2.body[0].name).toEqual('Test Habit');
    expect(response2.body[0].description).toEqual('This is a test habit');
  });

  it('should return habbits even of a friend that has sent an invite', async () => {

    const habitDataOfUser123 = {
      name: 'Test Habit',
      description: 'This is a test habit',
      observer_ids: ['fakeAuth-321']
    }

    createSampleUsers(server, testJWT);

    //User 123 stores the habbit, setting the observer_ids to the user 321
    const response = await request(server)
    .put('/habbit')
    .set('Authorization',  `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-123')
    .send(habitDataOfUser123)
    .expect(200)

    //User 321 asks for the habbits, he should see the habbit of user 123
    const response2 = await request(server)
    .get('/habbits')
    .set('Authorization',  `Bearer ${testJWT}`)
    .set('testUserId', 'fakeAuth-321')
    .expect(200)

    expect(response2.body).toBeDefined();
    expect(response2.body.length).toBeGreaterThan(0);
    const habbitOfUser123 = response2.body.find(habbit => habbit.user_ids.includes('fakeAuth-123'));
    expect(habbitOfUser123.name).toEqual('Test Habit');
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

  it('should update habit on PUT /habbit and not create a new one', async () => {
    const habbit = Task.createExampleInstance()

    /* Create the habbit first */
    const response = await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habbit)
      .expect(200)

    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully')

    /* Get habbits and verify there is just one returned */
    const response2 = await request(server)
      .get('/habbits')
      .set('Authorization',  `Bearer ${testJWT}`)
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
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .send(updatedHabbit)
    .expect(200)

    /* Get habbits and verify there is just one returned */
    const response4 = await request(server)
    .get('/habbits')
    .set('Authorization',  `Bearer ${testJWT}`)
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
      .set('Authorization',  `Bearer ${testJWT}`)
      .expect(200)

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

  }, 1500)
}, 500)

describe('API Tests users', () => {
  beforeEach(async () => {

    await myMongoDBUserManager.dropCollection('users');
    console.log('deleted users col.')

    await createSampleUsers(server, testJWT);
    console.log('added users')
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

