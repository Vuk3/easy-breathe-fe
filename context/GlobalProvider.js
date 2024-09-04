import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, getMe } from "../lib/api";

import { router } from "expo-router";


const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          getMe(res).then((user) => {
            setUser(user);
          });
          // ovo sam ja dodao, jer sam imao problem da je logovan a ostane na sing up
          // router.replace("/home");
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // [] znaci da se pokrece samo na startu

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;