import { formatMoney, formatNumber, lineAmount, sumAmounts } from './money';

describe('money', () => {
  it('multiplies quantity by rate and rounds to 2 decimals', () => {
    expect(lineAmount(12, 420000)).toBe(5040000);
    expect(lineAmount(3, 0.1)).toBe(0.3);
  });
  it('sums amounts without float drift', () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sumAmounts([5040000, 6200000, 7000000, 900000, 2400000])).toBe(21540000);
  });
  it('formats numbers and money', () => {
    expect(formatNumber(2900000)).toBe('2,900,000');
    expect(formatMoney(2900000)).toBe('UGX 2,900,000');
    expect(formatMoney('12.5', 'USD')).toBe('USD 12.50');
  });
});
