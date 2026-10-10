import { useCallback, useState, type ReactNode } from 'react';
import { ToastContext, type ToastTone } from './toastContext';

interface Toast { id: number; message: string; tone: ToastTone }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 print:hidden">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`rounded-md px-4 py-3 text-white shadow ${t.tone === 'success' ? 'bg-brand-green' : 'bg-brand-red'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
