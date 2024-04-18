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

const anna = {
  email: 'anna@books.com',
  password: 'annaadmin',
};

it('Logs Anna in', async () => {
  const member = anna;
  await supertest(server).post('/api/graphql')
    .send({query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`})
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.data.login.name).toEqual('Anna Admin')
      expect(res.body.data.login.accessToken).toBeDefined()
    });
});

const bad = {
  email: 'anna_at_books',
  password: 'annaadmin',
};

const wrong = {
  email: 'anna@books.com',
  password: 'notmollyspasswd',
};

test('OK', async () => {
  const member = helpers.anna;
  await supertest(server)
    .post('/api/graphql')
    .send({query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`})
    .expect(200)
    .then((res) => {
      expect(res).toBeDefined();
      expect(res.body).toBeDefined();
      expect(res.body.data.login.name).toEqual('Anna Admin');
      expect(res.body.data.login.accessToken).toBeDefined();
    });
});

test('Wrong Credentials', async () => {
  const member = wrong;
  await supertest(server)
    .post('/api/graphql')
    .send({query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body.errors.length).toEqual(1);
      expect(res.body.errors[0].message).toBe('Unauthorised')
    });
});

test('Bad Format', async () => {
  const member = bad;
  await supertest(server)
    .post('/api/graphql')
    .send({query: `{login(email: "${member.email}" password: 
      "${member.password}") { name, accessToken }}`})
    .expect('Content-Type', /json/)
    .then((res) => {
      expect(res.body.errors.length).toEqual(1);
      expect(res.body.errors[0].message).toBe('Argument Validation Error')
    });
});