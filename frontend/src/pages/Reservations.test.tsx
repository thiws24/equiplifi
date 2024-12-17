import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Reservations from "./Reservations";
import { vi, expect, describe, beforeEach, it } from "vitest";
import CustomToasts from "../components/CustomToasts"
import { fetchOpenTasksByTaskName } from "../services/fetchTasks"


// Mock `fetch`
global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve({}),
    })
)

// Mock the fetchOpenTasksByTaskName
vi.mock('../services/fetchTasks', () => ({
    fetchOpenTasksByTaskName: vi.fn().mockImplementation(() => Promise.resolve([
        {
            process_instance_id: 1,
            task_guid: "guid-123",
            dataObject: {
                name: "Test Reservation",
                details: "Details about reservation",
            },
        },
    ]))
}))

// Mock `useKeycloak`
vi.mock("../keycloak/KeycloakProvider", () => ({
    useKeycloak: () => ({
        token: "mock-token",
    }),
}));

describe("Reservations Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state initially", () => {
        render(
            <MemoryRouter initialEntries={["/reservations"]}
                          future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                          }}>
                <Routes>
                    <Route path="/reservations" element={<Reservations />} />
                </Routes>
            </MemoryRouter>
        );

        // Verify loading or empty state
        expect(screen.getByText(/Reservierungen, die bestätigt werden müssen/i)).toBeInTheDocument();
        expect(screen.queryByText(/Test Reservation/i)).not.toBeInTheDocument();
    });


    it("handles fetch failure gracefully", async () => {
        // Mock fetch to fail
        // @ts-ignore
        fetchOpenTasksByTaskName.mockImplementationOnce(() =>
            Promise.reject(new Error("Fetch failed"))
        );

        render(
            <MemoryRouter initialEntries={["/reservations"]}
                          future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                          }}>
                <Routes>
                    <Route path="/reservations" element={<Reservations />} />
                </Routes>
            </MemoryRouter>
        );

        // Verify no tasks are rendered
        expect(screen.queryByText(/Test Reservation/i)).not.toBeInTheDocument();
    });

    it('should confirm reservation successfully and show success toast', async () => {
        render(
            <MemoryRouter initialEntries={["/reservations"]}
                          future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                          }}>
                <Reservations/>
            </MemoryRouter>
        )

        await waitFor(() => {
            // Simulate clicking the "Confirm" button on the first task
            const confirmButton = screen.getByText('Reservierung bestätigen')
            fireEvent.click(confirmButton)

            expect(screen.queryByText("Reservierung erfolgreich bestätigt.")).toBeInTheDocument();
        })
    })

})
