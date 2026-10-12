import type { RouteObject } from 'react-router-dom';
import { PrintLayout } from '@/app/layouts/PrintLayout';
import { RequireAuth } from './guards';
import { page } from './helpers';

/** Print-only pages: no menus, paper-sized frames. Used by the TCOIN documents. */
export const printRoutes: RouteObject = {
  path: '/print',
  element: (
    <RequireAuth userType="staff">
      <PrintLayout />
    </RequireAuth>
  ),
  children: [
    { path: 'proforma/:id', ...page(() => import('@/features/documents/pages/ProformaPrint')) },
    { path: 'receipt/:id', ...page(() => import('@/features/documents/pages/ReceiptPrint')) },
  ],
};
