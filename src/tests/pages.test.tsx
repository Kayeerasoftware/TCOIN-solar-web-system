import { screen } from '@testing-library/react';
import Home from '@/features/public-site/pages/Home';
import { renderWithProviders } from './test-utils';

describe('page stubs', () => {
  it('render their title until the screen is built', () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
