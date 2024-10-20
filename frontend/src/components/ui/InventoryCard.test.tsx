import { render, screen } from "@testing-library/react";
import React from "react";
import InventoryCard from "./InventoryCard";

describe("InventoryCard Tests", () => {

  test('renders data correctly', () => {
    const colDefs = [
      { field: "make" },
      { field: "model" },
      { field: "price" },
      { field: "electric" }
    ]

    const rowData = [
      { make: "Tesla", model: "Model Y", price: 64950, electric: true },
      { make: "Ford", model: "F-Series", price: 33850, electric: false },
      { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]
    const { container } = render(<InventoryCard colDefs={colDefs} inventoryItems={rowData} loading={false} />);
    const elements = container?.querySelector('.ag-body')?.querySelectorAll('[role="row"]')

    expect(elements?.length).toBe(3)

    expect(screen.getByText("F-Series")).toBeDefined()
  })

  test('should have expected column headers', () => {
    const colDefs = [
      { field: "name" },
      { field: "cool" },
    ]

    const rowData = [
      { name: "Inv", cool: true }
    ]
    const { container } = render(<InventoryCard colDefs={colDefs} inventoryItems={rowData} loading={false} />);
    const headers = Array.from(container.querySelectorAll('.ag-header-cell-text')).map(function (header) {
      return header.textContent
    })

    expect(headers).toEqual(['Name', 'Cool']);
  });
})