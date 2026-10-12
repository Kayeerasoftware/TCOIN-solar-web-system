import { computeTotals, withAmounts } from './quoteMath';

describe('quoteMath', () => {
  const lines = [
    { particulars: 'Mono panel 550 W', unit: 'pc', quantity: 12, rate: 420000 },
    { particulars: 'Mounting kit', unit: 'set', quantity: 1, rate: 900000 },
  ];
  it('numbers lines and computes amounts', () => {
    expect(withAmounts(lines).map((l) => [l.line_no, l.amount])).toEqual([
      [1, 5040000],
      [2, 900000],
    ]);
  });
  it('totals with a percentage discount', () => {
    const t = computeTotals(lines, 5);
    expect(t.subtotal).toBe(5940000);
    expect(t.discount_amount).toBe(297000);
    expect(t.total).toBe(5643000);
    expect(t.amount_in_words).toBe('Five million six hundred forty-three thousand shillings only');
  });
  it('has no words for an empty quote', () => {
    expect(computeTotals([], 0).amount_in_words).toBe('');
  });
});
