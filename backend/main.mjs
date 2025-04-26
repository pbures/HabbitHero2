import createApp from './app.mjs';
import MongoDBManager from './mongoDBManager.mjs';
import MongoDBUserManager from './mongoDBUserManager.mjs';

import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({path:`${__dirname}/.env`});

const port = 3000
const myMongoDBManager = new MongoDBManager(process.env.MONGODB_URI, process.env.DB_NAME, process.env.COLLECTION_NAME);
const myMongoDBUserManager = new MongoDBUserManager(process.env.MONGODB_URI, process.env.DB_NAME, process.env.COLLECTION_NAME);
const app = createApp(myMongoDBManager, myMongoDBUserManager);

const server = createServer(app)
server.listen(port)
server.on('listening', () => {
  console.log('Server is listening on port ', port);
});
