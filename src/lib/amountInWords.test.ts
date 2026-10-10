import { amountInWords, numberToWords } from './amountInWords';

describe('amountInWords', () => {
  it.each([
    [2900000, 'Two million nine hundred thousand shillings only'],
    [1450000, 'One million four hundred fifty thousand shillings only'],
    [810000, 'Eight hundred ten thousand shillings only'],
    [15670000, 'Fifteen million six hundred seventy thousand shillings only'],
    [0, 'Zero shillings only'],
    [21, 'Twenty-one shillings only'],
  ])('writes %i', (n, words) => expect(amountInWords(n)).toBe(words));

  it('adds cents for non-UGX currencies', () => {
    expect(amountInWords(12.5, 'USD')).toBe('Twelve US dollars and fifty cents only');
  });
  it('handles billions and rejects fractions', () => {
    expect(numberToWords(1_250_000_000)).toBe('one billion two hundred fifty million');
    expect(() => numberToWords(1.5)).toThrow();
  });
});
