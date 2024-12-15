import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryDetails from "./CategoryDetails";
import { vi, it, describe, afterEach, beforeEach, expect } from "vitest";

// Mock `fetch`
global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes("categories")) {
        return Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    id: 1,
                    name: "Test Category",
                    description: "A category description",
                    icon: "📦",
                    items: [
                        { id: 101, status: "OK", location: "Shelf 1" },
                        { id: 102, status: "LENT", location: "Shelf 2" },
                    ],
                }),
        });
    }
    return Promise.reject(new Error("Unknown endpoint"));
});

// Mock `useKeycloak`
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: () => ({
        token: "mock-token",
    }),
}));

describe("CategoryDetails Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("allows editing category details", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={["/category/1"]}
                              future={{
                                  v7_startTransition: true,
                                  v7_relativeSplatPath: true
                              }}>
                    <Routes>
                        <Route path="/category/:id" element={<CategoryDetails />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        const editButton = screen.getByText(/Kategorie bearbeiten/i);
        await act(async () => fireEvent.click(editButton));

        // Check input fields for editing
        const nameInput = screen.getByDisplayValue(/Test Category/i);
        await act(async () => fireEvent.change(nameInput, { target: { value: "Updated Category" } }));

        const descriptionInput = screen.getByDisplayValue(/A category description/i);
        await act(async () => fireEvent.change(descriptionInput, { target: { value: "Updated Description" } }));

        const iconInput = screen.getByDisplayValue(/📦/i);
        await act(async () => fireEvent.change(iconInput, { target: { value: "🔧" } }));

        const saveButton = screen.getByText(/Speichern/i);
        await act(async () => fireEvent.click(saveButton));

        // Mock save should trigger successfully
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial fetch + PUT request
    });
});
