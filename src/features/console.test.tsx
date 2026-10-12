import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LINE_ITEM_HEADERS } from '@/config/documentOptions';
import { renderApp, signInAs } from '@/tests/routerHelpers';

describe('dashboard', () => {
  it('shows the headline numbers and low stock', async () => {
    signInAs('admin');
    renderApp('/console');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Pipeline value')).toBeInTheDocument();
    expect(within(screen.getByText('Open quotes').parentElement!).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('UGX 2,900,000')).toBeInTheDocument();
    expect(screen.getByText('BAT-5K')).toBeInTheDocument();
    expect(screen.getByText('CBL-6')).toBeInTheDocument();
  });
});

describe('leads board', () => {
  it('moves a lead to another stage', async () => {
    signInAs('admin');
    renderApp('/console/leads');
    const newCol = await screen.findByRole('region', { name: 'New' });
    expect(within(newCol).getByText('M. Okello')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Move M. Okello'), 'contacted');
    const contacted = screen.getByRole('region', { name: 'Contacted' });
    expect(await within(contacted).findByText('M. Okello')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'New' })).queryByText('M. Okello')).toBeNull();
  });
});

describe('quotes', () => {
  it('lists quotes with their proforma numbers', async () => {
    signInAs('admin');
    renderApp('/console/quotes');
    expect(await screen.findByRole('link', { name: 'Proforma 0248' })).toBeInTheDocument();
    expect(await screen.findByText('Mr. Benjamin Patrick M')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Print' })).toHaveAttribute('href', '/print/proforma/q-0248');
  });

  it('builds a quote with catalog lines, totals, discount, and amount in words', async () => {
    signInAs('admin');
    renderApp('/console/quotes/new');
    await userEvent.selectOptions(await screen.findByLabelText('Customer'), 'c2');
    expect(screen.getByLabelText('To M/s (printed on the invoice)')).toHaveValue('Mukasa Ltd');
    await userEvent.selectOptions(screen.getByLabelText('Add from catalog'), 'v-pv550');
    const qty = screen.getByLabelText('Line 1 quantity');
    await userEvent.clear(qty);
    await userEvent.type(qty, '12');
    expect(screen.getAllByText('UGX 5,040,000')).toHaveLength(2);
    const discount = screen.getByLabelText('Discount (%)');
    await userEvent.clear(discount);
    await userEvent.type(discount, '5');
    expect(screen.getByText('UGX 4,788,000')).toBeInTheDocument();
    expect(
      screen.getByText('Four million seven hundred eighty-eight thousand shillings only'),
    ).toBeInTheDocument();
  });

  it('saves a draft and opens it', async () => {
    signInAs('admin');
    const { router } = renderApp('/console/quotes/new');
    await userEvent.selectOptions(await screen.findByLabelText('Customer'), 'c2');
    await userEvent.selectOptions(screen.getByLabelText('Add from catalog'), 'v-mnt');
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/console\/quotes\/q-\d+$/));
    expect(await screen.findByRole('heading', { name: 'QT-2026-000119' })).toBeInTheDocument();
  });

  it('issues a Proforma Invoice and opens the print view with the next number', async () => {
    signInAs('admin');
    const { router } = renderApp('/console/quotes/new');
    await userEvent.selectOptions(await screen.findByLabelText('Customer'), 'c1');
    await userEvent.selectOptions(screen.getByLabelText('Add from catalog'), 'v-bat5');
    await userEvent.click(screen.getByRole('button', { name: 'Issue Proforma Invoice' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/print\/proforma\//));
    expect(await screen.findByText('PROFORMA INVOICE')).toBeInTheDocument();
    expect(await screen.findByText('0249')).toBeInTheDocument();
    expect(screen.getByText('Two million nine hundred thousand shillings only')).toBeInTheDocument();
  });

  it('asks for a customer before issuing', async () => {
    signInAs('admin');
    renderApp('/console/quotes/new');
    await userEvent.click(await screen.findByRole('button', { name: 'Issue Proforma Invoice' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a customer.');
  });

  it('locks a quote that was issued as a Proforma Invoice', async () => {
    signInAs('admin');
    renderApp('/console/quotes/q-0248');
    expect(await screen.findByText(/can no longer be edited/)).toBeInTheDocument();
    expect(screen.getByLabelText('Line 1 quantity')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Issue Proforma Invoice' })).toBeNull();
  });
});

describe('Proforma Invoice print view (sample 0248)', () => {
  it('uses the eight standard columns and the TCOIN wording', async () => {
    signInAs('admin');
    renderApp('/print/proforma/q-0248');
    expect(await screen.findByText('PROFORMA INVOICE')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([...LINE_ITEM_HEADERS]);
    expect(screen.getByText('Two million nine hundred thousand shillings only')).toBeInTheDocument();
    expect(screen.getByText('KAYEERA NATHAN')).toBeInTheDocument();
    expect(screen.getByText('All rates are valid for 30 days')).toBeInTheDocument();
    expect(screen.getByText('E&OE')).toBeInTheDocument();
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
    expect(screen.getByText('Quotation for the Solar Lithium Phosphate battery')).toBeInTheDocument();
    expect(screen.getByText('CENTER OF INNOVATIONS')).toBeInTheDocument();
  });
});

describe('receipts', () => {
  const fillCorporate = async () => {
    await userEvent.type(await screen.findByLabelText('Received from'), 'Mr. Benjamin Patrick M');
    await userEvent.type(screen.getByLabelText('Amount (UGX)'), '1450000');
    await userEvent.type(screen.getByLabelText('Being payment of'), '50% deposit on Proforma Invoice 0248');
  };

  it('issues a corporate receipt and shows the amount in words as you type', async () => {
    signInAs('admin');
    const { router } = renderApp('/console/documents/receipt/new');
    await fillCorporate();
    expect(screen.getByText('One million four hundred fifty thousand shillings only')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Issue receipt' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/print\/receipt\//));
    expect(await screen.findByText('RECEIPT')).toBeInTheDocument();
    expect(screen.getByText('0001')).toBeInTheDocument();
    expect(screen.getByText('50% deposit on Proforma Invoice 0248')).toBeInTheDocument();
    expect(screen.getByText('KAYEERA NATHAN')).toBeInTheDocument();
  });

  it('requires an amount and, for cheques, the cheque number', async () => {
    signInAs('admin');
    renderApp('/console/documents/receipt/new');
    await userEvent.type(await screen.findByLabelText('Received from'), 'Green School');
    await userEvent.selectOptions(screen.getByLabelText('Payment method'), 'cheque');
    await userEvent.click(screen.getByRole('button', { name: 'Issue receipt' }));
    expect(await screen.findByText('Enter the cheque number')).toBeInTheDocument();
    expect(screen.getByText('Enter an amount greater than zero')).toBeInTheDocument();
  });

  it('issues a cash / sales receipt with item lines and the disclaimer', async () => {
    signInAs('admin');
    const { router } = renderApp('/console/documents/receipt/new');
    await userEvent.type(await screen.findByLabelText('Received from'), 'Walk-in customer');
    await userEvent.click(screen.getByLabelText(/Cash \/ sales receipt/));
    await userEvent.type(screen.getByLabelText('Item 1 particulars'), 'MC4 connector pairs');
    const qty = screen.getByLabelText('Item 1 quantity');
    await userEvent.clear(qty);
    await userEvent.type(qty, '2');
    const rate = screen.getByLabelText('Item 1 rate');
    await userEvent.clear(rate);
    await userEvent.type(rate, '15000');
    expect(screen.getByText('Total UGX 30,000')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Issue receipt' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/print\/receipt\//));
    expect(await screen.findByText('Cash / Sales Receipt')).toBeInTheDocument();
    expect(screen.getByText('MC4 connector pairs')).toBeInTheDocument();
    expect(screen.getByText(/Goods once sold are not returned/)).toBeInTheDocument();
    expect(screen.getByText('Thirty thousand shillings only')).toBeInTheDocument();
  });

  it('needs at least one item for a cash / sales receipt', async () => {
    signInAs('admin');
    renderApp('/console/documents/receipt/new');
    await userEvent.type(await screen.findByLabelText('Received from'), 'Walk-in customer');
    await userEvent.click(screen.getByLabelText(/Cash \/ sales receipt/));
    await userEvent.click(screen.getByRole('button', { name: 'Issue receipt' }));
    expect(await screen.findByText('Add at least one item')).toBeInTheDocument();
  });
});

describe('documents centre and permissions', () => {
  it('lists proforma invoices and shows an empty state for receipts', async () => {
    signInAs('admin');
    renderApp('/console/documents');
    expect(await screen.findByText('Proforma invoices')).toBeInTheDocument();
    expect(await screen.findByText('0248')).toBeInTheDocument();
    expect(await screen.findByText('No receipts yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New receipt' })).toHaveAttribute(
      'href',
      '/console/documents/receipt/new',
    );
  });
  it('lets finance issue receipts but not edit quotes', async () => {
    signInAs('finance');
    renderApp('/console/documents/receipt/new');
    expect(await screen.findByRole('heading', { name: 'New receipt' })).toBeInTheDocument();
  });
  it('blocks finance from quotes', async () => {
    signInAs('finance');
    renderApp('/console/quotes');
    expect(await screen.findByText('Not permitted')).toBeInTheDocument();
  });
});
