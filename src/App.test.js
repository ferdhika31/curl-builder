import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders curl command builder link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/curl command builder/i);
  expect(linkElement).toBeInTheDocument();
});
