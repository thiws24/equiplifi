import React from "react";
import { render } from "@testing-library/react";
import ReservationTable from "./ReservationTable";
import { test, describe, expect, it } from "vitest"
import { ColDef } from "ag-grid-community"
import { ReservationItemProps } from "../interfaces/ReservationItemProps"
import { MemoryRouter } from "react-router-dom"


describe("ReservationTable Component", () => {
    const mockColDefs: ColDef<ReservationItemProps>[] = [
        { headerName: "Start Date", field: "startDate" },
        { headerName: "End Date", field: "endDate" },
    ];

    const mockReservationItems: ReservationItemProps[] = [
        { startDate: "2024-01-01", endDate: "2024-01-05" },
        { startDate: "2024-01-10", endDate: "2024-01-15" },
    ];

    it("renders without crashing", () => {
        const { container } = render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}>
                <ReservationTable
                    reservationItems={mockReservationItems}
                    colDefs={mockColDefs}
                    loading={false}
                />
            </MemoryRouter>
        );
        expect(container).toBeInTheDocument();
    });

    it("renders reservation data", () => {
        const { getByText } = render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}>
                <ReservationTable
                    reservationItems={mockReservationItems}
                    colDefs={mockColDefs}
                    loading={false}
                />
            </MemoryRouter>
        );

        // Verify data rendering
        expect(getByText("2024-01-01")).toBeInTheDocument();
        expect(getByText("2024-01-05")).toBeInTheDocument();
        expect(getByText("2024-01-10")).toBeInTheDocument();
        expect(getByText("2024-01-15")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        const { container } = render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}>
                <ReservationTable
                    reservationItems={[]}
                    colDefs={mockColDefs}
                    loading={true}
                />
            </MemoryRouter>
        );

        // Check for loading overlay
        const loadingOverlay = container.querySelector(".ag-overlay-loading-center");
        expect(loadingOverlay).toBeInTheDocument();
    });
});
