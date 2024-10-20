import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from './App';

describe('App Tests', () => {
  test('renders the AG Grid table', async () => {
    const { container } = render(<App/>)
    expect(container.querySelector('.ag-root')).not.toBeNull()
  });

  test('renders 10 elements in the table body', async () => {
    const { container } = render(<App/>)
    await waitFor(async() => {
      const elements = container?.querySelector('.ag-body')?.querySelectorAll('[role="row"]')
      expect(elements?.length).toBe(10)
    }, {
      timeout: 3000,
    })
  })
})