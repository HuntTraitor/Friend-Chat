import { PropsWithChildren, useState, createContext } from "react";

export const OpenFriendsContext = createContext({
  openFriends: false,
  setOpenFriends: (navigation: boolean) => {},
});

export const OpenFriendsProvider = ({ children }: PropsWithChildren<{}>) => {
  const [openFriends, setOpenFriends] = useState(false)
  return (
    <OpenFriendsContext.Provider value={{openFriends, setOpenFriends}}>
      {children}
    </OpenFriendsContext.Provider>
  )
}