import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import useHabbitHandlers from './habbitHandlers.mjs';
import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';
import useUserHandlers from './userHandlers.mjs';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({path:`${__dirname}/.env`});
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  authRequired: false,
});

const testCheckJwt = async (req, res, next) => {

  // Check if the request has a valid JWT token
  if(req.auth?.payload?.sub) {
    console.log("Testing mode: using real authentication with userId:", req.auth.payload.sub);
    return next();
  }

  const userId = req.headers.testuserid || 'auth0|1234567890';
  console.log("Testing mode: using mocked authentication with userId:", userId);
  req.auth = {
    payload: {
      sub: `${userId}`,
      email: `${userId}@example.com`
    }
  };

  next();
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
app.use(checkJwt)

if (process.env.MODE=='testing') {
  console.log('Testing mode: using mocked authentication');
  app.use(testCheckJwt);
}

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

useUserHandlers(app, myMongoDBUserManager);
useHabbitHandlers(app, myMongoDBManager);

export default app;
