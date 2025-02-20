import express from 'express'
// import modelHabbit from '../frontend/src/model/task.js'
// import modelUser from '../frontend/src/model/user.js'
import cors from 'cors'
import MongoDBManager from './mongoDBManager.mjs'
import MongoDBUserManager from './mongoDBUserManager.mjs'
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb'

import { fileURLToPath } from 'url'
import path from 'path'

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
    req.auth = {
      payload: {
        sub: 'auth0|1234567890',
        email: 'mockuser@example.com'
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

app.get('/user', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  const user = myMongoDBUserManager.find({
    $or: [
      { user_id: userId },
      { email: req.auth.payload.email }
    ]
  });
  res.send(user);
  // res.send({...modelUser, email: email});
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

app.put('/user', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  let object = req.body;
  object.user_id = userId;
  myMongoDBUserManager.insert(object);
});

app.put('/invite', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  let object = req.body;
  object.user_id = userId;
  let me = await myMongoDBUserManager.findOne({ user_id: userId });
  let invitesBefore = await myMongoDBUserManager.find({ nickname: req.query.nickname }).invites_recieved;
  myMongoDBUserManager.update({ nickname: req.query.nickname }, { invites: [...invites, me] });
});

app.get('/users', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email
  let query = { name: req.query.query};
  console.log('GET request at /users from user:', userId, 'with email:', email, 'query:', query);
  const users = await myMongoDBUserManager.find(query);

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  res.send(users);
  // res.send({...modelUser, email: email});
});

app.delete('/habbit', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub;

  console.log(`DELETE request from user: ${userId} at /habbit, id:` + req.query.habbitId);
  myMongoDBManager.delete({ _id: new ObjectId(req.query.habbitId) });
  res.status(200).json({ message: 'Habbit deleted successfully' });
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
