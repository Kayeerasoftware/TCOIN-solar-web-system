import type { RouteObject } from 'react-router-dom';
import { PortalLayout } from '@/app/layouts/PortalLayout';
import { RequireAuth } from './guards';
import { page } from './helpers';

export const portalRoutes: RouteObject = {
  path: '/portal',
  element: (
    <RequireAuth userType="customer">
      <PortalLayout />
    </RequireAuth>
  ),
  children: [
  { index: true, ...page(() => import('@/features/portal/pages/Dashboard')) },
  { path: 'quotes', ...page(() => import('@/features/portal/pages/Quotes')) },
  { path: 'quotes/:id', ...page(() => import('@/features/portal/pages/QuoteViewer')) },
  { path: 'projects', ...page(() => import('@/features/portal/pages/Projects')) },
  { path: 'projects/:id', ...page(() => import('@/features/portal/pages/ProjectTimeline')) },
  { path: 'systems', ...page(() => import('@/features/portal/pages/MySystems')) },
  { path: 'warranties', ...page(() => import('@/features/portal/pages/Warranties')) },
  { path: 'billing', ...page(() => import('@/features/portal/pages/Billing')) },
  { path: 'orders', ...page(() => import('@/features/portal/pages/Orders')) },
  { path: 'support/new', ...page(() => import('@/features/portal/pages/RaiseTicket')) },
  { path: 'support/:id', ...page(() => import('@/features/portal/pages/TicketThread')) },
  { path: 'account', ...page(() => import('@/features/portal/pages/Account')) },
  { path: 'privacy', ...page(() => import('@/features/portal/pages/Privacy')) },
  ],
};
