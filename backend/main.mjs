import express from 'express'
import modelHabbit from '../frontend/src/model/task.js'
import modelUser from '../frontend/src/model/user.js'
import cors from 'cors'

import { auth } from 'express-oauth2-jwt-bearer';

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.

// TODO: Move these two values into the .env file
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

const port = 3000

app.get('/habbits', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub

  /* Keep this for reference. The code uses the /userinfo endpoint of the Auth0 to get the user
   * info such as email. This is not needed right now, since the auth0 adds the email to the
   * JWT token issued when user authenticates at the frontend app.
   */
  /*
  const token = req.headers.authorization.split(' ')[1];
  console.log(req.auth.payload)

  const userinfo = req.auth.payload.aud[1]
  const response = await axios.get(userinfo, {
    headers: {
      Authorization: `Bearer ${token}`, // Pass the Bearer token
    },
  });
  console.log("userinfo response:", response);
  */

  console.log(`GET /habbits from user id: ${userId}`);

  let habbits = [];
  for (let i = 10; i < 20; i++) {
    habbits.push({ ...modelHabbit, _id: i });
  }

  res.send(habbits);
});

app.get('/user', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub
  const email = req.auth.payload.email;

  console.log(`GET request at /user from user ${userId} with email ${email}`);
  res.send(modelUser);
});

app.put('/habbit', checkJwt, (req, res) => {
  const userId = req.auth.payload.sub

  console.log(`PUT request from user ${userId} at /habbit with data:`, req.body);
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
