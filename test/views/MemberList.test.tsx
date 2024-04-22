import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {MemberList}  from '../../src/views/Members/MemberList'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';
import { OpenMembersContext } from '@/context/OpenMembers';
import { MembersProvider } from '@/context/Members';

let returnError = false

const handlers = [
  graphql.query('nonFriendMember', ({ query, variables }) => {
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
        nonFriendMember: members,
      },
    })
  }),
  graphql.mutation('makeRequest', ({ query, variables }) => {
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
beforeEach(() => returnError = false)
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const members = [
  {
    "id": "Member 1 ID",
    "name": "Member 1 Name",
  },
  {
    "id": "Member 2 ID",
    "name": "Member 2 Name",
  }
]

const accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}

it('Renders correct member list', async() => {
  const openMembers = true
  const setOpenMembers = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
        <MembersProvider>
          <MemberList />
        </MembersProvider>
      </OpenMembersContext.Provider>
    </LoginContext.Provider>
  )
  await screen.findByText('Add Friend')
  await screen.findByText('Member 1 Name')
  await screen.findByText('Member 2 Name')
})

it('Fails to render a member list', async() => {
  returnError = true
  const openMembers = true
  const setOpenMembers = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
        <MembersProvider>
          <MemberList />
        </MembersProvider>
      </OpenMembersContext.Provider>
    </LoginContext.Provider>
  )
  expect(screen.queryByText('Member 1 Name')).toBeNull()
  expect(screen.queryByText('Member 2 Name')).toBeNull()
})

it('Removes member from list on successful add', async() => {
  const openMembers = true
  const setOpenMembers = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
        <MembersProvider>
            <MemberList />
        </MembersProvider>
      </OpenMembersContext.Provider>
    </LoginContext.Provider>
  )

  await screen.findByText('Member 1 Name')
  const add = await screen.findAllByLabelText('Add Member Icon')
  fireEvent.click(add[0])
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(screen.queryByText('Member 1 Name')).toBeNull()
    expect(screen.queryByText('Member 2 Name')).toBeDefined()
  })
})

it('Goes back on the back button click', async() => {
  let openMembers = true
  const setOpenMembers = () => {openMembers = false}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
        <MembersProvider>
          <MemberList />
        </MembersProvider>
      </OpenMembersContext.Provider>
    </LoginContext.Provider>
  )

  await screen.findByText('Member 1 Name')
  fireEvent.click(screen.getByLabelText('member close'))
  await waitFor(() => {
    expect(openMembers).toBeFalsy()
  })
})

it('Alerts when server is down', async() => {
  server.close()
  const openMembers = true
  const setOpenMembers = () => {}
  let alerted = false
  window.alert = () => {alerted = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
        <MembersProvider>
          <MemberList />
        </MembersProvider>
      </OpenMembersContext.Provider>
    </LoginContext.Provider>
  )
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
  
})