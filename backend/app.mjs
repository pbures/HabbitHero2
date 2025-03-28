import express from 'express';
// import modelHabbit from '../frontend/src/model/task.js'
// import modelUser from '../frontend/src/model/user.js'
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import { ObjectId } from 'mongodb';
import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';

import ajv from 'ajv';
import path from 'path';
import { fileURLToPath } from 'url';

import { error } from 'console';
import User from '../frontend/src/model/user.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({path:`${__dirname}/.env`});
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
let checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

if (process.env.MODE=='testing') {
  console.log("Using mocked authentication");

  checkJwt = (req, res, next) => {
    let userId = 'auth0|1234567890';
    if(req.headers.testuserid) {
      userId = req.headers.testuserid;
    }
    req.auth = {
      payload: {
        sub: `${userId}`,
        email: `${userId}@example.com`
      }
    };
    next();
  };
}

console.log(process.env.AUTH0_AUDIENCE);

let origin = process.env.CORS_ORIGIN_ALLOW || 'http://localhost:5173';

const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

const uri = process.env.MONGODB_CONNECTION_STRING;

const myMongoDBManager = new MongoDBManager(uri);
const myMongoDBUserManager = new MongoDBUserManager(uri);

try {
  await myMongoDBManager.connect();
  console.log('Connected to the database');
} catch (error) {
  console.error('Error connecting to the database:', error);
  process.exit(1);
}

app.get('/habbits', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  console.log(`userId: ${userId}`);

  /* Keep this for reference. The code uses the /userinfo endpoint of the Auth0 to get the user
   * info such as email. This is not needed right now, since the auth0 adds the email to the
   * JWT token issued when user authenticates at the frontend app.
   */
  /*
  const token = req.headers.authorization.split(' ')[1];
  console.log("token:", token);
  */
  /*
  const userinfo = req.auth.payload.aud[1]
  const response = await axios.get(userinfo, {
    headers: {
      Authorization: `Bearer ${token}`, // Pass the Bearer token
    },
  });
  console.log("userinfo response:", response);
  */

  console.log(`GET request at /habbits from user id: ${userId}`);
  const habbits = await myMongoDBManager.find({ user_ids: { $in: [userId] } });
  res.status(200).json(habbits);
});

app.get('/user', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  const user =  await myMongoDBUserManager.findOne({
    $or: [
      { user_id: userId },
      { email: email }
    ]
  });
  console.log(`Sending back: `, JSON.stringify(user))
  if (user) {
    res.send(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.put('/habbit', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  console.log(`PUT request from user ${userId} at /habbit with data:`, req.body, '_id:', req.body._id);

  let habbit = null;
  if (req.body._id !== undefined) {
    let objectId = new ObjectId(req.body._id);
    habbit = (await myMongoDBManager.find({_id: objectId}))[0];
    console.log('Habbitttt', habbit);
  }

  if(habbit) {
    console.log("Habbit exists", habbit);
    const changes = {};
    for (const key in req.body) {
      // Here if there is an incomming key that is _id, then we have the raw string version, comparing it with the new one.
      if (req.body[key] !== habbit[key]) {
        console.log(`Key: ${key}, old value: ${habbit[key]}, new value: ${req.body[key]}`);
      changes[key] = req.body[key];
      }
    }
    delete changes._id;
    console.log("Changes:", changes);
    await myMongoDBManager.update({_id: habbit._id}, changes);
  } else {
    console.log('Inserting new habbit');
    let object = req.body;
    object.user_ids = [userId];
    await myMongoDBManager.insert(object);
  }

  res.status(200).json({ message: 'Habbit updated successfully' });
});

app.delete('/habbit', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub;

  console.log(`DELETE request from user: ${userId} at /habbit, id:` + req.query.habbitId);
  myMongoDBManager.delete({ _id: new ObjectId(req.query.habbitId) });
  res.status(200).json({ message: 'Habbit deleted successfully' });
});

app.put('/user', checkJwt, async (req, res) => {
  // I dont know if this will work, because we now in the user have user_id and not _id
  // const userId = req.auth.payload.sub
  // let object = req.body;
  // object.user_id = userId;
  // myMongoDBUserManager.insert(object);
  const id = req.auth.payload.sub;
  console.log(`PUT request from user ${id} at /user with data:`, req.body, '_id:', id);

  const schema = User.getJsonSchema();
  /* Validate the payload of the request against the schema using AJV */
  const ajvInstance = new ajv();
  const validate = ajvInstance.compile(schema);
  const valid = validate(req.body);
  if (!valid) {
    console.log('Validation errors:', validate.errors);
    return res.status(400).json({ message: 'Validation errors', errors: validate.errors });
  }

  let user = null;
  // let objectId = new ObjectId(id);
  if (id !== undefined) {
    user = (await myMongoDBUserManager.find({user_id: `${id}`}))[0];
    console.log('userttt', user);
  }

  if(user) {
    console.log("user exists", user);
    const changes = {};
    for (const key in req.body) {
      if (key === 'invites_sent' || key === 'invites_received' || key === 'friends') {
        continue;
      }
      // Here if there is an incomming key that is _id, then we have the raw string version, comparing it with the new one.
      if (`${req.body[key]}` !== user[key]) {
        console.log(`Key: ${key}, old value: ${user[key]}, new value: ${req.body[key]}`);
      changes[key] = `${req.body[key]}`;
      }
    }
    delete changes._id;
    console.log("Changes:", changes);
    let nicknameExists = await myMongoDBUserManager.findOne({nickname: changes?.nickname});
    if(nicknameExists) {
      res.status(406).json({ message: 'Nickname already exists' });
      return;
    }
    if(Object.keys(changes).length > 0) {
      await myMongoDBUserManager.update({user_id: `${id}`}, changes);
    }
  } else {
    console.log('User does not exist');
    console.log('Inserting new user');
    // check if nickname is awailable
    let nickname = req.body.nickname;
    let nicknameExists = await myMongoDBUserManager.findOne({nickname: nickname});
    console.log(nicknameExists);
    if(nicknameExists) {
      res.status(406).json({ message: 'Nickname already exists' });
      return;
    }
    let object = req.body;
    object.user_id = id;

    object.invites_sent = object.invites_sent || [];
    object.invites_received = object.invites_received || [];

    await myMongoDBUserManager.insert(object);
  }

  res.status(200).json({ message: 'Habbit updated successfully' });
});

app.put('/invite', checkJwt, async (req, res) => {
  console.log('PUT request at /invite with body:', req.body, "query:", req.query);
  const userId = req.auth.payload.sub

  let requestedUser = await myMongoDBUserManager.findOne({'nickname': req.query.nickname});
  if (!requestedUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  let requestedUserId = requestedUser.user_id;
  // check if invite already exists
  let user = await myMongoDBUserManager.findOne({ user_id: userId });
  if(requestedUserId === userId) {
    res.status(403).json({ message: 'You cannot invite yourself' });
    return;
  }else if(user.friends.includes(requestedUserId)) {
    // cant invite a friend
    res.status(409).json({ message: 'You are already friends' });
    return;
  }else if (requestedUser.invites_sent.includes(userId)) {
    // If 2 users send each other an invite, they become friends
    await myMongoDBUserManager.deleteFromArray(userId, 'invites_sent', requestedUserId);
    await myMongoDBUserManager.deleteFromArray(requestedUserId, 'invites_recieved', userId);
    // update
    await myMongoDBUserManager.push({user_id: requestedUserId}, userId, 'friends');
    await myMongoDBUserManager.push({ user_id: userId }, requestedUserId, 'friends');
  }
  let isInvited = user.invites_sent.includes(requestedUserId);
  if(isInvited) {
    res.status(409).json({ message: 'You have already sent an invitation' });
    return;
  }
  await myMongoDBUserManager.push({user_id: requestedUserId}, userId, 'invites_received');
  await myMongoDBUserManager.push({ user_id: userId }, requestedUserId, 'invites_sent');
  res.status(200).json({ message: 'Invitation sent successfully' });
});

app.put('/accept', checkJwt, async (req, res) => {
  console.log('PUT request at /accept with body:', req.body, "query:", req.query);
  const userId = req.auth.payload.sub

  let requestedUser = await myMongoDBUserManager.findOne({'nickname': req.query.nickname});
  if(requestedUser === null) {
    return res.status(404).json({ message: 'User not found' });
  }
  let requestedUserId = requestedUser.user_id;
  // chceck if the user isn't already a friend
  let user = await myMongoDBUserManager.findOne({ user_id: userId });
  await myMongoDBUserManager.deleteFromArray(userId, 'invites_received', requestedUserId);

  let isFriend = user.friends.includes(requestedUserId);
  if(isFriend) {
    res.status(409).json({ message: 'You are already friends' });
    return;
  }
  await myMongoDBUserManager.deleteFromArray(requestedUserId, 'invites_sent', userId);
  // update
  await myMongoDBUserManager.push({user_id: requestedUserId}, userId, 'friends');
  await myMongoDBUserManager.push({ user_id: userId }, requestedUserId, 'friends');
  res.status(200).json({ message: 'Invitation accepted successfully' });
});

app.get('/users', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email
  let query = req.query;
  console.log('GET request at /users from user:', userId, 'with email:', email, 'query:', query);
  const users = await myMongoDBUserManager.find(query);

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  if(users.length > 0) {
    res.send(users);
  } else {
    res.status(404).json({ message: 'No users found' });
  }
  // res.send({...modelUser, email: email});
});

app.get('/nicknames', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email
  console.log('GET request at /nicknames from user:', userId, 'with email:', email, 'query:', req.query);
  let ret2 = [];
  let me = await myMongoDBUserManager.findOne({user_id: userId});
  let arr = [...me.invites_received, ...me.invites_sent, ...me.friends];
  for(const user_id of arr) {
    let user = await myMongoDBUserManager.findOne({user_id: user_id});
    ret2.push({ nickname: user.nickname, user_id: user_id });
  }
  let ret = ret2.filter((obj, index, arr) => {
    return ret2.findIndex(o =>{
        return JSON.stringify(o) === JSON.stringify(obj)}) === index
  }).sort((a, b) => a.nickname.localeCompare(b.nickname));
  res.send(ret);

});
app.put('/habbit_invite', checkJwt, async (req, res) => {
  console.log('PUT request at /habbit_invite with body:', req.body, "query:", req.query);
  const userId = req.auth.payload.sub
  const requestedUserId = req.query.friend_id;
  const habbit = req.body.habbit;
  await myMongoDBManager.push({ _id: habbit._id}, userId, 'user_ids');
  await myMongoDBManager.push({ _id: habbit._id }, requestedUserId, 'user_ids');
});

export default app;


/*
    GET /habbits
    PUT /habbit data: {habbit} "upsert the habbit to the given user"
    DELETE /habbit/:id

    GET /user

    Authorization: : Bearer token
      call Auth0 to get the user identity (email)

*/
