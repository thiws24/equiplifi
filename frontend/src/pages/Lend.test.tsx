import {
    fireEvent,
    render,
    screen,
    waitFor,
    within
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Lend from "./Lend";
import React from "react";
import { test, describe, expect, vi } from "vitest";

describe("Lend Tests", () => {
    test("fetches and displays inventory item", async () => {
        const mockItem = {
            id: 1,
            name: "Magischer Schlüssel",
            icon: "🗝️",
            photoUrl: "",
            urn: "QR-Code 001"
        };

        window.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes("availability")) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        reservations: [
                            { startDate: "2024-12-15", endDate: "2024-12-20" }
                        ]
                    })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockItem)
            });
        });

        render(
            <BrowserRouter>
                <Lend />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Magischer Schlüssel")).toBeInTheDocument();
        });
    });
});
