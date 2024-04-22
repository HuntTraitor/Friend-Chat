import { LoginContext } from '@/context/Login'
import React from 'react'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import PostPage from './PostPage'
import { RefetchProvider } from '@/context/Refetch'

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
        <Topbar />
          <RefetchProvider>
            <PostPage openFriends={openFriends} setOpenFriends={setOpenFriends}/>
          </RefetchProvider>
        <BottomBar setOpenFriends={setOpenFriends}/>
      </div>
    )
  } else {
    return null
  }
}