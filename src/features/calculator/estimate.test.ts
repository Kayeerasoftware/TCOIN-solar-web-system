import { SizingInputError } from '@/sizing';
import { PRESET_APPLIANCES, peakSunHours, runEstimate } from './estimate';

describe('runEstimate', () => {
  it('sizes a system from a monthly bill', () => {
    const r = runEstimate({
      mode: 'bill',
      monthlyBill: 450000,
      appliances: [],
      district: 'Kampala',
      systemType: 'hybrid',
    });
    expect(r.arrayKwp).toBeGreaterThan(1);
    expect(r.batteryKwh).toBeGreaterThan(0);
    expect(r.priceHigh).toBeGreaterThan(r.priceLow);
    expect(r.disclaimer).toMatch(/site survey/);
  });
  it('has no battery for an on-grid system', () => {
    expect(
      runEstimate({
        mode: 'bill',
        monthlyBill: 450000,
        appliances: [],
        district: 'Gulu',
        systemType: 'on_grid',
      }).batteryKwh,
    ).toBe(0);
  });
  it('sizes from an appliance list', () => {
    const r = runEstimate({
      mode: 'appliances',
      appliances: PRESET_APPLIANCES,
      district: 'Kampala',
      systemType: 'off_grid',
    });
    expect(r.dailyWh).toBeGreaterThan(2000);
  });
  it('rejects an empty energy source', () => {
    expect(() =>
      runEstimate({
        mode: 'bill',
        monthlyBill: 0,
        appliances: [],
        district: 'Kampala',
        systemType: 'on_grid',
      }),
    ).toThrow(SizingInputError);
  });
  it('falls back to 5 sun hours for an unknown district', () => {
    expect(peakSunHours('Nowhere')).toBe(5);
  });
});
