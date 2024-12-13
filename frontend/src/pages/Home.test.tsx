import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import Home from "./Home"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { vi, expect, beforeEach, describe, test } from "vitest"

// Mocking fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

// Mock Data
const mockInventoryItems = [
    {
        id: 1,
        name: "Magischer Schlüssel",
        icon: "🗝️",
        photoUrl: "https://example.com/key.png",
        description: "Ein magischer Schlüssel"
    },
    {
        id: 2,
        name: "Heiltrank",
        icon: "🧪",
        photoUrl: "https://example.com/potion.png",
        description: "Ein mächtiger Heiltrank"
    },
    {
        id: 3,
        name: "Drachenfeuer",
        icon: "🔥",
        photoUrl: "https://example.com/fire.png",
        description: "Ein gefährliches Drachenfeuer"
    }
]

describe("Home Page Tests", () => {
    beforeEach(() => {
        mockFetch.mockClear()
    })

    test("renders the home page correctly", async () => {
        // Mocking a successful fetch response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockInventoryItems
        })

        render(
            <BrowserRouter>
                <Home />
                <ToastContainer />
            </BrowserRouter>
        )

        // Check if the heading is rendered
        expect(
            screen.getByText("Inventarverwaltung")
        ).toBeInTheDocument()

        // Wait for the inventory items to load
        await waitFor(() =>
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument()
        )

        expect(screen.getByText("Heiltrank")).toBeInTheDocument()
        expect(screen.getByText("Drachenfeuer")).toBeInTheDocument()
    })

    test("renders the correct number of inventory items", async () => {
        // Mocking a successful fetch response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockInventoryItems
        })

        const { container } = render(
            <BrowserRouter>
                <Home />
                <ToastContainer />
            </BrowserRouter>
        )

        // Wait for the inventory items to load
        await waitFor(() =>
            expect(container.querySelectorAll(".ag-row").length).toBe(3)
        )
    })
})
