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
  const accessToken = await helpers.loginAs(
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

test('Hunter successfully sends a request to Meadow', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${meadowId}"}
    ) {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeRequest).toBeDefined()
      expect(res.body.data.makeRequest.id).toBe(meadowId)
      expect(res.body.data.makeRequest.name).toBe(helpers.meadow.name)
    })
})

test('Hunter sees this outbound request', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{request {inbound {id name}
      outbound {id name}}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.request).toBeDefined()
      expect(res.body.data.request.inbound).toBeDefined()
      expect(res.body.data.request.outbound).toBeDefined()
      expect(res.body.data.request.inbound.length).toBe(0)
      expect(res.body.data.request.outbound.length).toBe(1)
      expect(res.body.data.request.outbound[0].id).toBe(meadowId)
      expect(res.body.data.request.outbound[0].name).toBe(helpers.meadow.name)
    })
})

test('Meadow sees this inbound request', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.meadow
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{request {inbound {id name}
      outbound {id name}}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.request).toBeDefined()
      expect(res.body.data.request.inbound).toBeDefined()
      expect(res.body.data.request.outbound).toBeDefined()
      expect(res.body.data.request.inbound.length).toBe(1)
      expect(res.body.data.request.outbound.length).toBe(0)
      expect(res.body.data.request.inbound[0].id).toBe(hunterId)
      expect(res.body.data.request.inbound[0].name).toBe(helpers.hunter.name)
    })
})

test("Hunter tries to make a request to a member that doesn't exist", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  const randomId = randomUUID()

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
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

test("Hunter tries to make a request to Meadow again", async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.meadow
  )

  await helpers.acceptRequest(
    supertest(server),
    hunterId, accessToken
  )

  accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${meadowId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Member is already a Friend")
    })
})

test('Hunter tries to make a request to tanya twice', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await helpers.postRequest(
    supertest(server),
    tanyaId, accessToken
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${tanyaId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("A Request to Member has already been made")
    })
})

test('Hunter tries to send a request to himself', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${hunterId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Member has sent a Request to the logged in Member")
    })
})

test('Non authorized member tries to send a request', async() => {
  await supertest(server)
    .post('/api/graphql')
    .send({query: `mutation {makeRequest(
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

test('Non authorized member tries to get their requests', async() => {
  await supertest(server)
    .post('/api/graphql')
    .send({query: `{request {inbound {id name}
      outbound {id name}}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
    })
})

test("Tanya accepts hunters request", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest(
      input: {memberId: "${hunterId}"}
    ) {id name}}`})
    // .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.acceptRequest).toBeDefined()
      expect(res.body.data.acceptRequest.id).toBe(hunterId)
      expect(res.body.data.acceptRequest.name).toBe(helpers.hunter.name)
    })
})

test("Requests don't appear in hunter and tanya's box", async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{request {inbound {id name}
      outbound {id name}}}`})
    .expect(200)
    .then((res) => {
      expect(res.body.data.request.inbound.length).toBe(0)
      expect(res.body.data.request.outbound.length).toBe(0)
    })

    accessToken = await helpers.loginAs(
      supertest(server), helpers.tanya
    )

    await supertest(server)
      .post('/api/graphql')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({query: `{request {inbound {id name}
        outbound {id name}}}`})
      .expect(200)
      .then((res) => {
        expect(res.body.data.request.inbound.length).toBe(0)
        expect(res.body.data.request.outbound.length).toBe(0)
      })
})

test("Meadow tries to accept a request that doesnt exist", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.meadow
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest(
      input: {memberId: "${hunterId}"}
    ) {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Member did not send a Request")
    })
})

test('Meadow tries to accept a request from a member who doesnt exist', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.meadow
  )

  const randomId = randomUUID()

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest(
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

test('Anna tries to send a request', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
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

test('Anna tries to get her requests', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{request {inbound {id name}
      outbound {id name}}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
    })
})

test('Anna tries to accept a request', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest(
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

