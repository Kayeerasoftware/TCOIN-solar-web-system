import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { NotFound } from '@/components/feedback/NotFound';
import { publicRoutes } from './routes.public';
import { portalRoutes } from './routes.portal';
import { consoleRoutes } from './routes.console';
import { fieldRoutes } from './routes.field';
import { printRoutes } from './routes.print';

const router = createBrowserRouter([
  ...publicRoutes,
  portalRoutes,
  consoleRoutes,
  fieldRoutes,
  printRoutes,
  { path: '*', element: <NotFound /> },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
