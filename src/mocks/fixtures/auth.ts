import type { AuthUser } from '@/types/domain';

export const MOCK_STAFF_USER: AuthUser = {
  id: 'usr_staff_001',
  full_name: 'Alice Nakato',
  user_type: 'staff',
  customer_id: null,
  roles: ['admin'],
  permissions: [
    'reports.read',
    'quotes.read',
    'quotes.write',
    'orders.read',
    'orders.write',
    'crm.read',
    'crm.write',
    'leads.read',
    'leads.write',
    'designs.write',
    'projects.write',
    'inventory.write',
    'po.write',
    'billing.write',
    'billing.refund',
    'tickets.write',
    'receipts.issue',
    'vouchers.write',
    'delivery_notes.write',
    'letters.write',
    'documents.template_edit',
    'catalog.write',
    'admin.users',
    'admin.settings',
  ],
};

export const MOCK_CUSTOMER_USER: AuthUser = {
  id: 'usr_cust_001',
  full_name: 'Brian Ssemakula',
  user_type: 'customer',
  customer_id: 'cust_001',
  roles: ['customer'],
  permissions: ['portal.read'],
};

export const MOCK_TOKENS = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
};

export const MOCK_MFA_TOKENS = {
  ...MOCK_TOKENS,
  access_token: 'mock-access-token-mfa',
};

/** Credentials that trigger MFA flow */
export const MFA_TRIGGER_PASSWORD = 'mfa-required';

/** Map identifier → user for mock login */
export const MOCK_CREDENTIALS: Record<string, AuthUser> = {
  'staff@tcoin.ug': MOCK_STAFF_USER,
  admin: MOCK_STAFF_USER,
  'customer@tcoin.ug': MOCK_CUSTOMER_USER,
  customer: MOCK_CUSTOMER_USER,
};
