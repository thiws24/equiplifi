import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { KeycloakProvider, useKeycloak } from "./KeycloakProvider"
import { test, describe, expect } from "vitest"

// Mock Keycloak
vi.mock('keycloak-js', () => ({
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
        init: vi.fn().mockImplementation(() => Promise.resolve(true)),
        login: vi.fn(),
        loadUserInfo: vi.fn().mockImplementation(() => Promise.resolve({ name: 'TestUser', sub: '12345', groups: []})),
        token: 'mocked-token',
    })),
}))

const TestComponent = () => {
    const { keycloak, authenticated, userInfo } = useKeycloak()
    return (
        <div>
            <span data-testid="authenticated">
                {authenticated ? "Authenticated" : "Not Authenticated"}
            </span>
            <span data-testid="keycloak">
                {keycloak ? "Keycloak Initialized" : "No Keycloak"}
            </span>
            <span data-testid="userInfo">
                {userInfo?.name}
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
                "Authenticated"
            )
            expect(screen.getByTestId("keycloak")).toHaveTextContent(
                "Keycloak Initialized"
            )
            expect(screen.getByTestId("userInfo")).toHaveTextContent(
                "TestUser"
            )
        })
    })
})
