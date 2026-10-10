import { render, screen } from '@testing-library/react';
import { LineItemTable } from './LineItemTable';
import { LINE_ITEM_HEADERS } from '@/config/documentOptions';
import type { LineItem } from '@/types/domain';

const items: LineItem[] = [
  { line_no: 1, particulars: 'Solar Lithium Iron Battery', specification: '24V 200AH 5kWh', quantity: 1, unit: 'pc', rate: 2900000, amount: 2900000 },
  { line_no: 2, particulars: 'Mounting kit', quantity: 2, unit: 'set', rate: 900000, amount: 1800000 },
];

describe('LineItemTable', () => {
  it('shows the eight standard headers in order', () => {
    render(<LineItemTable items={items} />);
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toEqual([...LINE_ITEM_HEADERS]);
  });
  it('totals the Amount column', () => {
    render(<LineItemTable items={items} />);
    expect(screen.getByText('4,700,000')).toBeInTheDocument();
  });
  it('appends extra columns after the standard eight', () => {
    render(<LineItemTable items={items} extraHeaders={['Reserved']} renderExtra={() => ['4']} />);
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers.slice(-2)).toEqual(['Amount (UGX)', 'Reserved']);
  });
  it('relabels currency in the headers', () => {
    render(<LineItemTable items={items} currency="USD" />);
    expect(screen.getByText('Rate (USD)')).toBeInTheDocument();
  });
});
