import { consoleMenu, visibleItems } from './navigation';

describe('visibleItems', () => {
  it('hides items the user lacks permission for', () => {
    const labels = visibleItems(consoleMenu, (c) => c === 'quotes.write' || c === 'leads.read').map((i) => i.label);
    expect(labels).toContain('Sales');
    expect(labels).not.toContain('Finance');
    expect(labels).not.toContain('Admin');
  });
  it('filters children too', () => {
    const sales = visibleItems(consoleMenu, (c) => c === 'leads.read').find((i) => i.label === 'Sales');
    expect(sales?.children?.map((c) => c.label)).toEqual(['Leads']);
  });
});
