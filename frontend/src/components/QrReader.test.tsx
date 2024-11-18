import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom'; // Für Router-Kontext
import QrReader from './QrReader';
import '@testing-library/jest-dom';

jest.mock('qr-scanner', () => {
    return jest.fn().mockImplementation(() => ({
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn(),
    }));
});

describe('QrReader Component', () => {
    test('renders without crashing', async () => {
        render(
            <BrowserRouter>
                <QrReader/>
            </BrowserRouter>
        );

        await waitFor(() => {
            const videoElement = screen.getByRole('video');
            expect(videoElement).toBeInTheDocument();
        });
    });
});

