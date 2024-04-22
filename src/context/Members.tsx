import { createContext, PropsWithChildren, useState } from "react";

interface Member {
  id: string;
  name: string;
}

interface MemberContextType {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export const MembersContext = createContext<MemberContextType>({
  members: [],
  setMembers: () => {}
});

export const MembersProvider = ({ children }: PropsWithChildren<{}>) => {
  const [members, setMembers] = useState<Member[]>([]);

  return (
    <MembersContext.Provider value={{ members, setMembers }}>
      {children}
    </MembersContext.Provider>
  );
};