/** Permission codes. Keep in sync with identity.permission seeds in schema.sql. */
export const PERMISSIONS = [
  'leads.read','leads.write','quotes.write','quotes.approve_discount','designs.write','catalog.write',
  'inventory.write','inventory.approve_adjustment','po.write','po.approve','projects.write','field.execute',
  'tickets.write','billing.write','billing.refund','reports.read','admin.users','admin.settings',
  'documents.sign','documents.template_edit','receipts.issue','receipts.void','vouchers.write','vouchers.approve',
  'delivery_notes.write','letters.write',
] as const;
export type Permission = (typeof PERMISSIONS)[number];
