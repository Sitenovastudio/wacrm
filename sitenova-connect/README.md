# SiteNova Connect

Vanilla JavaScript SPA and Node.js API migration workspace for WACRM.

## Current status

This is an additive migration scaffold on `sitenova/vanilla-js-migration`. The original Next.js application, source files, MCP server and original Supabase migrations remain in place as read-only migration references. This scaffold is not yet a feature-complete CRM.

See [AUDIT.md](./AUDIT.md), [PARITY_TRACKER.md](./docs/PARITY_TRACKER.md), and [INSFORGE_MIGRATION_MAPPING.md](./docs/INSFORGE_MIGRATION_MAPPING.md).

## Architecture

- `public/`: single-page HTML/CSS/Vanilla JavaScript frontend.
- `server/`: Express API and InsForge adapter.
- Backend: dedicated self-hosted InsForge instance, with its own PostgreSQL, Auth and Storage.
- Jobs: separate worker process; durable queue and job handlers are still pending.
- MCP: original package remains separate until migration is validated.

The two existing managed Supabase projects are not used by this target architecture and must remain untouched.

## Local setup

1. Follow [INSFORGE_LOCAL_SETUP.md](./docs/INSFORGE_LOCAL_SETUP.md) to run InsForge in its own Docker Compose directory.
2. Copy `.env.example` to `.env` and map InsForge's `ACCESS_ANON_KEY` to `INSFORGE_ANON_KEY`, and server-only `ACCESS_API_KEY` to `INSFORGE_API_KEY`.
3. Run `npm install`, `npm run check`, then `npm run dev`.
4. Open `http://localhost:3000`.

Never expose the InsForge admin/API key, database password, root admin password, JWT secret, encryption key, Meta secrets or AI provider keys to browser code.

## Migration policy

Do not delete the original implementation until every feature has passing parity tests. Do not run the original SQL migrations against either existing Supabase project. Port and test each migration against the isolated local InsForge instance first.
