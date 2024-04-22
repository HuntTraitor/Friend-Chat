import { createContext, PropsWithChildren, useState } from "react";

interface Friend {
  id: string;
  name: string;
}

interface FriendsContextType {
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

export const FriendsContext = createContext<FriendsContextType>({
  friends: [],
  setFriends: () => {}
});

export const FriendsProvider = ({ children }: PropsWithChildren<{}>) => {
  const [friends, setFriends] = useState<Friend[]>([]);

  return (
    <FriendsContext.Provider value={{ friends, setFriends }}>
      {children}
    </FriendsContext.Provider>
  );
};