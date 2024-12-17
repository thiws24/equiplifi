import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { ConfirmReservationCard } from "./ConfirmReservationCard"
import { ProcessInputProps } from "../interfaces/ProcessInputProps"
import { vi, describe, afterEach, test, expect } from "vitest"

describe("ConfirmReservationCard", () => {
    const mockOnConfirmReservation = vi.fn()

    const mockData: { endDate: string; count: number; categoryId: number; startDate: string; userId: string; itemId: number } = {
        categoryId: 1,
        count: 5,
        startDate: "2023-12-01T00:00:00Z",
        endDate: "2023-12-10T00:00:00Z",
        userId: "123456",
        itemId: 1
    }

    afterEach(() => {
        vi.clearAllMocks()
    })

    test("renders the component with correct data", () => {
        render(
            <ConfirmReservationCard
                processId={123}
                guid="test-guid"
                data={mockData}
                onConfirmReservation={mockOnConfirmReservation}
            />
        )

        expect(screen.getByText("Prozess-ID: 123")).toBeInTheDocument()
        expect(screen.getByText("Kategorie-ID: 1")).toBeInTheDocument()
        expect(screen.getByText("Anzahl: 5")).toBeInTheDocument()
        expect(screen.getByText("Startddatum: 01.12.2023")).toBeInTheDocument()
        expect(screen.getByText("Enddatum: 10.12.2023")).toBeInTheDocument()
    })

    test("handles missing data gracefully", () => {
        render(
            <ConfirmReservationCard
                processId={123}
                guid="test-guid"
                data={undefined}
                onConfirmReservation={mockOnConfirmReservation}
            />
        )

        expect(screen.getByText("Prozess-ID: 123")).toBeInTheDocument()
        expect(screen.queryByText("Kategorie-ID:")).toBeInTheDocument()
        expect(screen.queryByText("Anzahl:")).toBeInTheDocument()

    })

    test("calls onConfirmReservation when the button is clicked", async () => {
        render(
            <ConfirmReservationCard
                processId={123}
                guid="test-guid"
                data={mockData}
                onConfirmReservation={mockOnConfirmReservation}
            />
        )

        const button = screen.getByText("Reservierung bestätigen")
        fireEvent.click(button)

        expect(mockOnConfirmReservation).toHaveBeenCalledTimes(1)
        expect(mockOnConfirmReservation).toHaveBeenCalledWith(123, "test-guid")
    })

    test("formats date correctly", () => {
        render(
            <ConfirmReservationCard
                processId={123}
                guid="test-guid"
                data={mockData}
                onConfirmReservation={mockOnConfirmReservation}
            />
        )

        expect(screen.getByText("Startddatum: 01.12.2023")).toBeInTheDocument()
        expect(screen.getByText("Enddatum: 10.12.2023")).toBeInTheDocument()
    })

})
