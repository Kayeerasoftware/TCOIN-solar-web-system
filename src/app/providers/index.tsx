import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { I18nProvider } from './I18nProvider';
import { OfflineProvider } from './OfflineProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <QueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <OfflineProvider>{children}</OfflineProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
