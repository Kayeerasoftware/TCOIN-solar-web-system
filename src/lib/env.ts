import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000/api/v1'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_MAPS_KEY: z.string().optional(),
  VITE_ENABLE_MOCKS: z.enum(['true', 'false']).default('false'),
});

/** Validated environment. The app fails fast at startup if a variable is malformed. */
export const env = schema.parse(import.meta.env);
