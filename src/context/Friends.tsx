// import { createContext, PropsWithChildren, useState } from "react";

// interface Friend {
//   id: string;
//   name: string;
// }

// interface FriendsState {
//   inbound: Friend[];
//   outbound: Friend[];
// }

// interface FriendsContextType {
//   friends: FriendsState;
//   setFriends: React.Dispatch<React.SetStateAction<FriendsState>>;
// }

// export const FriendsContext = createContext<FriendsContextType>({
//   friends: {
//     inbound: [],
//     outbound: []
//   },
//   setFriends: () => {}
// });

// export const FriendsProvider = ({ children }: PropsWithChildren<{}>) => {
//   const [friends, setFriends] = useState<FriendsState>({
//     inbound: [],
//     outbound: []
//   });

//   return (
//     <FriendsContext.Provider value={{ friends, setFriends }}>
//       {children}
//     </FriendsContext.Provider>
//   );
// };

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