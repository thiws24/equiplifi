import React, { createContext, useContext, useState, useEffect } from "react"
import Keycloak from "keycloak-js"
import { KeyCloakUserInfo } from "../interfaces/KeyCloakUserInfo"

interface Props {
    children: React.ReactNode
}

interface Context {
    keycloak?: Keycloak
    authenticated?: boolean
    token?: string
    userInfo?: KeyCloakUserInfo
}

export const keycloakConfig = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK || "",
    realm: "master",
    clientId: import.meta.env.PROD ? "frontend" : "localhost"
})

const KeycloakContext = createContext<Context>({
    keycloak: undefined,
    authenticated: false,
    token: undefined,
    userInfo: undefined
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
                .init({ onLoad: "check-sso", checkLoginIframe: false })
                .then((authenticated: any) => {
                    if (!authenticated) {
                        void keycloakConfig.login()
                    } else {
                        keycloakConfig?.loadUserInfo().then(
                            (val) =>
                                setKeycloakState({
                                    keycloak: keycloakConfig,
                                    authenticated,
                                    token: keycloakConfig.token,
                                    userInfo: val as any
                                }),
                            (e) => console.log(e)
                        )
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
