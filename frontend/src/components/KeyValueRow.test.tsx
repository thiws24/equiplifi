import { render, screen } from "@testing-library/react"
import { KeyValueRow } from "./KeyValueRow"
import { test, describe, expect } from 'vitest'

describe("KeyValueRow Tests", () => {
    test("correct rendering", () => {
        const label = "Test Label"
        const children = "Test Children"

        render(<KeyValueRow label={label}>{children}</KeyValueRow>)

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(screen.getByText(children)).toBeInTheDocument()
    })

    test("renders label as a ReactNode", () => {
        const label = <span>ReactNode Label</span>
        const children = "Test Children"

        render(<KeyValueRow label={label}>{children}</KeyValueRow>)

        expect(screen.getByText("ReactNode Label")).toBeInTheDocument()
    })

    test("correct styles applied", () => {
        const label = "Styled Label"
        const children = "Styled Children"

        render(<KeyValueRow label={label}>{children}</KeyValueRow>)

        const labelElement = screen.getByText(label)
        expect(labelElement).toHaveClass(
            "text-sm leading-6 text-customBlack sm:col-span-1"
        )

        const childrenElement = screen.getByText(children)
        expect(childrenElement).toHaveClass(
            "mt-1 text-sm leading-6 text-customBlack sm:col-span-3 sm:mt-0 sm:mr-8"
        )
    })

    test("renders with empty children", () => {
        const label = "Empty Children"
        const children = null
        const { container } = render(
            <KeyValueRow label={label}>{children}</KeyValueRow>
        )

        expect(screen.getByText("Empty Children")).toBeInTheDocument()

        // Überprüfen, ob das `dd`-Element existiert, aber keinen Inhalt hat
        const ddElement = container.querySelector("dd")
        expect(ddElement).toBeInTheDocument()
        expect(ddElement).toBeEmptyDOMElement()
    })

    test("matches the snapshot", () => {
        const { container } = render(
            <KeyValueRow label="Snapshot Label">Snapshot Content</KeyValueRow>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
