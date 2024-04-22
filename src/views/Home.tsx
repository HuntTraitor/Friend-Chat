import { LoginContext } from '@/context/Login'
import React from 'react'
import BottomBar from './BottomBar'
import Topbar from './Topbar'
import PostPage from './PostPage'
import { NavigationContext, NavigationProvider } from '../context/Navigation'
import { FriendList } from "./Friends/FriendList"
import { OpenFriendsContext, OpenFriendsProvider } from '@/context/OpenFriends'
import { FriendsProvider } from '@/context/Friends'
import { RequestProvider } from '@/context/Requests'
import { OpenMembersProvider } from '@/context/OpenMembers'
import { MemberList } from './Members/MemberList'

export function Home() {
  const loginContext = React.useContext(LoginContext)
  React.useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      loginContext.setAccessToken(token)
    }
  })

  if (loginContext.accessToken.length > 0) {
    return (
      <div>
        <OpenFriendsProvider>
          <OpenMembersProvider>
            <Topbar />
              <PostPage />
            <BottomBar />
          </OpenMembersProvider>
        </OpenFriendsProvider>
      </div>
    )
  } else {
    return null
  }
}