import { useEffect, type ReactNode } from 'react';
import { useUiStore } from '@/store/uiStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => { document.documentElement.dataset.theme = theme === 'system' ? '' : theme; }, [theme]);
  return <>{children}</>;
}
