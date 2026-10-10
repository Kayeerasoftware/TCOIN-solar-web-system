# Conventions

- TypeScript strict. No `any` without a comment.
- Components are function components in PascalCase files; hooks start with `use`.
- Forms: react-hook-form with a zod schema in the feature's `schemas.ts`. Show field errors beside the field (`ApiError.fieldErrors` maps server errors).
- Money is a number rounded with `lib/money`; never format by hand. Amounts in words use `lib/amountInWords`.
- Every list and form has loading, empty, error, and success states (`components/feedback`).
- Accessibility: 44 px touch targets, labels on every field, visible focus, WCAG 2.1 AA contrast.
- Commits follow Conventional Commits. Pull requests need passing lint, typecheck, tests, and build.
