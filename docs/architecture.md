# Front-end architecture

- **One app, four surfaces.** Public site and store, customer portal (`/portal`), staff console (`/console`), technician app (`/field`). Each is a lazy route area with its own layout, so they can become separate apps later.
- **Features own their code.** `src/features/<name>` holds pages, components, hooks, API calls, types, and schemas. A feature is imported only through its `index.ts`, and never from another feature. Shared code lives in `components/`, `lib/`, `hooks/`, `api/`.
- **One API client.** `src/api/client.ts` adds the token, refreshes on 401 once, parses RFC 9457 errors into `ApiError`, and offers `withIdempotency()` and `withEtag()`. Types come from `openapi/openapi.yaml` through `npm run generate:api`.
- **Server state in React Query, client state in Zustand.** Keys live in `src/api/queryKeys.ts`.
- **Offline.** The technician app writes to an IndexedDB queue (`src/offline`) and syncs with `/sync/push` and `/sync/pull`. The UI always shows connection state and unsynced changes.
- **One line-item table.** `components/line-items/LineItemTable` renders No., Particulars, Size / Specification, Image, Quantity, Unit, Rate, Amount for quotes, BOM, stock, purchase orders, and the cart.
- **Print is separate.** The six TCOIN documents are fixed-size components in `features/documents/templates`.
- **Permissions drive the UI.** Menus come from `config/navigation.ts` and are filtered by permission; routes carry `handle.permission` and the console layout blocks users who lack it. The API still enforces everything.
- **Sizing engine.** `src/sizing` is the shared pure TypeScript engine; the calculator and design workspace call it directly for instant feedback and the API for the stored result.
