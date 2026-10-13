import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/tests/routerHelpers';

describe('home front screen', () => {
  afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error remove the matchMedia stub added by a test
    delete window.matchMedia;
  });

  it('shows SOLAR DEPT as the main heading', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'SOLAR DEPT' })).toBeInTheDocument();
    expect(screen.getByText('TCOIN Center of Innovations')).toBeInTheDocument();
  });

  it('shows seven project photos (boxes 1 to 7) plus a hidden copy for the seamless loop', async () => {
    renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'SOLAR DEPT' });
    const tiles = screen.getAllByTestId('project-tile');
    const clones = screen.getAllByTestId('project-tile-clone');
    expect(tiles).toHaveLength(7);
    expect(clones).toHaveLength(7);
    clones.forEach((c) => expect(c).toHaveAttribute('aria-hidden', 'true'));
    expect(new Set(tiles.map((t) => t.querySelector('img')!.getAttribute('src'))).size).toBe(7);
  });

  it('shows the AI image placeholder (box 8) when the image file is missing', async () => {
    renderApp('/');
    const img = await screen.findByAltText(/Completed TCOIN Solar system/);
    expect(screen.queryByText('AI-generated completed solar system')).toBeNull();
    fireEvent.error(img);
    expect(await screen.findByText('AI-generated completed solar system')).toBeInTheDocument();
    expect(screen.getByText('public/hero/ai-solar-system.jpg')).toBeInTheDocument();
    expect(screen.getByText(/Uganda's #1 Solar Company/)).toBeInTheDocument();
  });

  it('shows the words of box 9 one after another in the same place', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    renderApp('/');
    const box = await screen.findByRole('group', { name: 'What TCOIN Solar offers' });
    expect(box).toHaveTextContent('POWERYOURFUTUREWITHSOLAR');
    expect(box).toHaveTextContent(/one expert team in Kampala/);
    act(() => {
      vi.advanceTimersByTime(4300);
    });
    expect(box).toHaveTextContent('SYSTEMDESIGN');
    expect(box).toHaveTextContent(/priced bill of materials/);
    expect(
      screen.getAllByRole('heading', { level: 2 }).filter((h) => h.className.includes('th-words')),
    ).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4200 * 5);
    });
    expect(box).toHaveTextContent('POWERYOURFUTUREWITHSOLAR'); // wraps around to the first message
  });

  it('lets the visitor jump to any message with the dots', async () => {
    renderApp('/');
    await userEvent.click(await screen.findByRole('button', { name: 'Show message 6 of 6' }));
    expect(screen.getByRole('group', { name: 'What TCOIN Solar offers' })).toHaveTextContent(
      'SOLARCOMPONENTS',
    );
    expect(screen.getByRole('button', { name: 'Show message 6 of 6' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('does not rotate the words for people who prefer reduced motion', async () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as never;
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    renderApp('/');
    const box = await screen.findByRole('group', { name: 'What TCOIN Solar offers' });
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(box).toHaveTextContent('POWERYOURFUTUREWITHSOLAR');
  });

  it('keeps the calculator working: presets, display, and hand-off to the calculator page', async () => {
    const { router } = renderApp('/');
    const input = await screen.findByLabelText('Monthly electricity bill in UGX');
    await userEvent.click(screen.getByRole('button', { name: '150k' }));
    expect(input).toHaveValue('150000');
    expect(screen.getByText('150,000')).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '450000');
    await userEvent.click(screen.getByRole('button', { name: 'Calculate Savings | System Size | Cost' }));
    await waitFor(() => expect(router.state.location.search).toBe('?bill=450000'));
    expect(await screen.findByLabelText('Monthly electricity bill (UGX)')).toHaveValue('450000');
  });

  it('keeps the call-to-action buttons on the front screen', async () => {
    renderApp('/');
    expect(await screen.findByRole('link', { name: 'Get Free Estimate →' })).toHaveAttribute(
      'href',
      '/calculator',
    );
    expect(screen.getByRole('link', { name: 'Shop Components' })).toHaveAttribute('href', '/store');
    expect(screen.getByText('5-year warranty')).toBeInTheDocument();
  });

  it('still renders the content below the front screen', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: /Everything solar,\s*under one roof/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('The TCOIN difference')).toBeInTheDocument();
  });
});
