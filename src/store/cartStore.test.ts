import { useCartStore } from './cartStore';

const line = { variant_id: 'v1', sku: 'PV-550', name: 'Mono panel 550 W', unit_price: 420000, quantity: 1 };

describe('cartStore', () => {
  beforeEach(() => useCartStore.getState().clear());
  it('merges the same variant', () => {
    useCartStore.getState().add(line);
    useCartStore.getState().add(line);
    expect(useCartStore.getState().lines[0].quantity).toBe(2);
  });
  it('never lets quantity drop below 1', () => {
    useCartStore.getState().add(line);
    useCartStore.getState().setQuantity('v1', 0);
    expect(useCartStore.getState().lines[0].quantity).toBe(1);
  });
});
