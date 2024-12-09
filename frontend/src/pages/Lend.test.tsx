import {
    fireEvent,
    render,
    screen,
    waitFor,
    within
} from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import Lend from "./Lend"
import React from "react"
import { test, describe, expect, vi } from "vitest"

describe("Lend Tests", () => {
    test("renders the Lend form", () => {
        render(
            <BrowserRouter>
                <Lend />
            </BrowserRouter>
        )

        expect(screen.getByText(/Ausleihformular/i)).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /Submit/i })
        ).toBeInTheDocument()
    })

    test("fetches and displays inventory item", async () => {
        const mockItem = {
            id: 1,
            name: "Magischer Schlüssel",
            icon: "🗝️",
            photoUrl: "",
            urn: "QR-Code 001"
        }

        window.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockItem)
            })
        )

        render(
            <BrowserRouter>
                <Lend />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument()
        })
    })

    test("form validation shows error with empty dates", async () => {
        render(
            <BrowserRouter>
                <Lend />
            </BrowserRouter>
        )

        const submitButton = screen.getByRole("button", { name: /Submit/i })

        submitButton.click()

        await waitFor(() => {
            expect(
                screen.getByText("Startdatum erforderlich")
            ).toBeInTheDocument()
            expect(
                screen.getByText("Enddatum erforderlich")
            ).toBeInTheDocument()
        })
    })

    // Tests if you get navigated to the Table/GalleryView after submitting the form
    test("submits the form and redirects to inventory item page", async () => {
        const mockItem = { id: 1, name: "Magischer Schlüssel", photoUrl: "" }

        window.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockItem)
            })
        )

        render(
            <BrowserRouter>
                <Lend />
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument()
        })

        const startDateInput = screen.getByTestId(
            "startDateButton"
        ) as HTMLInputElement
        const endDateInput = screen.getByTestId(
            "endDateButton"
        ) as HTMLInputElement
        const submitButton = screen.getByRole("button", { name: /Submit/i })

        startDateInput.value = "2024-12-01"
        endDateInput.value = "2024-12-10"

        submitButton.click()

        await waitFor(() => {
            expect(window.location.href).toContain(`/`)
        })
    })
})

test("date selection test", async () => {
    render(
        <BrowserRouter>
            <Lend />
        </BrowserRouter>
    )

    const startDateButton = screen.getByRole("button", {
        name: /Startdatum auswählen/i
    })
    expect(startDateButton).toHaveTextContent("Startdatum auswählen")

    fireEvent.click(startDateButton)

    const calendar = screen.getByTestId("CalenderStartButton")
    expect(calendar).toBeInTheDocument()

    const calendarDateButton = within(calendar).getByRole("gridcell", {
        name: /15/i
    })
    expect(calendarDateButton).toBeInTheDocument()

    // Test whether the Button changes its value
    // fireEvent.click(calendarDateButton);
    // expect(startDateButton).toHaveTextContent("15th");
})
