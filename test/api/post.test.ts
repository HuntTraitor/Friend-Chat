import supertest from 'supertest';
import * as http from 'http';
import * as helpers from './helpers'

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
let tanyaId: string|undefined

test('Hunter successfully creates a post', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${helpers.mockPost.content}", image: "${helpers.mockPost.image}"}
    ) {id member{id name} posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      console.log(res.body)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makePost).toBeDefined()
      expect(res.body.data.makePost.id).toBeDefined()
      expect(res.body.data.makePost.posted).toBeDefined()
      expect(res.body.data.makePost.content).toBe(helpers.mockPost.content)
      expect(res.body.data.makePost.image).toBe(helpers.mockPost.image)
      expect(res.body.data.makePost.member).toBeDefined()
      expect(res.body.data.makePost.member.id).toBe(hunterId)
      expect(res.body.data.makePost.member.name).toBe(helpers.hunter.name)
      hunterPosts.push(res.body.data.makePost.id)
    })
})

test('Hunter can view his own posts', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1) {id member {id name} posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(1)
      expect(res.body.data.post[0].id).toBe(hunterPosts[0])
      expect(res.body.data.post[0].member).toBeDefined()
      expect(res.body.data.post[0].member.id).toBe(hunterId)
      expect(res.body.data.post[0].member.name).toBe(helpers.hunter.name)
    })
})

test('Tanya can view Hunters posts as a friend', async() => {
  //post a friend request to tanya
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await helpers.postRequest(
    supertest(server),
    tanyaId, accessToken
  )

  //accept friend request
  accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  await helpers.acceptRequest(
    supertest(server),
    hunterId, accessToken
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1) {id member{id name} posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(1)
      expect(res.body.data.post[0].id).toBe(hunterPosts[0])
    })
})

test('Hunter can view Tanyas posts as well', async() => {
  let accessToken = await helpers.loginAs(
    supertest(server), helpers.tanya
  )

  const postId = await helpers.postMessage(
    supertest(server),
    helpers.mockPost, accessToken
  )

  if (postId !== undefined) {
    tanyaPosts.push(postId)
  }

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(2)
      expect(res.body.data.post[1].id).toBe(hunterPosts[0])
      expect(res.body.data.post[0].id).toBe(tanyaPosts[0])
    })
  

})

test('There are no posts on page 2', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 2) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(0)
    })
})

test('Bad request on page 0', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 0) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Bad request on page -1', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 0) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Bad request on page 1.2', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 0) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Bad request on page -1.2', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 0) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Bad request on page string', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: one) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Int cannot represent non-integer value: one")
    })
})

test('Successfully gets page 2 default size', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  for (let i = 0; i < 19; i++) {
    const id = await helpers.postMessage(
      supertest(server),
      helpers.mockPost,
      accessToken
    )
    if (id !== undefined) {
      hunterPosts.push(id)
    }
  }

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 2) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(1)
      expect(res.body.data.post[0].id).toBe(hunterPosts[0])
    })
})

test('page 1 does not display the first post', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(20)
      for (const elem of res.body.data.post) {
        expect(elem.id).not.toBe(hunterPosts[0])
      }
    })
})

test('Setting size of 5 gets correct size', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: 5) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.post).toBeDefined()
      expect(res.body.data.post.length).toEqual(5)
      expect(res.body.data.post[0].id).toBe(hunterPosts[19])
      expect(res.body.data.post[1].id).toBe(hunterPosts[18])
      expect(res.body.data.post[2].id).toBe(hunterPosts[17])
      expect(res.body.data.post[3].id).toBe(hunterPosts[16])
      expect(res.body.data.post[4].id).toBe(hunterPosts[15])
    })
})

test('Setting size of -1 fails', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: -1) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Setting size of 0 fails', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: 0) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Argument Validation Error")
    })
})

test('Setting size of 1.2 fails', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: 1.2) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Int cannot represent non-integer value: 1.2")
    })
})

test('Setting size of -1.2 fails', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: -1.2) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Int cannot represent non-integer value: -1.2")
    })
})

test('Setting size of one fails', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `{post(page: 1, size: one) {id posted content image}}`})
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.errors).toBeDefined()
      expect(res.body.errors.length).toEqual(1)
      expect(res.body.errors[0].message).toBe("Int cannot represent non-integer value: one")
    })
})

test('Posting with no image still works', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.hunter
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${helpers.mockPost.content}"}
    ) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makePost).toBeDefined()
      expect(res.body.data.makePost.id).toBeDefined()
      expect(res.body.data.makePost.posted).toBeDefined()
      expect(res.body.data.makePost.content).toBe(helpers.mockPost.content)
      expect(res.body.data.makePost.image).toBeNull()
      hunterPosts.push(res.body.data.makePost.id)
    })
})
