import { PropsWithChildren, useState, createContext } from "react";

export const OpenMembersContext = createContext({
  openMembers: false,
  setOpenMembers: (navigation: boolean) => {},
});

export const OpenMembersProvider = ({ children }: PropsWithChildren<{}>) => {
  const [openMembers, setOpenMembers] = useState(false)
  return (
    <OpenMembersContext.Provider value={{openMembers, setOpenMembers}}>
      {children}
    </OpenMembersContext.Provider>
  )
}