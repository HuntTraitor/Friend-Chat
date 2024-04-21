
import http from 'http'
import supertest from 'supertest';

import * as db from './db';
import requestHandler from './requestHandler'
import * as helpers from './helpers'
import { randomUUID } from 'crypto';

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

beforeAll( async () => {
  server = http.createServer(requestHandler);
  server.listen();
  return db.reset();
});

afterAll((done) => {
  db.shutdown(() => {
    server.close(done);
  });
});

let hunterId: string|undefined

test('Anna successfully creates Hunter', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.hunter.name}"
        email: "${helpers.hunter.email}"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeMember).toBeDefined()
      expect(res.body.data.makeMember.id).toBeDefined()
      expect(res.body.data.makeMember.name).toBe('Hunter Member')
      hunterId = res.body.data.makeMember.id
    })
})

test('Anna attempts to creates Hunter again', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.hunter.name}"
        email: "${helpers.hunter.email}"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body.errors).toBeDefined()
        expect(res.body.errors.length).toEqual(1)
        expect(res.body.errors[0].message).toBe(`Member with supplied email exists`)
      })
})

test('Anna tries to create Meadow with no name', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        email: "${helpers.hunter.email}"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe(`Field \"NewMember.name\" of required type \"String!\" was not provided.`)
    })
})

test('Anna tries to create Meadow with bad email', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.hunter.name}"
        email: "hunter_email_wow"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe(`Argument Validation Error`)
    })
})

test('Anna tries to create Meadow no auth', async() => {
  await supertest(server)
    .post('/api/graphql')
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.hunter.name}"
        email: "${helpers.hunter.email}"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe(`Access denied! You don't have permission for this action!`)
    })
})

test('Anna tries to create Meadow expired auth', async() => {
  const accessToken = randomUUID()
  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.hunter.name}"
        email: "${helpers.hunter.email}"
        password: "${helpers.hunter.password}"
      }) 
      { id name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe(`Access denied! You don't have permission for this action!`)
    })
})

test('Hunter tries to create a new member', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.meadow.name}"
        email: "${helpers.meadow.email}"
        password: "${helpers.meadow.password}"
      }) 
      { id name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe(`Access denied! You don't have permission for this action!`)
    })
})

let meadowId: string|undefined;
test('Anna successfully creates Meadow but only returns id', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${helpers.meadow.name}"
        email: "${helpers.meadow.email}"
        password: "${helpers.meadow.password}"
      }) 
      { id }}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeMember).toBeDefined()
      expect(res.body.data.makeMember.id).toBeDefined()
      expect(res.body.data.makeMember.name).not.toBeDefined()
      meadowId = res.body.data.makeMember.id
    })
})

test('Hunter gets all of the members', async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await helpers.postUser(
    supertest(server),
    helpers.tanya, accessToken
  )

  accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{member { id name }}`})
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.data.member).toBeDefined()
      expect(res.body.data.member.length).toEqual(2)
      expect(res.body.data.member[0].id).toBeDefined()
      expect(res.body.data.member[0].name).toBe("Meadow Member")
      expect(res.body.data.member[1].id).toBeDefined()
      expect(res.body.data.member[1].name).toBe("Tanya Member")
    })
})

test('Hunter gets all of the members without id', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{member { name }}`})
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.data.member).toBeDefined()
      expect(res.body.data.member.length).toEqual(2)
      expect(res.body.data.member[0].id).not.toBeDefined()
      expect(res.body.data.member[0].name).toBe("Meadow Member")
      expect(res.body.data.member[1].id).not.toBeDefined()
      expect(res.body.data.member[1].name).toBe("Tanya Member")
    })
})

test('Anna tries to get all of the members', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{member { name }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
    })
})

test('Hunter gets all of the non friend memebrs', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{ nonFriendMember {id name}}`})
    .expect(200)
    .then((res) => {
      console.log(res.body)
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.data.nonFriendMember.length).toEqual(2)
      expect(res.body.data.nonFriendMember[0].id).toBeDefined()
      expect(res.body.data.nonFriendMember[0].name).toBe("Meadow Member")
      expect(res.body.data.nonFriendMember[1].id).toBeDefined()
      expect(res.body.data.nonFriendMember[1].name).toBe("Tanya Member")
    })
})

test('Hunter becomes a friend and then gets all non friend members', async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await helpers.postRequest(
    supertest(server),
    meadowId, accessToken
  )

  accessToken = await helpers.loginAs(
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
    .send({query: `{nonFriendMember {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.data.nonFriendMember.length).toEqual(1)
      expect(res.body.data.nonFriendMember[0].id).toBeDefined()
      expect(res.body.data.nonFriendMember[0].name).toBe("Tanya Member")
    })
})

test('Anna tries to get all of the non friend members', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{nonFriendMember {id name}}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res).toBeDefined()
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Access denied! You don't have permission for this action!")
    })
})