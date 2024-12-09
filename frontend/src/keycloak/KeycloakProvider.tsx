import React, { createContext, useContext, useState, useEffect } from "react"
import Keycloak from "keycloak-js"

interface Props {
    children: React.ReactNode
}

interface Context {
    keycloak?: Keycloak
    authenticated?: boolean
    token?: string
}

export const keycloakConfig = new Keycloak({
    url: process.env.REACT_APP_KEYCLOAK || "",
    realm: "master",
    clientId: process.env.NODE_ENV === "production" ? "frontend" : "localhost"
})

const KeycloakContext = createContext<Context>({
    keycloak: undefined,
    authenticated: false,
    token: undefined
})

export const useKeycloak = () => useContext(KeycloakContext)

export const KeycloakProvider: React.FC<Props> = ({ children }) => {
    const [keycloakState, setKeycloakState] = useState<Context>({
        keycloak: undefined,
        authenticated: false,
        token: undefined
    })
    let run = 1
    useEffect(() => {
        // In development useEffect runs 2 times. To avoid error by calling init a second time, we count the renders and init on first
        if (run === 1) {
            keycloakConfig
                .init({ onLoad: "check-sso" })
                .then((authenticated: any) => {
                    if (!authenticated) {
                        void keycloakConfig.login()
                    } else {
                        setKeycloakState({
                            keycloak: keycloakConfig,
                            authenticated,
                            token: keycloakConfig.token
                        })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        run++
    }, [])

    return (
        <KeycloakContext.Provider value={keycloakState}>
            {children}
        </KeycloakContext.Provider>
    )
}
