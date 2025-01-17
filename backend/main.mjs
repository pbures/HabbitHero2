import express from 'express'
import modelHabbit from '../frontend/src/model/task.js'
import modelUser from '../frontend/src/model/user.js'
import cors from 'cors'
import MongoDBManager from './mongoDBManager.mjs'
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';

dotenv.config();
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

console.log(process.env.AUTH0_AUDIENCE);

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

const port = 3000

const myMongoDBManager = new MongoDBManager();
myMongoDBManager.connect();

app.get('/habbits', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub

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
  const habbits = await myMongoDBManager.find();
  console.log(habbits);

  res.status(200).json(habbits);
});

app.get('/user', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email;

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  res.send({...modelUser, email: email});
});

app.put('/habbit', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub
  console.log(`PUT request from user ${userId} at /habbit with data:`, req.body, '_id:', req.body._id);
  // console.log(req.body);
  // console.log(req.body._id);
  
  let habbit = (await myMongoDBManager.find({_id: req.body._id}))[0];
  console.log('Habbitttt', habbit);
  // console.log(habbit)
  if(habbit) {
    console.log("Habbit exists", habbit);
    const changes = {};
    for (const key in req.body) {
      if (req.body[key] !== habbit[key]) {
        console.log(`Key: ${key}, old value: ${habbit[key]}, new value: ${req.body[key]}`);
      changes[key] = req.body[key];
      }
    }
    console.log("Changes:", changes);
    myMongoDBManager.update({_id: habbit._id}, changes);
  } else {
    console.log('habbits does not exist');
    // console.log(habbit);
    // Does not exist, so we insert a new one
    myMongoDBManager.insert(req.body);
  }

  // console.log(`PUT request from user ${userId} at /habbit with data:`, req.body);
  res.status(200).json({ message: 'Habbit updated successfully' });
});

app.delete('/habbit', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub;

  console.log(`DELETE request from user: ${userId} at /habbit, id:` + req.query.id);
  res.status(200).json({ message: 'Habbit deleted successfully' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

/*
    GET /habbits
    PUT /habbit data: {habbit} "upsert the habbit to the given user"
    DELETE /habbit/:id

    GET /user

    Authorization: : Bearer token
      call Auth0 to get the user identity (email)

*/
