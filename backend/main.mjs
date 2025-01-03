import express from 'express';
import modelHabbit from '../src/model/habbit.js'
import modelUser from '../src/model/user.js'
import cors from 'cors'

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

const port = 3000

app.get('/habbits', (req, res) => {
  let habbits = [];
  for(let i = 10; i < 20; i++) {
    habbits.push({...modelHabbit, _id: i});
  }
  console.log('got a GET request at /habbits');
  res.send(habbits);
});

app.get('/user', (req, res) => {
  console.log('got a GET request at /user');
  res.send(modelUser);
});

app.put('/habbit', (req, res) => {
  console.log(req)
  res.send('Got a PUT request at /habbit with data: ' + req.body);
});

app.delete('/habbit', (req, res) => {
  console.log(req.query.id)
  res.send('Got a DELETE request at /habbit, id:' + req.query.id);
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