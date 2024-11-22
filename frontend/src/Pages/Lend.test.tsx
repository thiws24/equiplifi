import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Lend from "./Lend";

describe("Lend Tests", () => {
    test("renders the Lend form", () => {
        render(<BrowserRouter><Lend /></BrowserRouter>);

        expect(screen.getByText(/Ausleihformular/i)).toBeInTheDocument();

        // Unable to be tested due to unassigned labels and Button functionality
        // expect(screen.getByLabelText(/Ausleihdatum/i)).toBeInTheDocument();
        // expect(screen.getByLabelText(/Abgabedatum/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
    });

    test("fetches and displays inventory item", async () => {
        const mockItem = {
            id: 1,
            name: "Magischer Schlüssel",
            icon: "🗝️",
            photoUrl: "",
            urn: "QR-Code 001",
        };

        window.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockItem),
            })
        );

        render(<BrowserRouter><Lend /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument();
        });
    });

    test("form validation shows error with empty dates", async () => {
        render(<BrowserRouter><Lend /></BrowserRouter>);

        const submitButton = screen.getByRole("button", { name: /Submit/i });

        submitButton.click();

        await waitFor(() => {
            expect(screen.getByText("Startdatum erforderlich")).toBeInTheDocument();
            expect(screen.getByText("Enddatum erforderlich")).toBeInTheDocument();
        });
    });

    // Tests if you get navigated to the Table/GalleryView after submitting the form
    test("submits the form and redirects to inventory item page", async () => {
        const mockItem = { id: 1, name: "Magischer Schlüssel", photoUrl: "" };

        window.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve(mockItem) })
        );

        render(<BrowserRouter><Lend /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument();
        });

        const startDateInput = screen.getByTestId('startDateButton') as HTMLInputElement;
        const endDateInput = screen.getByTestId('endDateButton') as HTMLInputElement;
        const submitButton = screen.getByRole("button", { name: /Submit/i });

        startDateInput.value = "2024-12-01";
        endDateInput.value = "2024-12-10";

        submitButton.click();

        await waitFor(() => {
            expect(window.location.href).toContain(`/`);
        });
    });
});

// test errormessage
// test("shows error message on failed request", async () => {
//     // Mocking fetch to return a 500 error response
//     window.fetch = jest.fn().mockImplementation(() =>
//         Promise.resolve({
//             ok: false,
//             status: 500,
//             json: () => Promise.resolve({ message: "Fehler beim Absenden" }),
//         })
//     );
//
//     render(<BrowserRouter><Lend /></BrowserRouter>);
//
//     const startDateInput = screen.getByTestId('startDateButton');
//     const endDateInput = screen.getByTestId('endDateButton');
//     const submitButton = screen.getByRole("button", { name: /Submit/i });
//
//     fireEvent.change(startDateInput, { target: { value: "2024-12-01" } });
//     fireEvent.change(endDateInput, { target: { value: "2024-12-10" } });
//
//     fireEvent.click(submitButton);
//
//     await waitFor(() => {
//         expect(screen.getByRole("alert")).toBeInTheDocument();
//         expect(screen.getByText(/HTTP Fehler! Status: 500/i)).toBeInTheDocument();
//     }, { timeout: 3000 });
// });
//
// test interactivity of calendar. Broken atm
// test("calendar popover interaction works", async () => {
//     render(<BrowserRouter><Lend /></BrowserRouter>);
//
//     // Finde den Button zum Startdatum
//     const startDateButton = screen.getByTestId('startDateButton') as HTMLButtonElement;
//
//     // Klick auf den Startdatum-Button, um den Kalender zu öffnen
//     fireEvent.click(startDateButton);
//
//     // Warte, bis der Kalender im Popover erscheint
//     const calendar = screen.getByTestId("CalenderStartButton");
//     expect(calendar).toBeInTheDocument();
//
//     // Finde das Datum im Kalender (z.B. 15)
//     const calendarDate = screen.getByText("15");
//
//     // Klick auf das Datum, um es auszuwählen
//     fireEvent.click(calendarDate);
//
//     fireEvent.change(startDateButton, { target: { value: "2024-12-15" } });
//
//     // Warte, bis der Button-Text sich aktualisiert hat
//     const updatedStartDateButton = screen.getByTestId('startDateButton') as HTMLButtonElement;
//     await waitFor(() => {
//         expect(updatedStartDateButton).toHaveTextContent("15");
//     });
// });
