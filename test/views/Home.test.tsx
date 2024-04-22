import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import { LoginContext } from '@/context/Login';
import BottomBar from '@/views/BottomBar';
import { Home } from '@/views/Home';

let accessToken = 'some old token'
const setAccessToken = () => {}
const userName = ''
const setUserName = () => {}

it('Renders successfully', async() => {
  window.HTMLElement.prototype.scrollIntoView = function() {};
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <Home />
    </LoginContext.Provider>
  )
  screen.getByText('Posts')
})

it('Renders with a token', async() => {
  localStorage.setItem('accessToken', "some Token")
  render(    
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <Home />
    </LoginContext.Provider>
  )
  screen.getByText('Posts')
})

it('Does not render without being logged in', async() => {
  render(<Home />)
  expect(screen.queryByText('Posts')).toBeNull()
})