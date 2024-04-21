import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import { Login } from '../../src/views/Login';
import { LoginContext } from '@/context/Login';

const handlers = [
  graphql.query('login', ({ query, variables }) => {
    console.log(query)
    if (query.includes('anna@books.com')) {
      return HttpResponse.json({
        errors: [ {
            "message": "Some Error",
          },
        ]},
      )
    }
    return HttpResponse.json({
      data: {
        login: {
          "name": "Some Name",
          "accessToken": "Some JWT"
        },
      },
    })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('Renders login screen', async () => {
  render(<Login />)
  await screen.findByText('CSE187 Assignment 3');
  await screen.findByText('Sign In');
  await screen.findByText('Remember me');
});

it('Signs Molly In', async() => {
  render(<Login />)
  const email = screen.getByLabelText('Email Address')
  await userEvent.type(email, "molly@books.com")
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'mollymember')
  fireEvent.click(screen.getByText('Sign In'))
})

it('Alerts when Bad Credentials', async() => {
  let alerted = false
  window.alert = () => { alerted = true }
  render(<Login />)
  const email = screen.getByLabelText('Email Address')?.querySelector('input')
  if (email) {
    fireEvent.change(email, {target: {value: 'anna@books.com'}})
  }
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'badpassword')
  fireEvent.click(screen.getByText('Sign In'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})

it('Does not render when logged in', async() => {
  const accessToken = 'some old token'
  const setAccessToken = () => {}
  const userName = ''
  const setUserName = () => {}
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <Login />
    </LoginContext.Provider>
  )
  expect(screen.queryAllByText('Sign In').length).toBe(0)
})

it('Saves User when checking remember me', async() => {
  render(<Login />)
  const email = screen.getByLabelText('Email Address')?.querySelector('input')
  if (email) {
    fireEvent.change(email, {target: {value: 'molly@books.com'}})
  }
  const password = screen.getByLabelText('Password')?.querySelector('input')
  if (password) {
    fireEvent.change(password, {target: {value: 'mollymember'}})
  }
  fireEvent.click(screen.getByLabelText('Remember me checkbox'))
  fireEvent.click(screen.getByText('Sign In'))
  await waitFor(() => {
    expect(localStorage.getItem('accessToken')).toBe('Some JWT')
  })
})

it('Alerts When No Server', async() => {
  server.close()
  let alerted = false
  window.alert = () => {alerted = true}
  render (<Login />)
  const email = screen.getByLabelText('Email Address')
  await userEvent.type(email, "molly@books.com")
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'badpassword')
  fireEvent.click(screen.getByText('Sign In'))
  await waitFor(() => {
    expect(alerted).toBeTruthy()
  })
})