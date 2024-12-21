import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom" // Für Router-Kontext
import QrReader from "./QrReader"
import "@testing-library/jest-dom"
import QrScanner from "qr-scanner"
import { test, describe, expect, vi } from "vitest"

vi.mock("qr-scanner")

describe("QrReader Component", () => {
    test("renders without crashing", async () => {
        vi.spyOn(QrScanner.prototype, "start").mockImplementation(() =>
            Promise.resolve()
        )
        const { container } = render(
            <BrowserRouter>
                <QrReader />
            </BrowserRouter>
        )

        await waitFor(() => {
            const videoElement = container.querySelector("video")
            expect(videoElement).toBeInTheDocument()
        })
    })
})
