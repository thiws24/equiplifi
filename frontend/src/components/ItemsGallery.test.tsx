import { render, screen } from "@testing-library/react"
import { ItemsGallery } from "./ItemsGallery"
import { test, describe, expect } from "vitest"

describe("ItemsGallery", () => {
    test("shows total of pages 1 for empty array", () => {
        render(<ItemsGallery items={[]} />)
        expect(screen.getByText("1 von 1")).toBeDefined()
    })
})
