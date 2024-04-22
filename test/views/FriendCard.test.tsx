import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  FriendCard  from '../../src/views/Friends/FriendCard'
import { LoginContext } from '@/context/Login';
import { RefetchProvider } from '@/context/Refetch';

const handlers = [
  graphql.mutation('removeFriend', ({ query, variables }) => {
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
        removeFriend: {
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

const mockFriend = {
  "id": "Friends id",
  "name": "Test Friend"
}

it('Renders appropriate card data', async() => {
  render(<FriendCard friend={mockFriend} />)
  await screen.findByText('Test Friend');
  await screen.findByLabelText('Remove Friend Icon');
  await screen.findByLabelText('Profile Avatar')
})

it('Successfully removes a friend', async() => {
  let friendRemoved = false
  const accessToken = 'some old token'
  const setAccessToken = () => {}
  const userName = ''
  const setUserName = () => {}
  const friends = [mockFriend]
  const setFriends = () => {friendRemoved = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <FriendCard friend={mockFriend} />
      </RefetchProvider>
    </LoginContext.Provider>
  )

  const friend = await screen.findByLabelText('Remove Friend Icon');
  fireEvent.click(friend)
  await waitFor(() => {
    fireEvent.click(screen.getByText('Agree'))
  })
  // await waitFor(() => {
  //   expect(friendRemoved).toBeTruthy()
  // })
})

const badFriend = {
  "id": "Bad ID",
  "name": "Test Friend"
}

it('Fails to remove a friend', async() => {
  let friendRemoved = false
  const accessToken = 'some old token'
  const setAccessToken = () => {}
  const userName = ''
  const setUserName = () => {}
  const friends = [badFriend]
  const setFriends = () => {friendRemoved = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <FriendCard friend={badFriend} />
      </RefetchProvider>
    </LoginContext.Provider>
  )

  const friend = await screen.findByLabelText('Remove Friend Icon');
  fireEvent.click(friend)
  await waitFor(() => {
    fireEvent.click(screen.getByText('Agree'))
  })
  await waitFor(() => {
    expect(friendRemoved).toBeFalsy()
  })
})

it('Tries to remove a friend when the server is down', async() => {
  server.close()
  let alerted = false
  window.alert = () => {alerted = true}
  const accessToken = 'some old token'
  const setAccessToken = () => {}
  const userName = ''
  const setUserName = () => {}
  const friends = [mockFriend]
  const setFriends = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <FriendCard friend={badFriend} />
      </RefetchProvider>
    </LoginContext.Provider>
  )
  const friend = await screen.findByLabelText('Remove Friend Icon');
  fireEvent.click(friend)
  await waitFor(() => {
    fireEvent.click(screen.getByText('Agree'))
  })
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})