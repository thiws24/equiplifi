import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from "react";
import Detail from "./Detail";

const mockData = {
    id: 2,
    photoUrl: '',
    name: 'Test Item',
    description: 'Test Description',
    icon: '📦',
    urn: 'mockUrn',
};

function mockFetch() {
    return jest.fn().mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => mockData,
        }),
    );
}


describe('Detail', () => {
    test('opens and closes modal when "Show QR-Code" button is clicked', () => {
        window.fetch = mockFetch();
        render(
            <BrowserRouter>
                <Detail />
            </BrowserRouter>
        );

        expect(screen.queryByText(/mockUrn/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Show QR-Code'));

        expect(screen.getByText('mockUrn')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Close'));

        expect(screen.queryByText('mockUrn')).not.toBeInTheDocument();
    });
});