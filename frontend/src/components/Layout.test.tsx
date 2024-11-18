import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from './Layout';
import '@testing-library/jest-dom';


jest.mock('./QrReader', () => () => <div>QrReader Mock</div>); // Mock der QrReader-Komponente

describe('Layout', () => {
    test('should render the layout with children and logo', () => {
        render(<Layout><div>Children Content</div></Layout>);

        expect(screen.getByAltText('equipli logo')).toBeInTheDocument();

        expect(screen.getByText('equipli')).toBeInTheDocument();

        const button = screen.getByText('Inventar ausleihen');
        expect(button).toBeInTheDocument();

        expect(screen.getByText('Children Content')).toBeInTheDocument();
    });

    test('should show and hide QrReader on button click', () => {
        render(<Layout><div>Children Content</div></Layout>);

        const button = screen.getByText('Inventar ausleihen');

        expect(screen.queryByText('QrReader Mock')).toBeNull();

        fireEvent.click(button);

        expect(screen.getByText('QrReader Mock')).toBeInTheDocument();

        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();

        fireEvent.click(closeButton);

        expect(screen.queryByText('QrReader Mock')).toBeNull();
    });
});
