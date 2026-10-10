# ADR 0001: One app with four route areas

Decision: build the public site, portal, console, and field app as lazy route areas in one Vite app.

Why: one design system, one auth layer, one deploy for a small team. Route areas can be split into separate apps later because features do not import each other.

Trade-off: the public site is client-rendered. If SEO needs server rendering, move the public area to Next.js and keep `features/` and `components/` shared.
