import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom';
import { publicRoutes } from '@/app/router/routes.public';
import { portalRoutes } from '@/app/router/routes.portal';
import { consoleRoutes } from '@/app/router/routes.console';
import { fieldRoutes } from '@/app/router/routes.field';
import { printRoutes } from '@/app/router/routes.print';
import { useAuthStore } from '@/store/authStore';

export const allRoutes: RouteObject[] = [
  ...publicRoutes,
  portalRoutes,
  consoleRoutes,
  fieldRoutes,
  printRoutes,
];

/** Renders the real route tree at a path, as the app does (lazy pages, layouts, guards). */
export function renderApp(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(allRoutes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...utils, router };
}

export function signInAs(kind: 'admin' | 'customer' | 'finance') {
  const users = {
    admin: {
      id: 'u-admin',
      full_name: 'Kayeera Nathan',
      user_type: 'staff' as const,
      customer_id: null,
      roles: ['admin'],
    },
    customer: {
      id: 'u-sarah',
      full_name: 'Sarah N.',
      user_type: 'customer' as const,
      customer_id: 'c1',
      roles: ['customer'],
    },
    finance: {
      id: 'u-mfa',
      full_name: 'MFA Officer',
      user_type: 'staff' as const,
      customer_id: null,
      roles: ['finance'],
    },
  };
  const perms = {
    admin: [
      'leads.read',
      'leads.write',
      'quotes.write',
      'designs.write',
      'projects.write',
      'inventory.write',
      'po.write',
      'billing.write',
      'tickets.write',
      'reports.read',
      'admin.users',
      'admin.settings',
      'catalog.write',
      'receipts.issue',
      'field.execute',
    ],
    customer: [],
    finance: ['billing.write', 'reports.read', 'receipts.issue'],
  };
  useAuthStore
    .getState()
    .setSession(
      { ...users[kind], permissions: perms[kind] },
      `mock-access-${users[kind].id}`,
      `mock-refresh-${users[kind].id}`,
    );
}
