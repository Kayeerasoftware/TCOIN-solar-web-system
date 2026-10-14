import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { StoreLayout } from '@/app/layouts/StoreLayout';
import { page } from './helpers';

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, ...page(() => import('@/features/public-site/pages/Home')) },
      { path: 'services/design', ...page(() => import('@/features/public-site/pages/ServiceDesign')) },
      { path: 'services/installation', ...page(() => import('@/features/public-site/pages/ServiceInstall')) },
      {
        path: 'services/maintenance',
        ...page(() => import('@/features/public-site/pages/ServiceMaintenance')),
      },
      {
        path: 'services/consultancy',
        ...page(() => import('@/features/public-site/pages/ServiceConsultancy')),
      },
      { path: 'projects', ...page(() => import('@/features/public-site/pages/Portfolio')) },
      { path: 'about', ...page(() => import('@/features/public-site/pages/About')) },
      { path: 'faq', ...page(() => import('@/features/public-site/pages/Faq')) },
      { path: 'learn', ...page(() => import('@/features/public-site/pages/Learn')) },
      { path: 'contact', ...page(() => import('@/features/public-site/pages/Contact')) },
      { path: 'legal', ...page(() => import('@/features/public-site/pages/Legal')) },
      { path: 'calculator', ...page(() => import('@/features/calculator/pages/CalculatorSteps')) },
      { path: 'calculator/results', ...page(() => import('@/features/calculator/pages/CalculatorResults')) },
      { path: 'verify/:code', ...page(() => import('@/features/documents/pages/VerifyDocument')) },
    ],
  },
  {
    element: <StoreLayout />,
    children: [
      { path: 'store', ...page(() => import('@/features/store/pages/StoreListing')) },
      { path: 'store/:slug', ...page(() => import('@/features/store/pages/ProductDetail')) },
      { path: 'cart', ...page(() => import('@/features/store/pages/Cart')) },
      { path: 'checkout', ...page(() => import('@/features/store/pages/Checkout')) },
      { path: 'orders/:id/confirmation', ...page(() => import('@/features/store/pages/OrderConfirmation')) },
      { path: 'orders/:id/tracking', ...page(() => import('@/features/store/pages/OrderTracking')) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', ...page(() => import('@/features/auth/pages/Login')) },
      { path: 'otp', ...page(() => import('@/features/auth/pages/OtpVerify')) },
      { path: 'mfa', ...page(() => import('@/features/auth/pages/MfaVerify')) },
      { path: 'forgot-password', ...page(() => import('@/features/auth/pages/ForgotPassword')) },
    ],
  },
];
