import { render } from "@testing-library/react"
import { TableGalleryView } from "./TableGalleryView"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import { ColDef } from "ag-grid-community"
import { BrowserRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { test, describe, expect } from "vitest"

const colDefs: ColDef<ItemDetailsProps, any>[] = [
    { field: "id" },
    { field: "name" },
    { field: "icon" },
    { field: "photoUrl" }
]

describe("TableGalleryView", () => {
    test("shows table as default", () => {
        const { container } = render(
            <BrowserRouter>
                <TableGalleryView colDefs={colDefs} data={[]} loading={false} />
            </BrowserRouter>
        )
        expect(container.querySelector(".ag-root-wrapper")).not.toBeNull()
    })
    test("shows gallery on switch", async () => {
        const { container } = render(
            <BrowserRouter>
                <TableGalleryView colDefs={colDefs} data={[]} loading={false} />
            </BrowserRouter>
        )
        const galleryTab = container.querySelector("button[id*='gallery-view']")
        expect(galleryTab).not.toBeNull()

        await userEvent.click(galleryTab!)
        expect(container.querySelector("#items-gallery")).not.toBeNull()
        expect(container.querySelector(".ag-root-wrapper")).toBeNull()
    })
})
