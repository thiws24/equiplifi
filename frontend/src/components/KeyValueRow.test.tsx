import { render, screen } from "@testing-library/react"
import { KeyValueRow } from "./KeyValueRow"

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

    test("renders with empty children", () => {
        const label = "Empty Children";
        const children = null;
        const { container } = render(<KeyValueRow label={label}>{children}</KeyValueRow>);

        expect(screen.getByText("Empty Children")).toBeInTheDocument();

        // Überprüfen, ob das `dd`-Element existiert, aber keinen Inhalt hat
        const ddElement = container.querySelector("dd");
        expect(ddElement).toBeInTheDocument();
        expect(ddElement).toBeEmptyDOMElement();
    });
})
