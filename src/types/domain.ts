export type UserType = 'staff' | 'customer';
export type CurrencyCode = 'UGX' | 'USD' | 'KES' | 'EUR';

/** Standard line-item columns used by quotes, BOM, stock, purchase orders, cart (TCOIN proforma columns). */
export interface LineItem {
  line_no: number;
  particulars: string;
  specification?: string;
  image_url?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface AuthUser {
  id: string;
  full_name: string;
  avatar?: string | null;
  user_type: UserType;
  customer_id: string | null;
  roles: string[];
  permissions: string[];
}

export interface CompanyProfile {
  company: string;
  legal_name: string;
  division: string;
  division_short: string;
  tagline: string;
  address: string;
  po_box: string;
  tel: string;
  mobile: string;
  hotlines: string[];
  email: string;
  web: string;
  what_we_do: string[];
}
