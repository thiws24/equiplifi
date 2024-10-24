import { render, screen } from "@testing-library/react";
import React from "react";
import InventoryCard from "./InventoryCard";
import { InventoryItemProps } from "../interfaces/InventoryItemProps";
import { ColDef } from "ag-grid-community"

const colDefs: ColDef<InventoryItemProps, any>[] = [
  { field: "id" },
  { field: "name" },
  { field: "icon" },
  { field: "photo" },
  { field: "urn" }
]

describe("InventoryCard Tests", () => {

  test('renders data correctly', () => {

    const rowData = [
      {
        id: 1,
        name: "Magischer Schlüssel",
        icon: "🗝️",
        photo: "",
        urn: "QR-Code 001"
      },
      {
        id: 2,
        name: "Heiltrank",
        icon: "🧪",
        photo: "",
        urn: "QR-Code 002"
      },
      {
        id: 3,
        name: "Drachenfeuer",
        icon: "🔥",
        photo: "",
        urn: "QR-Code 003"
      },
    ]
    const { container } = render(<InventoryCard colDefs={colDefs} inventoryItems={rowData} loading={false} />);
    const elements = container?.querySelector('.ag-body')?.querySelectorAll('[role="row"]')

    expect(elements?.length).toBe(3)

    expect(screen.getByText("F-Series")).toBeDefined()
  })

  test('should have expected column headers', () => {
    const rowData = [
      {
        id: 1,
        name: "Magischer Schlüssel",
        icon: "🗝️",
        photo: "",
        urn: "QR-Code 001"
      },
    ]
    const { container } = render(<InventoryCard colDefs={colDefs} inventoryItems={rowData} loading={false} />);
    const headers = Array.from(container?.querySelectorAll('.ag-header-cell-text')).map(function (header) {
      return header.textContent
    })

    expect(headers).toEqual(['Id', 'Name', 'Icon', 'Photo', 'Urn']);
  });
})