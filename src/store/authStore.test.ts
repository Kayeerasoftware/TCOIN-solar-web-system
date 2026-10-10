import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().clear());
  it('checks permissions from the signed-in user', () => {
    useAuthStore.getState().setSession(
      { id: '1', full_name: 'A', user_type: 'staff', customer_id: null, roles: ['sales'], permissions: ['quotes.write'] },
      'a', 'r',
    );
    expect(useAuthStore.getState().hasPermission('quotes.write')).toBe(true);
    expect(useAuthStore.getState().hasPermission('billing.refund')).toBe(false);
  });
  it('clears everything on sign out', () => {
    useAuthStore.getState().setTokens('a', 'r');
    useAuthStore.getState().clear();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
