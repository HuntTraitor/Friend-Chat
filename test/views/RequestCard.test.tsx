import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {RequestCard}  from '../../src/views/Friends/RequestCard'
import { LoginContext } from '@/context/Login';
import { RefetchProvider } from '@/context/Refetch';

let returnError = false
const handlers = [
  graphql.mutation('accpetRequest', ({ query, variables }) => {
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
beforeEach(() => returnError = false)
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

it('Successfully accepts a friend', async() => {
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
          <RequestCard friend={mockRequest} bound={"inbound"} />
        </RefetchProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
})

it('Fails to accept a friend', async() => {
  returnError = true
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <RequestCard friend={mockRequest} bound={"inbound"} />
      </RefetchProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
})

it('Alerts when unexpect error caught in request', async() => {
  server.close()
  let alerted = false
  window.alert = () => {alerted = true}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <RefetchProvider>
        <RequestCard friend={mockRequest} bound={"inbound"} />
      </RefetchProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Inbound Icon'))
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})