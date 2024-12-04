import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Für Router-Kontext
import QrReader from './QrReader';
import '@testing-library/jest-dom';
import QrScanner from "qr-scanner";

jest.mock('qr-scanner');

describe('QrReader Component', () => {
    test('renders without crashing', async () => {
        jest.spyOn(QrScanner.prototype, 'start').mockImplementation(() =>
            Promise.resolve()
        )
        const { container } = render(
            <BrowserRouter>
                <QrReader/>
            </BrowserRouter>
        );

        await waitFor(() => {
            const videoElement = container.querySelector('video');
            expect(videoElement).toBeInTheDocument();
        });
    });
});

