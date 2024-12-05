import { render, screen } from "@testing-library/react"
import { ItemCard } from "./ItemCard"

describe("ItemCard", () => {
  test("renders correct link", () => {
    render(<ItemCard id={2} photoUrl={""} name={""} icon={""} urn={""} />)
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/inventory-item/2"
    )
  })
})
