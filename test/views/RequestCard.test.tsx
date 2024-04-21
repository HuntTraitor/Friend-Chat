import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {RequestCard}  from '../../src/views/Friends/RequestCard'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';
import { RequestContext } from '@/context/Requests';

const handlers = [
  graphql.mutation('accpetRequest', ({ query, variables }) => {
    console.log(query)
    if (query.includes('Bad ID')) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        accpetRequest: {
          "id": "some id",
          "name": "some name",
        },
      },
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}

const mockRequest = {
  "id": "Friend id",
  "name": "Test Request"
}

const badRequest = {
  "id": "Bad ID",
  "name": "Bad Request"
}

it('Successfully displays inbound request card', async() => {
  render(<RequestCard friend={mockRequest} bound={"inbound"} />)
  await screen.findByText('Test Request')
  await screen.findByLabelText('Request Avatar')
  await screen.findByLabelText('Inbound Icon')
  await screen.findByLabelText('Remove Request Icon')
  expect(screen.queryByLabelText('Outbound Icon')).toBeNull()
})

it('Successfully displays outbound request card', async() => {
  render(<RequestCard friend={mockRequest} bound={"outbound"} />)
  await screen.findByText('Test Request')
  await screen.findByLabelText('Request Avatar')
  await screen.findByLabelText('Outbound Icon')
  await screen.findByLabelText('Remove Request Icon')
  expect(screen.queryByLabelText('Inbound Icon')).toBeNull()
})

const mockFriend = {
  "id": "Friend id",
  "name": "Friend Name"
}

it('Successfully accepts a friend', async() => {
  let sentFriends = false
  let sentRequests = false
  const setFriends = () => {sentFriends = true}
  const friends = [mockFriend]
  const requests = {
    inbound: [mockFriend],
    outbound: [],
  }
  const setRequests = () => {sentRequests = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <FriendsContext.Provider value={{friends, setFriends}}>
        <RequestContext.Provider value={{requests, setRequests}}>
          <RequestCard friend={mockRequest} bound={"inbound"} />
        </RequestContext.Provider>
      </FriendsContext.Provider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(sentFriends).toBeTruthy()
    expect(sentRequests).toBeTruthy()
  })
})

it('Fails to accept a friend', async() => {
  let sentFriends = false
  let sentRequests = false
  const setFriends = () => {sentFriends = true}
  const friends = [mockFriend]
  const requests = {
    inbound: [],
    outbound: [],
  }
  const setRequests = () => {sentRequests = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <FriendsContext.Provider value={{friends, setFriends}}>
        <RequestContext.Provider value={{requests, setRequests}}>
          <RequestCard friend={badRequest} bound={"inbound"} />
        </RequestContext.Provider>
      </FriendsContext.Provider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(sentFriends).toBeFalsy()
    expect(sentRequests).toBeFalsy()
  })
})

it('Alerts when unexpect error caught in request', async() => {
  server.close()
  let alerted = false
  window.alert = () => {alerted = true}
  const setFriends = () => {}
  const friends = [mockFriend]
  const requests = {
    inbound: [],
    outbound: [],
  }
  const setRequests = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <FriendsContext.Provider value={{friends, setFriends}}>
        <RequestContext.Provider value={{requests, setRequests}}>
          <RequestCard friend={mockRequest} bound={"inbound"} />
        </RequestContext.Provider>
      </FriendsContext.Provider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})