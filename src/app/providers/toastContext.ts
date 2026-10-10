import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error';
export type PushToast = (message: string, tone?: ToastTone) => void;

export const ToastContext = createContext<PushToast>(() => undefined);
export const useToast = () => useContext(ToastContext);
