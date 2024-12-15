import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Detail from "./Detail";
import { vi, expect, beforeEach, describe, it } from "vitest";

// Mock `fetch`
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
        id: "1",
        categoryId: "10",
        name: "Test Item",
        icon: "📦",
        location: "Test Location",
        status: "OK",
        description: "Test Description",
        photoUrl: null,
    }),
});

// Mock `useKeycloak`
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: () => ({
        token: "mock-token",
    }),
}));

describe("Detail Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the Detail component with mocked data", async () => {
        render(
            <MemoryRouter initialEntries={["/item/1"]}
                          future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                          }}>
                <Routes>
                    <Route path="/item/:id" element={<Detail />} />
                </Routes>
            </MemoryRouter>
        );

        // Ensure basic text content is rendered
        expect(await screen.findByText(/Test Item/)).toBeInTheDocument();
        expect(screen.getByText(/Item 1/)).toBeInTheDocument();
        expect(screen.getByText(/Test Location/)).toBeInTheDocument();
        expect(screen.getByText(/OK/)).toBeInTheDocument();
        expect(screen.getByText(/Test Description/)).toBeInTheDocument();

        // Verify buttons
        expect(screen.getByRole("button", { name: /Item bearbeiten/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Ausleihen/i })).toBeInTheDocument();
    });

    it("displays an error message when the fetch fails", async () => {
        // Mock fetch to fail
        // @ts-ignore
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
            })
        );

        render(
            <MemoryRouter initialEntries={["/item/1"]}
                          future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                          }}>
                <Routes>
                    <Route path="/item/:id" element={<Detail />} />
                </Routes>
            </MemoryRouter>
        );

        // Verify error handling
        expect(await screen.findByText(/Dieses Exemplar existiert nicht/i)).toBeInTheDocument();
    });
});
