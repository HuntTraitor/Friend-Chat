import { LoginContext } from '@/context/Login'
import React from 'react'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import PostPage from './PostPage'
import { NavigationContext, NavigationProvider } from '../context/Navigation'
import { FriendList } from "./Friends/FriendList"

export function Home() {
  const loginContext = React.useContext(LoginContext)
  const  {navigation} = React.useContext(NavigationContext)
  const [error, setError] = React.useState('Logged out')

  const logout = () => {
    loginContext.setAccessToken('')
    setError('Logged out')
  }


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
          {navigation === 0 && <PostPage />}
          {navigation === 1 && <FriendList />}
        <BottomBar />
      </div>
    )
  } else {
    return null
  }
}