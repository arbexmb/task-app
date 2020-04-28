const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'John Smith',
      email: 'john@example.com',
      password: 'MyPass33!'
    })
    .expect(201)

  const user = await User.findById(response.body._id)
  expect(user).not.toBeNull()
  expect(response.body).toMatchObject({
    name: 'John Smith',
    email: 'john@example.com',
  })
  expect(user.password).not.toBe('MyPass33!')
})

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200)

  // const user = await User.findById(userOneId)
  // expect(response.body.token).toBe(userOne.tokens[0].token)
})

test('Should not login nonexisting users', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'empty@user.com',
      password: 'FalsePass'
    })
    .expect(400)
})

test('Should get profile info for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile info for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should delete account for unauthorized user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/sp.jpg')
    .expect(200)
  
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Michael Smith'
    })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Michael Smith')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Anything'
    })
    .expect(400)

  const user = User.findById(userOneId)
  expect(user.location).toBeUndefined()
})
