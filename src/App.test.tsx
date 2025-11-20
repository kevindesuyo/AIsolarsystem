import { render, screen } from '@testing-library/react';
import App from './App';

test('renders mission board', () => {
  render(<App />);
  const missionBoard = screen.getByText(/ミッションボード/);
  expect(missionBoard).toBeInTheDocument();
});
