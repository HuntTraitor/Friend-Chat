import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {MemberCard}  from '../../src/views/Members/MemberCard'
import { LoginContext } from '@/context/Login';

const handlers = [
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
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const mockMember = {
  "id": "Member id",
  "name": "Test Member"
}

const badMember = {
  "id": "Bad ID",
  "name": "Bad Member"
}

const accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}

it('Renders appropriate member data', async() => {
  render(<MemberCard member={mockMember}/>)
  await screen.findByText("Test Member")
  await screen.findByLabelText("Member Avatar")
  await screen.findByLabelText("Add Member Icon")
})

it('Successfully sends a member friend request', async() => {
  let removed = false
  const members = [mockMember]
  const setMembers = () => {removed = true}

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <MemberCard member={mockMember}/>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Add Member Icon'))
  fireEvent.click(screen.getByText('Agree'))
  // await waitFor(() => {
  //   expect(removed).toBeTruthy()
  // })
})

it('Fails to send a member friend request', async() => {
  let removed = false
  const members = [badMember]
  const setMembers = () => {removed = true}

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <MemberCard member={badMember}/>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Add Member Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(removed).toBeFalsy()
  })
})

it('Catches error when server is down', async() => {
  server.close()
  let alerted = false
  window.alert = () => {alerted = true}
  let removed = false
  const members = [mockMember]
  const setMembers = () => {removed = true}

  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <MemberCard member={mockMember} members={members} setMembers={setMembers} />
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Add Member Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(removed).toBeFalsy()
    expect(alerted).toBeFalsy()
  })
})
