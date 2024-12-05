import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import Detail from "./Detail"

jest.mock("../components/ui/button", () => ({
  Button: ({ onClick, children, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

jest.mock("../components/KeyValueRow", () => ({
  KeyValueRow: ({
    label,
    children
  }: {
    label: string
    children: React.ReactNode
  }) => (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}))

describe("Detail Component", () => {
  const mockItem = {
    id: 1,
    name: "Test Item",
    description: "This is a test item.",
    urn: "urn:12345",
    photoUrl: "https://via.placeholder.com/150",
    icon: "📦"
  }

  const mockReservations = [
    { startDate: "2023-11-01", endDate: "2023-11-01" },
    { startDate: "2023-11-11", endDate: "2023-11-12" }
  ]

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/inventoryitems/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItem)
        })
      } else if (url.includes("/reservations/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReservations)
        })
      }
      return Promise.reject(new Error("Unknown API endpoint"))
    }) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("renders item data correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/inventory-item/1"]}>
        <Routes>
          <Route path="/inventory-item/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByText("Test Item")).toBeInTheDocument()
    )
    expect(screen.getByText("This is a test item.")).toBeInTheDocument()
    expect(screen.getByAltText("This is a test item.")).toBeInTheDocument()
    expect(screen.getByText("Reservierungen")).toBeInTheDocument()
  })

  test("opens and closes the QR code modal", async () => {
    render(
      <MemoryRouter initialEntries={["/inventory-item/1"]}>
        <Routes>
          <Route path="/inventory-item/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => screen.getByText("QR Code zeigen"))

    fireEvent.click(screen.getByText("QR Code zeigen"))
    expect(screen.getByText(mockItem.urn)).toBeInTheDocument()

    fireEvent.click(screen.getByText("Zurück"))
    expect(screen.queryByText(mockItem.urn)).not.toBeInTheDocument()
  })

  test("renders reservations correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/inventory-item/1"]}>
        <Routes>
          <Route path="/inventory-item/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => screen.getByText("Reservierungen"))

    expect(screen.getByText("Start Datum")).toBeInTheDocument()
    expect(screen.getByText("End Datum")).toBeInTheDocument()
  })
})
