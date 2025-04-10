import { defineConfig } from "cypress";

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({path:`${__dirname}/.env.cypress`});

// Populate process.env with values from .env file
dotenv.config()

console.log('login:', process.env.AUTH0_USERNAME)
console.log('auth0_domain:', process.env.REACT_APP_AUTH0_DOMAIN)

export default defineConfig({
  projectId: 'r9f29h',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      auth0_username: process.env.AUTH0_USERNAME,
      auth0_password: process.env.AUTH0_PASSWORD,
      auth0_domain: process.env.REACT_APP_AUTH0_DOMAIN,
      auth0_audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      auth0_scope: process.env.REACT_APP_AUTH0_SCOPE,
      auth0_client_id: process.env.REACT_APP_AUTH0_CLIENTID,
      // auth0_client_secret: process.env.AUTH0_CLIENT_SECRET,
    },
  },
});
