// tests/api.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import app from '../app.mjs' // Adjust the path to your main.mjs file

let server
let testJWT

beforeAll((done) => {
  server = createServer(app)
  server.listen(3000, done)

  // testJWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijh3Mk5EeHdOQ2JEcldwZldhU3M0UyJ9.eyJpc3MiOiJodHRwczovL2Rldi1tcXMweTdza3ViajBuOGlmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtckBjbGllbnRzIiwiYXVkIjoiaDJiZSIsImlhdCI6MTczNzIzNzc2NCwiZXhwIjoxNzM3MzI0MTY0LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtciJ9.gum16vrqSb2pMCtDvWi--dGkcYXvQLxffS9RDIYbm-pzK8tCZ4x86AVK50R3LmmmYFP0gnisLebaRyrQtRm0txDLHh6hcU1DJo0zy7Cm7i54Z9lbRjOG6fD0IBN-ETBoLWiGIYa1B78g1xizW-NHSXA9OOSeWhhKmpIS5d4z5x8ywc8_JDACECPcQaO_mP4EiEE8wOKRFKOML6fwzZdEg_R-48OIZz-BSLYtn_M7qQwAn_GUgmUjSURbn471pr_uAUeXyGDgjeiTXHzgypI5xypkaeeWfj7HVW3buIvDf5DTACnQVBL839nmb_q6PyPu0eb_xdYI5NM0Rxa__nc0Qw"
  testJWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijh3Mk5EeHdOQ2JEcldwZldhU3M0UyJ9.eyJpc3MiOiJodHRwczovL2Rldi1tcXMweTdza3ViajBuOGlmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtckBjbGllbnRzIiwiYXVkIjoiaDJiZSIsImlhdCI6MTczNzgyMTQ3NSwiZXhwIjoxNzM3OTA3ODc1LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtciJ9.MK-pr6UIO2z8hvYUbBOo8IkaLG5P2i5V2w-INXylyyS7766hZXkCQqr2idGw_ZsO0Z7X79Ovjq78V6MhESBqtgx_5sHa67q7YRUJQ4kAPpQe3l6YJOLpGzBh8GzxmjzBE8WyYDPJTDKvyyJg65iZxykKYzupVSBTJwTin2tZOcopzdRHuJ_SGvlkIgHwK2OyuFqP09ygOvEV9TXgOy9A0VFvbiuFTAfcbVV4Qa0VOldM7j5N0TD1X4JIvzPrcIdZWk4xCecWVHxrMqzX3cZbyhhu0aC4SIBIOF9kCVwgrs-NfAeOLcA0Lkeulqjteh81CZos49hcaqLNkYytqv0EzA"
})

afterAll((done) => {
  server.close(done)
})

describe('API Tests', () => {
  it('should return user data on GET /user', async () => {

    const response = await request(server)
    .get('/user')
    .set('Authorization', `Bearer ${testJWT}`)
    .expect(200)

    expect(response.body).toHaveProperty('user')
  })

  it('should update habit on PUT /habbit', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const response = await request(server)
      .put('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habitData)
      .expect(200)

    // Add your assertions here based on the expected response
    expect(response.body).toHaveProperty('message', 'Habbit updated successfully')
  })

  it('should delete a habbit', async () => {
    const habitData = {
      name: 'Test Habit',
      description: 'This is a test habit'
    }

    const response = await request(server)
    .put('/habbit')
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .send(habitData)
    .expect(200)

    const response2 = await request(server)
    .get('/habbits')
    .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
    .send(habitData)
    .expect(200)

    console.log(response2.body[0]._id)
    const response3 = await request(server)
      .delete('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habitData)
      .query({habbitId: response2.body[0]._id})
      .expect(200)

    // Add your assertions here based on the expected response
  })
})
