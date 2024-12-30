import { render, screen } from "@testing-library/react"
import { test, describe, expect } from "vitest"
import { InventoryPreviewCard } from "./InventoryPreviewCard"

describe("InventoryPreviewCard", () => {
    test("renders correct link", () => {
        render(
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

        const link = screen.getByRole("link")
        expect(link).toHaveAttribute("href", "/category/1")
    })
})
