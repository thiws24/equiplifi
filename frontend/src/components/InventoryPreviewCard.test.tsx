import { render, screen } from "@testing-library/react"
import { test, describe, expect } from "vitest"
import { InventoryPreviewCard } from "./InventoryPreviewCard"

describe("ItemCard", () => {
    test("renders correct link", () => {
        render(
            <InventoryPreviewCard
                id={2}
                photoUrl={""}
                name={""}
                icon={""}
                urn={""}
                location={""}
                status={""}
                categoryId={2}
            />
        )
        expect(screen.getByRole("link")).toHaveAttribute("href", "/item/2")
    })
})
