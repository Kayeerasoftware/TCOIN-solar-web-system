export const logger = {
  info: (...a: unknown[]) => import.meta.env.DEV && console.info(...a),
  warn: (...a: unknown[]) => console.warn(...a),
  error: (...a: unknown[]) => console.error(...a), // forward to Sentry in sentry.ts when configured
};
