import type { RouteObject } from 'react-router-dom';
import { FieldLayout } from '@/app/layouts/FieldLayout';
import { RequireAuth } from './guards';
import { page } from './helpers';

export const fieldRoutes: RouteObject = {
  path: '/field',
  element: (
    <RequireAuth userType="staff" permission="field.execute">
      <FieldLayout />
    </RequireAuth>
  ),
  children: [
  { index: true, ...page(() => import('@/features/field/pages/Today')) },
  { path: 'jobs/:id', ...page(() => import('@/features/field/pages/JobDetail')) },
  { path: 'jobs/:id/checklist', ...page(() => import('@/features/field/pages/Checklist')) },
  { path: 'jobs/:id/parts', ...page(() => import('@/features/field/pages/Parts')) },
  { path: 'jobs/:id/commissioning', ...page(() => import('@/features/field/pages/Commissioning')) },
  { path: 'jobs/:id/sign-off', ...page(() => import('@/features/field/pages/SignOff')) },
  { path: 'sync', ...page(() => import('@/features/field/pages/SyncStatus')) },
  ],
};
