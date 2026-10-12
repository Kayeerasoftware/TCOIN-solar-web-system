import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/tests/routerHelpers';

describe('home', () => {
  it('shows the headline, services, and company details', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { name: /Reliable solar for your home or business/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Design' })).toHaveAttribute('href', '/services/design');
    expect(screen.getAllByText(/Solar designs, inspection, installation/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TCOIN SOLAR UG/).length).toBeGreaterThan(0);
  });
  it('carries the quick bill into the calculator', async () => {
    const { router } = renderApp('/');
    const box = await screen.findByLabelText('Monthly electricity bill (UGX)');
    await userEvent.clear(box);
    await userEvent.type(box, '600000');
    await userEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    await waitFor(() => expect(router.state.location.search).toBe('?bill=600000'));
    expect(await screen.findByLabelText('Monthly electricity bill (UGX)')).toHaveValue('600000');
  });
});

describe('calculator', () => {
  it('goes from a bill to an estimate and captures a lead', async () => {
    renderApp('/calculator?bill=450000');
    await userEvent.click(await screen.findByRole('button', { name: 'See my estimate' }));
    expect(await screen.findByRole('heading', { name: 'Your estimate' })).toBeInTheDocument();
    expect(screen.getByText(/kWp solar/)).toBeInTheDocument();
    expect(screen.getByText(/site survey/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Your name'), 'Test Visitor');
    await userEvent.type(screen.getByLabelText('Phone'), '+256 700 000 001');
    await userEvent.click(screen.getByRole('button', { name: 'Send me the detailed quote' }));
    expect(await screen.findByText(/Your reference is LD-2026-000105/)).toBeInTheDocument();
  });
  it('asks for a bill before estimating', async () => {
    renderApp('/calculator');
    await userEvent.click(await screen.findByRole('button', { name: 'See my estimate' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter your monthly electricity bill');
  });
  it('sizes from appliances using quick-add', async () => {
    renderApp('/calculator');
    await userEvent.click(await screen.findByLabelText('Appliance list'));
    await userEvent.click(screen.getByRole('button', { name: '+ Fridge' }));
    await userEvent.click(screen.getByRole('button', { name: 'See my estimate' }));
    expect(await screen.findByRole('heading', { name: 'Your estimate' })).toBeInTheDocument();
  });
  it('sends people without answers back to the calculator', async () => {
    const { router } = renderApp('/calculator/results');
    await waitFor(() => expect(router.state.location.pathname).toBe('/calculator'));
  });
  it('requires a phone or an email for the lead', async () => {
    renderApp('/calculator?bill=450000');
    await userEvent.click(await screen.findByRole('button', { name: 'See my estimate' }));
    await userEvent.type(await screen.findByLabelText('Your name'), 'No Contact');
    await userEvent.click(screen.getByRole('button', { name: 'Send me the detailed quote' }));
    expect(await screen.findByText('Give a phone number or an email address')).toBeInTheDocument();
  });
});

describe('service pages, contact, about, FAQ', () => {
  it.each([
    ['/services/design', 'Solar design'],
    ['/services/installation', 'Installation'],
    ['/services/maintenance', 'Maintenance plans'],
    ['/services/consultancy', 'Consultancy'],
  ])('%s shows its steps', async (path, title) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a quote' })).toBeInTheDocument();
  });
  it('submits the quote request form', async () => {
    renderApp('/contact');
    await userEvent.type(await screen.findByLabelText('Full name'), 'Jane Visitor');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText(/LD-2026-000105/)).toBeInTheDocument();
  });
  it('shows a message when neither phone nor email is given', async () => {
    renderApp('/contact');
    await userEvent.type(await screen.findByLabelText('Full name'), 'Jane Visitor');
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText('Give a phone number or an email address')).toBeInTheDocument();
  });
  it('lists what TCOIN does on the about page', async () => {
    renderApp('/about');
    const list = within(
      await screen
        .findByRole('heading', { name: /About TCOIN SOLAR UG/ })
        .then((h) => h.parentElement as HTMLElement),
    );
    expect(list.getByText(/Supply of electronics appliances/)).toBeInTheDocument();
  });
  it('opens FAQ answers', async () => {
    renderApp('/faq');
    expect(await screen.findByText('How long is a quote valid?')).toBeInTheDocument();
    expect(screen.getByText(/valid for 30 days/)).toBeInTheDocument();
  });
});
