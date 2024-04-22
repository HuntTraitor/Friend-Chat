import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {MemberList}  from '../../src/views/Members/MemberList'
import { LoginContext } from '@/context/Login';
import { FriendsContext, FriendsProvider } from '@/context/Friends';
import { RequestContext } from '@/context/Requests';
import { OpenFriendsContext, OpenFriendsProvider } from '@/context/OpenFriends';
import { FriendList } from '@/views/Friends/FriendList';
import { OpenMembersContext, OpenMembersProvider } from '@/context/OpenMembers';
import PostPage from '@/views/PostPage';

let returnError = false

const handlers = [
  graphql.query('post', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        post: posts,
      },
    })
  }),
  graphql.mutation('makePost', ({ query, variables }) => {
    console.log(query)
    if (returnError) {
      return HttpResponse.json({
        errors: [ {
            "message": "Access denied! You don't have permission for this action!",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        makePost: {
          id: 'Some Id',
          member: {
            id: 'Some member id',
            name: 'Some member name',
          },
          posted: new Date().toISOString(),
          content: 'Some content',
          image: 'Some image url',
        },
      },
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
beforeEach(() => {
  returnError = false
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const posts = [
  {
    id: "Post 1 Id",
    member: {
      id: "Member 1 Id",
      name: "Member 1 Name"
    },
    posted: new Date().toISOString(),
    content: "Post 1 content",
    image: "https://post1.com"
  },
  {
    id: "Post 2 Id",
    member: {
      id: "Member 2 Id",
      name: "Member 2 Name"
    },
    posted: new Date().toISOString(),
    content: "Post 2 content",
    image: "https://post2.com"
  },
  {
    id: "Post `3 Id",
    member: {
      id: "Member 3 Id",
      name: "Member 3 Name"
    },
    posted: new Date().toISOString(),
    content: "Post 3 content",
    image: "https://post3.com"
  },
]


const accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}


it('Renders Post page correclty', async() => {
  //from https://stackoverflow.com/questions/53271193/typeerror-scrollintoview-is-not-a-function
  window.HTMLElement.prototype.scrollIntoView = function() {};

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <PostPage />
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(screen.getByText('Post 1 content')).toBeDefined()
    expect(screen.getByText('Post 2 content')).toBeDefined()
    expect(screen.getByText('Post 3 content')).toBeDefined()
  })
})

it('Creates a new post', async() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <PostPage />
    </LoginContext.Provider>
  )

  const input = screen.getByLabelText('message input')
  await userEvent.type(input, "Some content")
  fireEvent.click(screen.getByLabelText('send post'))
  await waitFor(() => {
    screen.getByText('Some content')
  })
})

it('Errors when request fails', async() => {
  returnError = true
  window.HTMLElement.prototype.scrollIntoView = function() {};

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <PostPage />
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(screen.queryByText('Post 1 content')).toBeNull()
  })
})

it('Errors when sending a post', async() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <PostPage />
    </LoginContext.Provider>
  )

  returnError = true
  const input = screen.getByLabelText('message input')
  await userEvent.type(input, "Some content")
  fireEvent.click(screen.getByLabelText('send post'))
  await waitFor(() => {
    expect(screen.queryByText('Some content')).toBeNull()
  })
})

it('Alerts on server down', async() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
  let alerted = false
  window.alert = () => {alerted = true}
  server.close()

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <PostPage />
    </LoginContext.Provider>
  )

  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })

})