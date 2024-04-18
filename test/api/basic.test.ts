/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#                   DO NOT MODIFY THIS FILE
#######################################################################
*/

import http from 'http'
import supertest from 'supertest';

import * as db from './db';
import requestHandler from './requestHandler'
import * as helpers from './helpers'

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

export interface Member {
  email: string;
  password: string;
  name: string;
}

const tommy = {
  email: "tommy@books.com",
  password: "tommytimekeeper",
  name: "Tommy Timekeeper",
};
let tommyId: string;
const tommyPosts: Array<string> = [];

const timmy = {
  email: "timmy@books.com",
  password: "timmyteaboy",
  name: "Timmy Teaboy",
};
let timmyId: string;
const timmyPosts: Array<string> = [];

const terry = {
  email: "terry@books.com",
  password: "terrytroublemaker",
  name: "Terry Troublemaker",
};

const post = {
  content: 'Some old guff',
  image:
    'https://communications.ucsc.edu/wp-content/uploads/2016/11/ucsc-seal.jpg',
};

test('Anna creates Tommy, Timmy, and Terry', async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), helpers.anna
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${tommy.name}"
        email: "${tommy.email}"
        password: "${tommy.password}"
      }) 
      { id name }}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeMember).toBeDefined()
      expect(res.body.data.makeMember.id).toBeDefined()
      expect(res.body.data.makeMember.name).toBe(tommy.name)
      tommyId = res.body.data.makeMember.id
    })

    await supertest(server)
      .post('/api/graphql')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({query: `mutation { makeMember(
        input: {
          name: "${timmy.name}"
          email: "${timmy.email}"
          password: "${timmy.password}"
        }) 
        { id name }}`})
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body.data).toBeDefined()
        expect(res.body.data.makeMember).toBeDefined()
        expect(res.body.data.makeMember.id).toBeDefined()
        expect(res.body.data.makeMember.name).toBe(timmy.name)
        timmyId = res.body.data.makeMember.id
      })

    await supertest(server)
      .post('/api/graphql')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({query: `mutation { makeMember(
        input: {
          name: "${terry.name}"
          email: "${terry.email}"
          password: "${terry.password}"
        }) 
        { id name }}`})
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined()
        expect(res.body.data).toBeDefined()
        expect(res.body.data.makeMember).toBeDefined()
        expect(res.body.data.makeMember.id).toBeDefined()
        expect(res.body.data.makeMember.name).toBe(terry.name)
      })
})

test("Tommy makes two posts", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), tommy
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${post.content}", image: "${post.image}"}
    ) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makePost).toBeDefined()
      expect(res.body.data.makePost.id).toBeDefined()
      expect(res.body.data.makePost.posted).toBeDefined()
      expect(res.body.data.makePost.content).toBe(post.content)
      expect(res.body.data.makePost.image).toBe(post.image)
      tommyPosts.push(res.body.data.makePost.id)
    })

    await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${post.content}", image: "${post.image}"}
    ) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      tommyPosts.push(res.body.data.makePost.id)
    })
})

test("Timmy cannot see Tommy's posts", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), timmy
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
      expect(res.body.data.post.length).toEqual(0)
    })
})

test("Tommy sends Timmy a friend request", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), tommy
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${timmyId}"}
    ) {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.makeRequest).toBeDefined()
      expect(res.body.data.makeRequest.id).toBe(timmyId)
      expect(res.body.data.makeRequest.name).toBe(timmy.name)
    })
})

test("Timmy accpets Tommy's friend request", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), timmy
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest (
      input: {memberId: "${tommyId}"}
    ) {id, name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.acceptRequest).toBeDefined()
      expect(res.body.data.acceptRequest.id).toBe(tommyId)
      expect(res.body.data.acceptRequest.name).toBe(tommy.name)
    })
})

test("Timmy can now see Tommy's posts", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), timmy
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
      expect(res.body.data.post.length).toEqual(2)
    })
})

test("Terry cannot see Tommy's posts", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), terry
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
      expect(res.body.data.post.length).toBe(0)
    })
})

test("Timmy makes a post", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), timmy
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${post.content}", image: "${post.image}"}
    ) {id posted content image}}`})
    .expect(200)
    .then((res) => {
      timmyPosts.push(res.body.data.makePost.id)
  })
})

test("Tommy can see Timmy's post and his own", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), tommy
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
      expect(res.body.data.post.length).toBe(3)
      expect(res.body.data.post[0].id).toBe(timmyPosts[0])
      expect(res.body.data.post[2].id).toBe(tommyPosts[0])
      expect(res.body.data.post[1].id).toBe(tommyPosts[1])
    })
})

test("Terry cannot see Timmy's posts and his own", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), terry
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
      expect(res.body.data.post.length).toBe(0)
    })
})

test("Tommy no longer wants Timmy as a friend", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), tommy
  )

  await supertest(server)
    .post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {removeFriend(
      input: {memberId: "${timmyId}"}
    ) {id name}}`})
    .expect(200)
    .then((res) => {
      expect(res.body).toBeDefined()
      expect(res.body.data).toBeDefined()
      expect(res.body.data.removeFriend).toBeDefined()
      expect(res.body.data.removeFriend.id).toBe(timmyId)
      expect(res.body.data.removeFriend.name).toBe(timmy.name)
    })
})

test("Timmy can now see his own post", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), timmy
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
      expect(res.body.data.post.length).toBe(1)
      expect(res.body.data.post[0].id).toBe(timmyPosts[0])
    })
})

test("Tommy can now only see his own posts", async() => {
  const accessToken = await helpers.loginAs(
    supertest(server), tommy
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
      expect(res.body.data.post.length).toBe(2)
      expect(res.body.data.post[0].id).toBe(tommyPosts[1])
      expect(res.body.data.post[1].id).toBe(tommyPosts[0])
    })
})