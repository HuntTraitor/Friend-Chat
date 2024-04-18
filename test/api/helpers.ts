export interface Member {
  email: string;
  password: string;
  name: string;
}

export interface PostNew {
  content: string,
  image: string
}

export const molly = {
  name: 'Molly Member',
  email: 'molly@books.com',
  password: 'mollymember'
}

export const anna = {
  name: 'Anna Admin',
  email: 'anna@books.com',
  password: 'annaadmin'
}

export const hunter = {
  name: 'Hunter Member',
  email: 'hunter@books.com',
  password: 'huntermember'
}

export const meadow = {
  name: 'Meadow Member',
  email: 'meadow@books.com',
  password: 'meadowmember'
}

export const tanya = {
  name: 'Tanya Member',
  email: 'tanya@books.com',
  password: 'tanyamember'
}

export const mockPost = {
  content: "This is some test content",
  image: "http://www.image.com"
}

export async function loginAs(request: any, member: Member): Promise<string | undefined> {
  let accessToken;
  await request.post('/api/graphql')
    .send({query: `{login(email: "${member.email}" password:
      "${member.password}") {accessToken}}`})
    .expect(200)
    .then((res: any) => {
      accessToken = res.body.data.login.accessToken;
    });
  return accessToken
}

export async function postUser(request: any, member: Member, accessToken: string|undefined): Promise<string|undefined> {
  let userId;
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makeMember(
      input: {
        name: "${member.name}"
        email: "${member.email}"
        password: "${member.password}"
      }) 
      { id name }}`})
    .expect(200)
    .then((res: any) => {
      userId = res.body.data.makeMember.id
    })
    return userId
}

export async function postMessage(request: any, post: PostNew, accessToken: string|undefined): Promise<string|undefined>{
  let postId;
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation { makePost(
      input: {content: "${post.content}", image: "${post.image}"}
    ) {id posted content image}}`})
    .expect(200)
    .then((res: any) => {
      postId = res.body.data.makePost.id
    })
  return postId
}

export async function postRequest(request: any, memberId: string|undefined, accessToken: string|undefined) {
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {makeRequest(
      input: {memberId: "${memberId}"}
    ) {id name}}`})
    .expect(200)
}

export async function acceptRequest(request: any, memberId: string|undefined, accessToken: string|undefined) {
  await request.post('/api/graphql')
    .set('Authorization', 'Bearer ' + accessToken)
    .send({query: `mutation {acceptRequest(
      input: {memberId: "${memberId}"}
    ) {id name}}`})
    .expect(200)
}