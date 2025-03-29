import express from 'express';
// import modelHabbit from '../frontend/src/model/task.js'
// import modelUser from '../frontend/src/model/user.js'
import cors from 'cors';
import dotenv from 'dotenv';
import { auth } from 'express-oauth2-jwt-bearer';
import { ObjectId } from 'mongodb';
import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';
import useUserHandlers from './userHandlers.mjs';

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

useUserHandlers(app, checkJwt, myMongoDBUserManager);

app.get('/habbits', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  console.log(`userId: ${userId}`);
  console.log(`GET request at /habbits from user id: ${userId}`);
  const habbits = await myMongoDBManager.find({ user_ids: { $in: [userId] } });
  res.status(200).json(habbits);
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
