import { screen } from '@testing-library/react';
import Learn from '@/features/public-site/pages/Learn';
import { renderWithProviders } from './test-utils';

describe('page stubs', () => {
  it('render their title until the screen is built', () => {
    renderWithProviders(<Learn />);
    expect(screen.getByRole('heading', { name: 'Learn' })).toBeInTheDocument();
  });
});
