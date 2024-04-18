import { LoginContext } from '@/context/Login'
import React from 'react'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import PostPage from './PostPage'

export function Home() {
  const loginContext = React.useContext(LoginContext)
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
        <PostPage />
        <BottomBar />
      </div>
    )
  } else {
    return null
  }
}