import cors from 'cors';
import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import useHabbitHandlers from './habbitHandlers.mjs';
import useUserHandlers from './userHandlers.mjs';

function createApp(habbitDbManager, userDbManager) {
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

  let origin = process.env.CORS_ORIGIN_ALLOW || 'http://localhost:5173';
  console.log('Audience: ', process.env.AUTH0_AUDIENCE);
  console.log('Origin: ', origin);

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

  // try {
  //   await habbitDbManager.connect();
  //   console.log('Connected to the database');
  // } catch (error) {
  //   console.error('Error connecting to the database:', error);
  //   process.exit(1);
  // }

  useUserHandlers(app, userDbManager);
  useHabbitHandlers(app, habbitDbManager);

  return app;
}

export default createApp;
