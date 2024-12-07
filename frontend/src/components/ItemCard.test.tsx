import { render, screen } from "@testing-library/react";
import { ItemCard } from "./ItemCard";

describe('ItemCard', () => {
    test('renders correct link', () => {
        render(<ItemCard id={2} photoUrl={''} name={''} icon={''} urn={''} location={''} status={''} categoryId={2}/>)
        expect(screen.getByRole('link')).toHaveAttribute('href', '/inventory-item/2')
    })
})