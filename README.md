# TCOIN SOLAR UG: Front-end

React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, Vitest, Playwright. Implements the screens in the TCOIN SOLAR UG specification (public site and store, customer portal, staff console, technician app, and the six TCOIN print documents).

## Start

```bash
nvm use            # Node 20
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

Set `VITE_ENABLE_MOCKS=true` to run against Mock Service Worker handlers instead of the backend.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run generate:api` | Regenerate API types from `openapi/openapi.yaml` |

## Where things are

- `src/app`: providers, router (lazy routes per area), layouts
- `src/features`: one folder per business capability
- `src/components`: design system, line-item table, brand, print, feedback
- `src/api`: client, errors, query keys, endpoint wrappers, generated types
- `src/offline`: IndexedDB queue and sync for the technician app
- `src/sizing`: the shared sizing engine
- `docs/`: architecture, conventions, ADRs, and `screen-map.md` (every route and the design it implements)

## Brand

Green #1D6434, indigo #3B3A93, red #ED1C24, brown #5A3114, accent #F5A623 (see `tailwind.config.ts`). The logo and favicon are in `public/brand`. Company details come from `/company-profile`, with a fallback in `src/config/companyProfile.ts`.

## Status

Scaffold: configuration, shared code with tests, every route, layouts, offline engine, and a stub for each page. Build screens page by page using `docs/screen-map.md`.
