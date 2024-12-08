import React from "react"
import { render, waitFor } from "@testing-library/react"
import Home from "./Home"
import { BrowserRouter } from "react-router-dom"
import { test, describe, expect, vi } from 'vitest'

const mockData = [
    {
        id: 1,
        name: "Magischer Schlüssel",
        icon: "🗝️",
        photoUrl: "",
        urn: "QR-Code 001"
    },
    {
        id: 2,
        name: "Heiltrank",
        icon: "🧪",
        photoUrl: "",
        urn: "QR-Code 002"
    },
    {
        id: 3,
        name: "Drachenfeuer",
        icon: "🔥",
        photoUrl: "",
        urn: "QR-Code 003"
    }
]



// Mock fetch
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(mockData)
}));

const f = { v7_startTransition: true, v7_relativeSplatPath: true }

describe("Home Tests", () => {
    test("renders the AG Grid table", async () => {
        const { container } = render(
            <BrowserRouter future={f}>
                <Home />
            </BrowserRouter>
        )
        await waitFor(() => {
            expect(container.querySelector(".ag-root")).not.toBeNull()
        })
    })
    test("renders 3 elements in the table body", async () => {
        const { container } = render(
            <BrowserRouter future={f}>
                <Home />
            </BrowserRouter>
        )
        await waitFor(
            async () => {
                const elements = container
                    ?.querySelector(".ag-body")
                    ?.querySelectorAll('[role="row"]')
                expect(elements?.length).toBe(3)
            },
            { timeout: 3000 }
        )
    })
})
