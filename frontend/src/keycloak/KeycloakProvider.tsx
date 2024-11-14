import React, { createContext, useContext, useState, useEffect } from 'react';
import Keycloak from "keycloak-js";

interface Props {
  children: React.ReactNode;
}

interface Context {
  keycloak?: Keycloak;
  authenticated?: boolean
}

export const keycloakConfig = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK || '',
  realm: "master",
  clientId: "frontend"
});

const KeycloakContext = createContext<Context>({ keycloak: undefined, authenticated: false });

export const useKeycloak = () => useContext(KeycloakContext);


export const KeycloakProvider: React.FC<Props> = ({ children }) => {
  const [keycloakState, setKeycloakState] = useState<Context>({ keycloak: undefined, authenticated: false });

  useEffect(() => {
    keycloakConfig.init({ onLoad: 'check-sso' }).then((authenticated: any) => {
      if (!authenticated) {
        keycloakConfig.login()
      } else {
        setKeycloakState({ keycloak: keycloakConfig, authenticated });
      }
    }).catch(() => {
      window.location.reload();
    });
  }, []);

  return (
    <KeycloakContext.Provider value={keycloakState}>
      {children}
    </KeycloakContext.Provider>
  );
};