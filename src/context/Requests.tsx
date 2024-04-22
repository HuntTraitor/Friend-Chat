import { createContext, PropsWithChildren, useState } from "react";

interface Friend {
  id: string;
  name: string;
}

interface RequestState {
  inbound: Friend[];
  outbound: Friend[];
}

interface RequestContextType {
  requests: RequestState;
  setRequests: React.Dispatch<React.SetStateAction<RequestState>>;
}

export const RequestContext = createContext<RequestContextType>({
  requests: {
    inbound: [],
    outbound: []
  },
  setRequests: () => {}
});

// export const RequestProvider = ({ children }: PropsWithChildren<{}>) => {
//   const [requests, setRequests] = useState<RequestState>({
//     inbound: [],
//     outbound: []
//   });

//   return (
//     <RequestContext.Provider value={{ requests, setRequests }}>
//       {children}
//     </RequestContext.Provider>
//   );
// };
