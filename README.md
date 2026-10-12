# TCOIN SOLAR UG: Front-end

React 18, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, Vitest, Playwright. Implements the screens in the TCOIN SOLAR UG specification (public site and store, customer portal, staff console, technician app, and the six TCOIN print documents).

## Start

```bash
nvm use            # Node 20
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

### Run without a backend (demo mode)

```bash
npm run dev:mock
```

This runs the app against an in-memory mock of the API (`src/mocks`), so every built screen works before the backend exists. Data resets on reload.

| Sign in as              | Credentials                                                                          | Notes                                          |
| ----------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Admin (all permissions) | `admin@tcoinug.com` / `Admin@123`                                                    | Kayeera Nathan; the name printed as signatory  |
| Finance (limited)       | `mfa@tcoinug.com` / `Admin@123`, then code `123456`                                  | Shows two-step sign-in and permission blocking |
| Customer                | `sarah@example.com` / `Customer@123`, or phone `+256 700 111 222` with code `123456` | The portal screens are still stubs             |

Try: calculator, then lead capture; sign in as admin, then Quotes, build a quote from the catalog, Issue Proforma Invoice (next number 0249), Documents, New receipt.

## Scripts

| Command                              | What it does                                     |
| ------------------------------------ | ------------------------------------------------ |
| `npm run dev`                        | Start the dev server                             |
| `npm run build`                      | Typecheck and build to `dist/`                   |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript                            |
| `npm test`                           | Unit and component tests (Vitest)                |
| `npm run test:e2e`                   | End-to-end tests (Playwright)                    |
| `npm run generate:api`               | Regenerate API types from `openapi/openapi.yaml` |

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

Built and tested: sign-in (password, phone code, two-step), route guards, public home, service pages, solar calculator with lead capture, contact, about, FAQ, dashboard, leads board, quote list, quote builder with editable eight-column table, Proforma Invoice (screen and print), corporate and cash / sales receipts (screen and print), documents centre. See the Status column in `docs/screen-map.md`; everything marked Stub is still a placeholder.

The mock API in `src/mocks` follows `openapi/openapi.yaml`, with these extensions the backend must add: proforma fields on quotes (`document_title`, `bill_to_text`, `validity_days`, `signatory_name`, `amount_in_words`, lines on create), `spec_text` on products, `GET /reports/summary`, and `lines` on receipts.
