import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, expect, beforeEach, describe, test } from "vitest";
import Home from "./Home";
import { useKeycloak } from "../keycloak/KeycloakProvider";

// Mocking fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock Data
const mockReturnTasks = [
    {
        id: 1,
        name: "Rückgabe 1",
        description: "Beschreibung der Rückgabe 1"
    },
    {
        id: 2,
        name: "Rückgabe 2",
        description: "Beschreibung der Rückgabe 2"
    }
];

// Mocking useKeycloak
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: () => ({
        keycloak: {
            tokenParsed: {
                given_name: "Test",
                preferred_username: "testuser"
            }
        }
    })
}));

describe("Home", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    test("renders the home page correctly", async () => {
        // Mocking a successful fetch response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockReturnTasks
        });

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // Check if the heading is rendered
        expect(screen.getByText("Hallo,")).toBeInTheDocument();

        // Wait for the return tasks to load
        await waitFor(() =>
            expect(screen.getByText("Rückgabe 1")).toBeInTheDocument()
        );

        expect(screen.getByText("Rückgabe 2")).toBeInTheDocument();
    });

    test("renders the correct number of return tasks", async () => {
        // Mocking a successful fetch response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockReturnTasks
        });

        const { container } = render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        // Wait for the return tasks to load
        await waitFor(() =>
            expect(container.querySelectorAll(".card").length).toBe(2)
        );
    });
});