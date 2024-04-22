import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import { LoginContext } from '@/context/Login';
import BottomBar from '@/views/BottomBar';
import { NavigationProvider } from '@/context/Navigation';

let accessToken = 'some old token'
const setAccessToken = () => {accessToken = ''}
const userName = ''
const setUserName = () => {}
let openFriends = false
const setOpenFriends = () => {openFriends = true}

it('Renders successfully',  async() => {
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <NavigationProvider>
        <BottomBar openFriends={openFriends} setOpenFriends={setOpenFriends}/>
      </NavigationProvider>
    </LoginContext.Provider>
  )
  screen.getByLabelText('Home')
  screen.getByLabelText('Friends')
  screen.getByLabelText('Logout')
})

it('Clicks friends tab', async() => {
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <NavigationProvider>
        <BottomBar openFriends={openFriends} setOpenFriends={setOpenFriends}/>
      </NavigationProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Friends'))
  await waitFor(() => {
    expect(openFriends).toBeTruthy()
  })
})

it('Clicks Logout', async() => {
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <NavigationProvider>
        <BottomBar openFriends={openFriends} setOpenFriends={setOpenFriends}/>
      </NavigationProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Logout'))
  await waitFor(() => {
    expect(accessToken).toBe('')
  })
})

it('Clicks back to home', async() => {
  render(
    <LoginContext.Provider value={{userName, setUserName, accessToken, setAccessToken}}>
      <NavigationProvider>
        <BottomBar openFriends={openFriends} setOpenFriends={setOpenFriends}/>
      </NavigationProvider>
    </LoginContext.Provider>
  )

  fireEvent.click(screen.getByLabelText('Friends'))
  await waitFor(() => {
    expect(openFriends).toBeTruthy()
  })
  fireEvent.click(screen.getByLabelText('Home'))
})