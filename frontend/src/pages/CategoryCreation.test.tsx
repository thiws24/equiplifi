import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import CategoryCreation from "./CategoryCreation"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { vi, beforeEach, it, describe, expect } from "vitest"

// Mocking useKeycloak hook
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: vi.fn(),
}))

// Mocking fetch calls
global.fetch = vi.fn()

describe("CategoryCreation Component", () => {
    beforeEach(() => {
        // Mock useKeycloak to simulate an Inventory-Manager user
        // @ts-ignore
        useKeycloak.mockReturnValue({
            userInfo: { groups: ["Inventory-Manager"] },
            token: "mock-token",
        })

        // Reset mock implementations before each test
        // @ts-ignore
        global.fetch.mockReset()
        window.open = vi.fn() // Mock window.open
    })

    it("should render the form fields correctly", () => {
        render(<CategoryCreation />)

        expect(screen.getByLabelText(/Name\*/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Icon/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Beschreibung/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Anzahl Items\*/i)).toBeInTheDocument()
    })

    it("should disable the submit button if required fields are empty", () => {
        render(<CategoryCreation />)

        const submitButton = screen.getByRole("button", { name: /Erstellen/i })

        // Initially, the button should be disabled (required fields are empty)
        expect(submitButton).toBeDisabled()

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/Name\*/i), { target: { value: "New Category" } })
        fireEvent.change(screen.getByLabelText(/Anzahl Items\*/i), { target: { value: "5" } })

        // After filling in required fields, button should be enabled
        expect(submitButton).toBeEnabled()
    })

    it("should handle successful form submission without image", async () => {
        render(<CategoryCreation />)

        // Mock the fetch response
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: "123" }),
        })

        fireEvent.change(screen.getByLabelText(/Name\*/i), { target: { value: "New Category" } })
        fireEvent.change(screen.getByLabelText(/Anzahl Items\*/i), { target: { value: "5" } })

        fireEvent.click(screen.getByRole("button", { name: /Erstellen/i }))

        // Check that the fetch function was called to submit the form
        await waitFor(() => expect(fetch).toHaveBeenCalled())

        // Ensure that window.open was called with the correct URL
        await waitFor(() => expect(window.open).toHaveBeenCalledWith("/category/123", "_self"))
    })

    it("should handle successful form submission with image", async () => {
        render(<CategoryCreation />)

        // Mock fetch for image upload
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => "mock-image-url",
        })

        // Mock fetch for category creation
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: "123" }),
        })

        // Mock file input change event
        const file = new File(["image"], "test.png", { type: "image/png" })
        const fileInput = screen.getByLabelText(/Bild/i) as HTMLInputElement
        fireEvent.change(fileInput, { target: { files: [file] } })

        fireEvent.change(screen.getByLabelText(/Name\*/i), { target: { value: "New Category" } })
        fireEvent.change(screen.getByLabelText(/Anzahl Items\*/i), { target: { value: "5" } })

        fireEvent.click(screen.getByRole("button", { name: /Erstellen/i }))

        // Check that fetch for image upload was called
        await waitFor(() => expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_II_SERVICE_HOST}/picture`,
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData),
            })
        ))

        // Check that fetch for category creation was called
        await waitFor(() => expect(fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_II_SERVICE_HOST}/categories`,
            expect.objectContaining({
                method: "POST",
                body: expect.stringContaining("mock-image-url"),
            })
        ))

        // Ensure that window.open was called with the correct URL
        await waitFor(() => expect(window.open).toHaveBeenCalledWith("/category/123", "_self"))
    })

    it("should redirect if the user is not an Inventory-Manager", () => {
        // Mock useKeycloak to simulate a user without the "Inventory-Manager" group
        // @ts-ignore
        useKeycloak.mockReturnValue({
            userInfo: { groups: [] },
            token: "mock-token",
        })

        render(<CategoryCreation />)

        // The component should redirect to the home page
        expect(window.open).toHaveBeenCalledWith("/", "_self")
    })
})
