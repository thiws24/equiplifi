import { render } from "@testing-library/react"
import { test, describe, expect } from "vitest"
import InventoryPreviewCard from "./InventoryPreviewCard"

describe("InventoryPreview", () => {
    test("renders correct link", () => {
        const { container } = render(
            <InventoryPreviewCard
                id={1}
                name="Test"
                description="Test description"
                icon="T"
                photoUrl="test.jpg"
                urn="urn:test"
                location="Test location"
                status="active"
                categoryId={1}
            />
        )

        const link = container.querySelector("a")
        expect(link).toHaveAttribute("href", "/category/1")
    })
})
