# SiteNova Connect

Vanilla JavaScript SPA and Node.js API migration workspace for WACRM.

## Current status

This is an additive migration scaffold on `sitenova/vanilla-js-migration`. The original Next.js application, source files, MCP server, Supabase migrations and license remain in place. This scaffold is not yet a feature-complete CRM.

See [AUDIT.md](./AUDIT.md) for the initial source-to-feature inventory and parity checklist.

## Architecture

- `public/`: single-page HTML/CSS/ES-module frontend.
- `server/`: Express API host and future migrated API modules.
- Supabase: a separate new project will be configured using environment variables.
- MCP: original package remains separate until its migration is validated.

## Local setup

1. Install Node.js (use the version supported by the current root project and this package).
2. Copy `.env.example` to `.env` and fill server-side values.
3. Run `npm install` in this directory.
4. Run `npm run dev`.

Do not place service-role keys, Meta secrets, encryption keys or AI provider keys in `public/` or client-side JavaScript.

## Migration policy

Never delete the original implementation until each feature has a passing parity test. Apply database migrations to a disposable new Supabase project before any production setup.
