import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LendCategory from "./LendCategory";
import { vi, it, expect, describe, beforeEach } from "vitest";
import { act } from "react"

// Mock `fetch`
global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes("categories")) {
        return Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    id: 1,
                    name: "Test Category",
                    items: [{ id: 101 }, { id: 102 }],
                }),
        });
    }
    if (url.includes("availability")) {
        return Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        itemId: 101,
                        reservations: [
                            { startDate: "2024-01-01", endDate: "2024-01-05" },
                        ],
                    },
                ]),
        });
    }
    if (url.includes("Reservation-request-start")) {
        return Promise.resolve({ ok: true });
    }
    return Promise.reject(new Error("Unknown endpoint"));
});

// Mock `useKeycloak`
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: () => ({
        token: "mock-token",
        userInfo: { sub: "mock-user" },
    }),
}));

describe("LendCategory Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders LendCategory component with category data", async () => {
        render(
            <MemoryRouter initialEntries={["/lend/1"]}>
                <Routes>
                    <Route path="/lend/:id" element={<LendCategory />} />
                </Routes>
            </MemoryRouter>
        );

        // Verify loading state and category details
        expect(await screen.findByText(/Ausleihformular/i)).toBeInTheDocument();
        expect(await screen.findByText(/Test Category/i)).toBeInTheDocument();
    });

});
