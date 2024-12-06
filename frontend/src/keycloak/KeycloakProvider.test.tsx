import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { KeycloakProvider, useKeycloak } from "./KeycloakProvider"
import { test, describe, expect } from 'vitest'

const TestComponent = () => {
    const { keycloak, authenticated } = useKeycloak()
    return (
        <div>
            <span data-testid="authenticated">
                {authenticated ? "Authenticated" : "Not Authenticated"}
            </span>
            <span data-testid="keycloak">
                {keycloak ? "Keycloak Initialized" : "No Keycloak"}
            </span>
        </div>
    )
}

describe("KeycloakProvider", () => {
    test("should provide keycloak context to children components", async () => {
        render(
            <KeycloakProvider>
                <TestComponent />
            </KeycloakProvider>
        )

        // Wait for the provider to finish initializing Keycloak
        await waitFor(() => {
            expect(screen.getByTestId("authenticated")).toHaveTextContent(
                "Not Authenticated"
            )
            expect(screen.getByTestId("keycloak")).toHaveTextContent(
                "No Keycloak"
            )
        })
    })
})
