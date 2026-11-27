# SiteNova Connect — Source Audit & Migration Map

Audit baseline: `main` at `6dbeb5bf94d4cf01be351272d0d45b64b1a684d4`.
Target branch: `sitenova/vanilla-js-migration`.
Upstream: `ArnasDon/wacrm` (read-only reference). This repository is the user's fork.
Scope: complete Next.js/React/TypeScript to Vanilla JavaScript SPA conversion, Express backend, and a new Supabase project.

## Preservation policy

- The original application remains in its existing paths during migration.
- New implementation is isolated under `sitenova-connect/`; no original application files are deleted or replaced as part of the initial migration.
- Preserve the MIT license and required attribution notices.
- Do not copy production secrets or customer data into this repository or a new Supabase project.
- The original Supabase project is not modified. New-project schema is bootstrapped from reviewed migrations.
- Do not claim feature parity until each item below has a passing acceptance test.

## Repository inventory (baseline)

The recursive Git tree contains 809 paths. Main source areas include `src/app`, `src/components`, `src/hooks`, `src/i18n`, `src/lib`, `src/types`, `supabase/migrations`, `mcp-server`, `docs`, and `.github/workflows`.

Audited source counts:
- 17 dashboard page entry points under `src/app/(dashboard)`.
- 58 Next.js API route handlers under `src/app/api`.
- 113 TSX component files under `src/components`.
- 270 TypeScript/TSX library files under `src/lib`.
- 58 SQL migration files under `supabase/migrations`.
- MCP server package with read and write tool modules.
- English, Spanish, Korean, and Portuguese message catalogs.

## Feature-to-source-to-target map

| Feature / capability | Original source locations | Vanilla SPA / backend target | Required acceptance |
|---|---|---|---|
| Landing, app shell, responsive navigation | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/(dashboard)/dashboard-shell.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/globals.css` | `public/index.html`, `public/css/*`, `public/js/core/*`, `public/js/router.js` | Deep links, refresh, responsive navigation, keyboard accessibility |
| Login, signup, password recovery/reset, auth callback | `src/app/(auth)/**`, `src/app/auth/callback/route.ts`, `src/middleware.ts` | SPA auth views + Express auth/session middleware + Supabase Auth | Signup/login/logout/recovery/callback, expired session, protected routes |
| Invitation join and redemption | `src/app/join/**`, `src/app/api/invitations/**`, `src/app/api/account/invitations/**` | SPA invitation view + Express invitation routes | Valid, expired, reused, revoked invitations; role assignment |
| Account, members, roles, ownership | `src/app/api/account/**`, `src/components/auth/require-role.tsx` | Express account routes + authorization middleware + settings views | Tenant isolation, least privilege, member CRUD, ownership transfer |
| Dashboard KPIs and activity | `src/app/(dashboard)/dashboard/page.tsx`, `src/components/dashboard/**`, `src/app/api/*` | SPA dashboard module + Express dashboard query endpoints | KPI totals reconcile with source queries; empty/error/loading states |
| Shared WhatsApp inbox and conversations | `src/app/(dashboard)/inbox/page.tsx`, `src/components/inbox/**`, `src/app/api/whatsapp/**` | SPA inbox module + Express conversation/message routes + Supabase Realtime | Conversation list, assignment, unread state, message history, live updates |
| Message send, media, reactions, quotes, quick replies | `src/components/inbox/**`, `src/app/api/whatsapp/send/**`, `media/**`, `react/**`, `src/app/api/quick-replies/**` | Inbox composer + Express WhatsApp integration and media endpoints | Text/media send, upload/download, reply quote, reactions, quick replies, failures |
| WhatsApp account/configuration/health/registration | `src/app/api/whatsapp/config/**`, `health/**`, `src/app/api/whatsapp/webhook/**` | Express WhatsApp config service, health endpoint and webhook controller | Token validation, registration checks, health checks, signature verification |
| Templates | `src/app/api/whatsapp/templates/**`, `src/app/(dashboard)/broadcasts/**` | SPA template picker/settings + Express Meta template sync/submit | Sync, submit, update, variable validation, provider status reconciliation |
| Contacts, tags, custom fields, import/deduplication | `src/app/(dashboard)/contacts/**`, `src/components/contacts/**`, `src/app/api/contacts/**` | SPA contacts module + Express contacts/import routes | CRUD, CSV validation, duplicate handling, tags/custom fields, pagination |
| Pipelines and deals | `src/app/(dashboard)/pipelines/**`, dashboard pipeline components | SPA Kanban module + Express pipeline endpoints | Create/update/move stages and deals; totals and conversation links |
| Broadcast campaigns | `src/app/(dashboard)/broadcasts/**`, `src/components/broadcasts/**`, `src/app/api/whatsapp/broadcast/**`, `src/app/api/v1/broadcasts/**` | SPA campaign wizard/history + Express broadcast scheduler/worker | Audience filtering, template params, scheduling, pause/resume, delivery states |
| Automations and execution engine | `src/app/(dashboard)/automations/**`, `src/components/automations/**`, `src/app/api/automations/**` | SPA visual automation editor + Express engine/worker/cron endpoints | Trigger/condition/action execution, wait/resume, retries, logs, idempotency |
| Flows, templates, run history | `src/app/(dashboard)/flows/**`, `src/components/flows/**`, `src/app/api/flows/**` | SPA flow canvas/editor + Express flow validation/activation/runtime | Node editing, validation, activation, execution runs, scheduled processing |
| AI agents, draft, autoreply, playground, usage | `src/app/(dashboard)/agents/**`, `src/components/agents/**`, `src/app/api/ai/**` | SPA AI module + Express AI provider adapters and usage accounting | Provider configuration, test, draft, opt-in auto-reply, quota/usage |
| AI knowledge base and reindexing | `src/app/api/ai/knowledge/**`, relevant `src/lib` services | SPA knowledge manager + Express ingestion/reindex service + Supabase vector support | CRUD, indexing, retrieval, access isolation, failed-job recovery |
| Notifications and presence | `src/app/(dashboard)/notifications/**`, `src/app/api/**`, `src/lib` | SPA notification center + Realtime subscriptions/Express APIs | Realtime delivery, read/unread, member presence |
| API keys and public REST API | `src/app/api/account/api-keys/**`, `src/app/api/v1/**`, `docs/public-api.md` | Express versioned public API + hashed/scoped API key service | Scope checks, key rotation/revocation, pagination, validation, rate limits |
| Outbound webhooks | `src/app/api/v1/webhooks/**`, `src/app/api/**`, migrations | Express webhook dispatcher + retry queue | HMAC signing, retries, delivery logs, secret rotation |
| MCP server | `mcp-server/src/**`, `docs/mcp.md` | Preserve as a separate MCP service; update its API client/config only where needed | Read tools, explicitly enabled write tools, auth and tenant scope |
| Internationalization | `messages/en.json`, `es.json`, `ko.json`, `pt.json`, `src/i18n/**` | SPA dictionary loader and locale selector | All supported locales load; no missing keys in core screens |
| Storage and media | `supabase/migrations/**`, `src/lib/**`, `public/**` | New Supabase Storage buckets/policies + Express signed upload/download endpoints | Access controls, MIME/size validation, private URL expiry |
| CI, tests, Docker and docs | `.github/workflows/**`, `vitest.config.ts`, `Dockerfile`, `docker-compose.yml`, `docs/**` | New SPA/API tests, CI, Docker deployment and migration runbooks | Build, lint, unit/integration/security tests and clean deployment |

## Backend route migration inventory

All 58 original Next.js route handlers under `src/app/api` must be mapped to Express routers. The audited route families are:

- `/api/account`: account, API keys, invitations, members, ownership transfer.
- `/api/ai`: autoreply, config, draft, knowledge CRUD/reindex, playground, test, usage.
- `/api/automations`: CRUD, duplicate, cron, engine.
- `/api/contacts`: contact tag operations.
- `/api/flows`: CRUD, activation, runs, cron, templates.
- `/api/invitations`: invitation peek and redemption.
- `/api/quick-replies`: CRUD.
- `/api/v1`: public broadcasts, contacts, conversations, messages, identity and webhooks.
- `/api/whatsapp`: broadcast/resume, config/registration, health, media, reactions, send, templates and inbound webhook.

The detailed route-by-route HTTP method, request schema, response schema, auth scope and error behavior must be captured from each original handler before implementation. This file records the complete route-family inventory, not a substitute for endpoint contract tests.

## Database migration inventory

The baseline includes 58 SQL migration files. Preserve and review them in their original order; do not renumber or silently skip gaps. Current numbered sequence includes:
`001`–`049`, `051`–`055`, `057`–`060`.
The absent numbers are not evidence of missing schema requirements; inspect migration history and repository state before adding new migrations.

Database migration rules:
1. Create a separate Supabase project and separate CLI link/config for it.
2. Apply reviewed migrations to the new project only, in order, and record the applied version set.
3. Review extensions, auth hooks, functions, triggers, RLS, grants, storage buckets/policies and realtime publication setup.
4. Validate policies against cross-account access tests before importing any data.
5. Do not import original customer data or secrets by default. Any production data transfer requires a separate explicit, backed-up migration plan.
6. Keep rollback/recovery scripts and a schema diff report.

## Architecture decisions

- Frontend: one HTML document, Vanilla JavaScript ES modules, CSS; History API router and lazy-loaded feature modules.
- Backend: Node.js + Express. Keep provider secrets, Supabase service-role key, webhook verification, encryption and privileged operations server-side.
- Database: new Supabase project; reuse reviewed schema/migrations as the compatibility baseline.
- Realtime: Supabase Realtime where safe; enforce RLS and tenant scope.
- Background work: durable job/queue design for broadcasts, automation waits, flow runs, webhook retries and scheduled work. Do not rely on browser timers.
- WhatsApp: Meta Cloud API adapter; verify webhook signatures against raw request bytes; make inbound processing idempotent.
- AI: provider adapter layer; keys server-only; record usage and respect account-level limits.
- MCP: separate process/service, scoped credentials and explicit opt-in for write tools.
- Hosting: serve SPA and API from a Node-capable host (or deploy SPA separately with a same-origin API). GitHub Pages alone cannot host webhooks, workers or Express.
- Branding: SiteNova Connect, with SiteNova visual identity and product naming; retain original legal notices.

## Security and reliability gates

- No secrets in browser bundles, source control, logs or error responses.
- Enforce account/tenant membership on every account-scoped query and mutation.
- Verify Meta webhook signatures; reject invalid signatures.
- Rate-limit auth, public API, webhook and AI endpoints.
- Use idempotency and bounded retries for message sends, broadcasts and workflow jobs.
- Validate uploads and avoid public exposure of private media.
- Use CSRF-safe session strategy, secure cookies, CORS allowlists and request validation.
- Add audit events for privileged changes and ownership transfer.

## Feature parity acceptance gates

Each feature is considered migrated only after:
- UI flow and API contract are documented.
- Positive, negative, permission and empty-state tests pass.
- Data isolation tests pass for at least two separate accounts.
- Realtime and retry behavior is tested where applicable.
- No original behavior is silently dropped.
- A traceable source-to-target mapping is linked from this audit.

## Current implementation status

- [x] Fork identity and write permission verified.
- [x] Default branch and baseline commit recorded.
- [x] Recursive tree inventory captured (809 paths).
- [x] Feature and subsystem migration map recorded.
- [x] Isolated migration branch created from `main`.
- [ ] Route-by-route contract extraction and test matrix.
- [ ] Schema/RLS/storage migration validation on new Supabase project.
- [ ] Vanilla SPA and Express implementation.
- [ ] Feature parity and security acceptance.
- [ ] Deployment and production cutover.

No upstream repository or original database has been modified.
