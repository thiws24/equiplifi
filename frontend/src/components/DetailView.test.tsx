import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DetailView } from './DetailView'; // Achte darauf, dass du den richtigen Pfad importierst

const mockData = {
    id: 2,
    photoUrl: '',
    name: 'Test Item',
    description: 'Test Description',
    icon: '📦',
    urn: 'mockUrn',
};

describe('DetailView', () => {
    test('opens and closes modal when "Show QR-Code" button is clicked', () => {
        render(
            <BrowserRouter>
                <DetailView {...mockData} />
            </BrowserRouter>
        );

        expect(screen.queryByText(/mockUrn/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Show QR-Code'));

        expect(screen.getByText('mockUrn')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Close'));

        expect(screen.queryByText('mockUrn')).not.toBeInTheDocument();
    });
});