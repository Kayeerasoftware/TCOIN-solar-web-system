import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import { Providers } from '@/app/providers';
import { initSentry } from '@/lib/sentry';
import '@/styles/globals.css';

initSentry();

async function start() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    try {
      const { worker } = await import('@/mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch (error) {
      console.error('Mock service worker failed to start; continuing without mocks.', error);
    }
  }
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>,
  );
}

void start();
