import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  const linkElement = screen.getByText(/Knowledge Hub/i);
  expect(linkElement).toBeInTheDocument();
});
