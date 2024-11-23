import { render, screen, fireEvent } from '@testing-library/react';
import { Layout } from './Layout';
import '@testing-library/jest-dom';

// Mock der QrReader-Komponente
jest.mock('./QrReader', () => () => <div>QrReader Mock</div>);

jest.mock('../keycloak/KeycloakProvider', () => ({
    useKeycloak: () => ({
        authenticated: true, // Simuliere einen authentifizierten Zustand
    }),
}));

describe('Layout Component', () => {
    test('renders the layout with children and logo', () => {
        render(
            <Layout>
                <div>Children Content</div>
            </Layout>
        );
        expect(screen.getByAltText('equipli logo')).toBeInTheDocument();
        expect(screen.getByText('equipli')).toBeInTheDocument();
        const button = screen.getByText('QR Code scannen');
        expect(button).toBeInTheDocument();
        expect(screen.getByText('Children Content')).toBeInTheDocument();
    });

    test('shows and hides QrReader on button click', () => {
        render(
            <Layout>
                <div>Children Content</div>
            </Layout>
        );

        const button = screen.getByText('QR Code scannen');

        expect(screen.queryByText('QrReader Mock')).toBeNull();
        fireEvent.click(button);
        expect(screen.getByText('QrReader Mock')).toBeInTheDocument();
        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton);
        expect(screen.queryByText('QrReader Mock')).toBeNull();
    });

});
