import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ShopAbhi brand name', () => {
  render(<App />);
  const brandElement = screen.getByText(/ShopAbhi/i);
  expect(brandElement).toBeInTheDocument();
});
