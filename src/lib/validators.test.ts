import { ugandaPhone } from './validators';

describe('ugandaPhone', () => {
  it('accepts international and local formats', () => {
    expect(ugandaPhone.safeParse('+256 779 116 709').success).toBe(true);
    expect(ugandaPhone.safeParse('0779116709').success).toBe(true);
  });
  it('rejects short numbers', () => {
    expect(ugandaPhone.safeParse('12345').success).toBe(false);
  });
});
