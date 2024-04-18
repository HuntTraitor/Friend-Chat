import { PropsWithChildren, useState, createContext } from "react";

export const NavigationContext = createContext({
  navigation: 0,
  setNavigation: (navigation: number) => {},
});

export const NavigationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [navigation, setNavigation] = useState(0)
  return (
    <NavigationContext.Provider value={{navigation, setNavigation}}>
      {children}
    </NavigationContext.Provider>
  )
}