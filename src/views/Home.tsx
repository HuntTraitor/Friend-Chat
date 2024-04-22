import { LoginContext } from '@/context/Login'
import React from 'react'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import PostPage from './PostPage'
import { RefetchProvider } from '@/context/Refetch'
import { NavigationProvider } from '@/context/Navigation'

export function Home() {
  const loginContext = React.useContext(LoginContext)

  const [openFriends, setOpenFriends] = React.useState(false)

  React.useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      loginContext.setAccessToken(token)
    }
  })

  if (loginContext.accessToken.length > 0) {
    return (
      <div>
        <NavigationProvider>
          <Topbar />
            <RefetchProvider>
              <PostPage openFriends={openFriends} setOpenFriends={setOpenFriends}/>
            </RefetchProvider>
          <BottomBar setOpenFriends={setOpenFriends}/>
        </NavigationProvider>
      </div>
    )
  } else {
    return null
  }
}