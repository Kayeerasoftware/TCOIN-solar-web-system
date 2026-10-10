export interface MenuItem { label: string; to: string; permission?: string; children?: MenuItem[] }

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
  { label: 'Quotes', to: '/portal/quotes' },
  { label: 'Projects', to: '/portal/projects' },
  { label: 'My systems', to: '/portal/systems' },
  { label: 'Billing', to: '/portal/billing' },
  { label: 'Orders', to: '/portal/orders' },
  { label: 'Support', to: '/portal/support/new' },
  { label: 'Account', to: '/portal/account' },
];

export const consoleMenu: MenuItem[] = [
  { label: 'Home', to: '/console' },
  { label: 'Sales', to: '/console/leads', permission: 'leads.read', children: [
    { label: 'Leads', to: '/console/leads', permission: 'leads.read' },
    { label: 'Quotes', to: '/console/quotes', permission: 'quotes.write' },
  ] },
  { label: 'Design', to: '/console/surveys', permission: 'designs.write' },
  { label: 'Projects', to: '/console/projects', permission: 'projects.write', children: [
    { label: 'Project list', to: '/console/projects', permission: 'projects.write' },
    { label: 'Schedule', to: '/console/schedule', permission: 'projects.write' },
  ] },
  { label: 'Service', to: '/console/tickets', permission: 'tickets.write' },
  { label: 'Inventory', to: '/console/stock', permission: 'inventory.write', children: [
    { label: 'Stock register', to: '/console/stock', permission: 'inventory.write' },
    { label: 'Purchase orders', to: '/console/purchase-orders', permission: 'po.write' },
  ] },
  { label: 'Finance', to: '/console/invoices', permission: 'billing.write', children: [
    { label: 'Invoices', to: '/console/invoices', permission: 'billing.write' },
    { label: 'Reconciliation', to: '/console/reconciliation', permission: 'billing.write' },
  ] },
  { label: 'Documents', to: '/console/documents' },
  { label: 'Consultancy', to: '/console/consultancy/bookings' },
  { label: 'Reports', to: '/console/reports/pipeline', permission: 'reports.read' },
  { label: 'Admin', to: '/console/admin/settings', permission: 'admin.settings' },
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
