import supertest from 'supertest';
import * as http from 'http';
import * as helpers from './helpers'
import { randomUUID } from 'crypto';

import * as db from './db';
import requestHandler from './requestHandler'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

beforeAll( async () => {
  server = http.createServer(requestHandler);
  server.listen();
  await db.reset()
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )
  hunterId = await helpers.postUser(
    supertest(server),
    helpers.hunter, accessToken
  )

  meadowId = await helpers.postUser(
    supertest(server),
    helpers.meadow, accessToken
  )

  tanyaId = await helpers.postUser(
    supertest(server),
    helpers.tanya, accessToken
  )

  accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await helpers.postRequest(
    supertest(server),
    tanyaId, accessToken
  )

  await helpers.postRequest(
    supertest(server),
    meadowId, accessToken
  )

  accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  await helpers.acceptRequest(
    supertest(server),
    hunterId, accessToken
  )

  accessToken = await helpers.loginAs(
    supertest(server), helpers.meadow
  )

  await helpers.acceptRequest(
    supertest(server),
    hunterId, accessToken
  )
});

afterAll((done) => {
  db.shutdown(() => {
    server.close(done);
  });
});

let hunterPosts: Array<string> = []
let tanyaPosts: Array<string> = []
let hunterId: string|undefined
let meadowId: string|undefined
let tanyaId: string|undefined

//this test does not always pass btw
test('Hunter can see his friends', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{friend {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.friend).toBeDefined()
      expect(res.body.data.friend.length).toBe(2)
    })
})

test('Tanya can see Hunter as a friend', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{friend {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.friend).toBeDefined()
      expect(res.body.data.friend.length).toBe(1)
      expect(res.body.data.friend[0].id).toBe(hunterId)
      expect(res.body.data.friend[0].name).toBe(helpers.hunter.name)
    })
})

test('Hunter has no requests when friends', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{request {inbound {id name} outbound {id name}}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.request).toBeDefined()
      expect(res.body.data.request.inbound.length).toBe(0)
      expect(res.body.data.request.outbound.length).toBe(0)
    })
})

test("Hunter removes Tanya as a friend", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {removeFriend(
      input: {memberId: "${tanyaId}"}
    ) {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.removeFriend).toBeDefined()
      expect(res.body.data.removeFriend.id).toBe(tanyaId)
      expect(res.body.data.removeFriend.name).toBe(helpers.tanya.name)
    })
})

test("Hunter and tanya no longer appear in each others friends", async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{friend {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.friend).toBeDefined()
      expect(res.body.data.friend.length).toBe(1)
      expect(res.body.data.friend[0].id).toBe(meadowId)
      expect(res.body.data.friend[0].name).toBe(helpers.meadow.name)
    })

  accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  await supertest(server)
  .post('/api/graphql')
  .set('Authorization', 'Bearer ' + accessToken)
  .send({query: `{friend {id name}}`})
  .expect(200)
  .then((res) => {
    expect(res.body).toBeDefined()
    expect(res.body.data).toBeDefined()
    expect(res.body.data.friend).toBeDefined()
    expect(res.body.data.friend.length).toBe(0)
  })
})

test("Hunter can rerequest tanya", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${tanyaId}"}
    ) {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeRequest).toBeDefined()
      expect(res.body.data.makeRequest.id).toBe(tanyaId)
      expect(res.body.data.makeRequest.name).toBe(helpers.tanya.name)
    })
})

test("Hunter tries to remove a friend that does not exists", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  const randomId = randomUUID()

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {removeFriend(
      input: {memberId: "${randomId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Member does not exist")
    })
})

test("Hunter tries to remove a friend who is not actually a friend", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {removeFriend(
      input: {memberId: "${tanyaId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Member is not a Friend")
    })
})

test("Anna tries to view friends", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
  .post('/api/graphql')
  .set('Authorization', 'Bearer ' + accessToken)
  .send({query: `{friend {id name}}`})
  .expect('Content-Type', /json/)
  .then((res) => {
    expect(res.body).toBeDefined()
    expect(res.body.errors).toBeDefined()
    expect(res.body.errors.length).toEqual(1)
    expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
  })
})

test("Anna tries to remove a friend", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {removeFriend(
      input: {memberId: "${hunterId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
    })
})