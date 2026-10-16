export interface MenuItem {
  label: string;
  to: string;
  permission?: string;
  children?: MenuItem[];
}

export const publicMenu: MenuItem[] = [
  { label: 'Services', to: '/services/design' },
  { label: 'Calculator', to: '/calculator' },
  { label: 'Store', to: '/store' },
  { label: 'Projects', to: '/projects' },
  { label: 'Learn', to: '/learn' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const portalMenu: MenuItem[] = [
  { label: 'Dashboard', to: '/portal' },
  { label: 'Invoices & Quotes', to: '/portal/quotes' },
  { label: 'My Invoices', to: '/portal/invoices' },
  { label: 'Projects', to: '/portal/projects' },
  { label: 'My systems', to: '/portal/systems' },
  { label: 'Warranties', to: '/portal/warranties' },
  { label: 'Billing', to: '/portal/billing' },
  { label: 'Orders', to: '/portal/orders' },
  { label: 'Support', to: '/portal/support/new' },
  { label: 'Account', to: '/portal/account' },
  { label: 'Privacy', to: '/portal/privacy' },
];

export const consoleMenu: MenuItem[] = [
  { label: 'Home', to: '/console' },
  {
    label: 'Sales',
    to: '/console/leads',
    permission: 'leads.read',
    children: [
      { label: 'Leads', to: '/console/leads', permission: 'leads.read' },
      { label: 'Opportunities', to: '/console/opportunities', permission: 'leads.read' },
      { label: 'Quotes', to: '/console/quotes', permission: 'quotes.write' },
    ],
  },
  {
    label: 'Design',
    to: '/console/surveys',
    permission: 'designs.write',
    children: [
      { label: 'Site surveys', to: '/console/surveys', permission: 'designs.write' },
      { label: 'Designs', to: '/console/designs', permission: 'designs.write' },
    ],
  },
  {
    label: 'Projects',
    to: '/console/projects',
    permission: 'projects.write',
    children: [
      { label: 'Project list', to: '/console/projects', permission: 'projects.write' },
      { label: 'Schedule', to: '/console/schedule', permission: 'projects.write' },
    ],
  },
  {
    label: 'Service',
    to: '/console/tickets',
    permission: 'tickets.write',
    children: [
      { label: 'Ticket queue', to: '/console/tickets', permission: 'tickets.write' },
      { label: 'Work orders', to: '/console/work-orders', permission: 'tickets.write' },
      { label: 'Assets', to: '/console/assets', permission: 'tickets.write' },
      { label: 'Contracts', to: '/console/contracts', permission: 'tickets.write' },
      { label: 'Maintenance calendar', to: '/console/maintenance-calendar', permission: 'tickets.write' },
    ],
  },
  {
    label: 'Inventory',
    to: '/console/stock',
    permission: 'inventory.write',
    children: [
      { label: 'Stock register', to: '/console/stock', permission: 'inventory.write' },
      { label: 'Stock transfer', to: '/console/stock/transfer', permission: 'inventory.write' },
      { label: 'Movements', to: '/console/stock/movements', permission: 'inventory.write' },
      { label: 'Serial lookup', to: '/console/serials', permission: 'inventory.write' },
      { label: 'Warehouses', to: '/console/warehouses', permission: 'inventory.write' },
    ],
  },
  {
    label: 'Purchasing',
    to: '/console/purchase-orders',
    permission: 'po.write',
    children: [
      { label: 'Purchase orders', to: '/console/purchase-orders', permission: 'po.write' },
      { label: 'Goods receipts', to: '/console/goods-receipts', permission: 'inventory.write' },
      { label: 'Suppliers', to: '/console/suppliers', permission: 'po.write' },
    ],
  },
  {
    label: 'Finance',
    to: '/console/invoices',
    permission: 'billing.write',
    children: [
      { label: 'Invoices', to: '/console/invoices', permission: 'billing.write' },
      { label: 'Payments', to: '/console/payments', permission: 'billing.write' },
      { label: 'Receivables', to: '/console/receivables', permission: 'billing.write' },
      { label: 'Reconciliation', to: '/console/reconciliation', permission: 'billing.write' },
      { label: 'Credit notes', to: '/console/credit-notes', permission: 'billing.refund' },
    ],
  },
  { label: 'Documents', to: '/console/documents' },
  {
    label: 'Consultancy',
    to: '/console/consultancy/bookings',
    children: [
      { label: 'Bookings', to: '/console/consultancy/bookings' },
      { label: 'Services', to: '/console/consultancy/services' },
      { label: 'Engagements', to: '/console/consultancy/engagements' },
    ],
  },
  { label: 'Reports', to: '/console/reports/pipeline', permission: 'reports.read' },
  {
    label: 'Notifications',
    to: '/console/notifications',
    children: [
      { label: 'Inbox', to: '/console/notifications' },
      { label: 'Preferences', to: '/console/notifications/preferences' },
    ],
  },
  {
    label: 'Admin',
    to: '/console/admin/settings',
    permission: 'admin.settings',
    children: [
      { label: 'Settings', to: '/console/admin/settings', permission: 'admin.settings' },
      { label: 'Users', to: '/console/admin/users', permission: 'admin.users' },
      { label: 'Roles', to: '/console/admin/roles', permission: 'admin.users' },
      { label: 'Catalog', to: '/console/admin/catalog', permission: 'catalog.write' },
      { label: 'Price lists', to: '/console/admin/price-lists', permission: 'catalog.write' },
      { label: 'Templates', to: '/console/admin/templates', permission: 'documents.template_edit' },
      { label: 'Number series', to: '/console/admin/number-series', permission: 'admin.settings' },
      { label: 'Audit log', to: '/console/admin/audit-log', permission: 'admin.settings' },
    ],
  },
];

export const fieldTabs: MenuItem[] = [
  { label: 'Today', to: '/field' },
  { label: 'Sync', to: '/field/sync' },
];

/** Hide items the user cannot use (the API still enforces permissions). */
export function visibleItems(items: MenuItem[], has: (code: string) => boolean): MenuItem[] {
  return items
    .filter((i) => !i.permission || has(i.permission))
    .map((i) => (i.children ? { ...i, children: visibleItems(i.children, has) } : i));
}
