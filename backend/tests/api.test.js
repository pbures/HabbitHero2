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

  testJWT = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijh3Mk5EeHdOQ2JEcldwZldhU3M0UyJ9.eyJpc3MiOiJodHRwczovL2Rldi1tcXMweTdza3ViajBuOGlmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtckBjbGllbnRzIiwiYXVkIjoiaDJiZSIsImlhdCI6MTczOTgyMDg4NCwiZXhwIjoxNzM5OTA3Mjg0LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJKaDhRRkxOWnp6R3BqbGh3anlEMHRXZHZwdlFrSkJtciJ9.XrZtbjgSHxfM3v4Aw50NjFE-tJvUGWOZHSx_DIxhPBK4MeACqtm8hRM-L5zooa013pSAsS3KEp9ZEwRqpAiSteBlhD4GlC8hSj-M-eTelq6FFnGW0IXrmiKk3IIZAki0ZDRjF6MtEWJtk0QP1m762F7VTtOb44SpyHJOgpwiDkIgmRlQ-pH2Re9giuiyoOWslbaahFGeBfdlIQpB3RSq4A8-FRMJrFMJSSoIb_6tIO5-ZJlkJXx-Mgb4IpniqgHVRTTUjsS0cQLrEGt_xoHQ-GLP7nAUFjejbMqgRp5QVEPuF5OT2Bby_Kh1n23bhLyOgPQhI93eFp6TYmVHprIxEg"
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

    expect(response.body).toHaveProperty('_id');
  })

  it('should return users on GET /users', async () => {

    const response = await request(server)
    .get('/users')
    .set('Authorization', `Bearer ${testJWT}`)
    .query({query: 'John Doe'})
    .expect(200)

    expect(response.body).toBeDefined();
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

  it('should invite user on PUT /habbit', async () => {
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

    // console.log(response2.body[0]._id)
    const response3 = await request(server)
      .delete('/habbit')
      .set('Authorization',  `Bearer ${testJWT}`) // Replace with a valid test JWT
      .send(habitData)
      .query({habbitId: response2.body[0]._id})
      .expect(200)

    // Add your assertions here based on the expected response
  })
})
