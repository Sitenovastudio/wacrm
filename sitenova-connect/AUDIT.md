# SiteNova Connect — WACRM Conversion Audit

Audit baseline: upstream `ArnasDon/wacrm`, default branch `main`, commit `6dbeb5bf94d4cf01be351272d0d45b64b1a684d4`.
Target: `Sitenovastudio/wacrm`, branch `sitenova/vanilla-js-migration`.
Policy: additive migration only. Do not delete or rewrite the original Next.js source, migrations, MCP server, docs, or license while parity is being established.

## Repository inventory

- 809 tracked paths in the inspected upstream tree.
- 17 dashboard page entry points.
- 113 TSX component files.
- 270 TypeScript/TSX library files.
- 58 SQL migration files (migration numbering has gaps; apply the actual files in order).
- 56 Next.js API route handlers.
- Separate MCP server package and implementation.
- CI, Docker, deployment, docs, localization and test configuration also exist.

## Feature-to-source map

| Feature | Original source area | Vanilla SPA destination | Backend destination |
|---|---|---|---|
| Authentication, signup, reset, callback, invitations | `src/app/(auth)`, `src/app/auth`, `src/app/join`, auth components/libs | `/login`, `/signup`, `/forgot-password`, invite view | `/api/auth/*`, Supabase Auth |
| Dashboard and KPI/activity cards | `src/app/(dashboard)/dashboard`, `src/components/dashboard` | `#/dashboard` | dashboard read APIs / Supabase queries |
| Shared inbox and message UI | `src/app/(dashboard)/inbox`, `src/components/inbox` | `#/inbox` | conversations, messages, media, send, reactions |
| Contacts, tags, custom fields, import | `src/app/(dashboard)/contacts`, `src/components/contacts` | `#/contacts` | contacts and tag APIs |
| Pipelines and deals | `src/app/(dashboard)/pipelines` | `#/pipelines` | pipeline persistence and authorization |
| Broadcast creation, schedule, tracking | `src/app/(dashboard)/broadcasts`, `src/components/broadcasts` | `#/broadcasts` | broadcast APIs, jobs, WhatsApp |
| WhatsApp configuration, templates, health, media, webhook | `src/app/api/whatsapp` | settings and inbox views | Express WhatsApp integration/webhook |
| Automations and execution logs | `src/app/(dashboard)/automations`, `src/components/automations` | `#/automations` | automation engine, cron/worker |
| Flow builder, templates, runs | `src/app/(dashboard)/flows`, `src/components/flows` | `#/flows` | flow APIs, runner, cron/worker |
| AI agents, draft, auto-reply, usage, playground | `src/app/(dashboard)/agents`, `src/app/api/ai`, agent components | `#/agents` | server-side AI provider adapters |
| AI knowledge base and reindex | `src/app/api/ai/knowledge`, AI libraries | agents/knowledge view | server-side indexing, embeddings, retrieval |
| Notifications and quick replies | dashboard notifications; `src/app/api/quick-replies` | notifications and inbox picker | notification/quick-reply APIs |
| Account, team, invitations, API keys | `src/app/api/account`, invitation routes, settings | `#/settings` | account/member/role/API-key endpoints |
| Public REST API and outbound webhooks | `src/app/api/v1` | developer settings | versioned Express API and webhook dispatcher |
| MCP integration | `mcp-server/src` | not browser UI | keep separate MCP service; port/test independently |
| Localization | `messages/*.json`, `src/i18n` | client-side locale dictionaries | n/a |
| Database, RLS, storage and functions | `supabase/migrations`, `supabase/config.toml` | Supabase browser client with anon key only | service-role operations only on server |

## API route inventory

All original handlers under `src/app/api` must be individually mapped and regression-tested. The inspected route groups are:
- `account/api-keys`, `account/invitations`, `account/members`, `account/transfer-ownership`
- `ai/autoreply`, `ai/config`, `ai/draft`, `ai/knowledge`, `ai/playground`, `ai/test`, `ai/usage`
- `automations` CRUD, duplicate, cron and engine
- `contacts/:id/tags`
- `flows` CRUD, activate, runs, cron and templates
- `invitations` peek and redeem
- `quick-replies`
- `v1/broadcasts`, `v1/contacts`, `v1/conversations`, `v1/messages`, `v1/me`, `v1/webhooks`
- `whatsapp/broadcast`, config, registration verification, health, media, reactions, send, templates, sync/submit and webhook
- `auth/callback`

## Database migration inventory

The source tree contains 58 SQL migration files, numbered 001–060 with gaps. Preserve their exact ordering and contents. Do not invent missing migration numbers. Before applying to the new Supabase project:
1. Review each migration for destructive operations, extensions, roles, secrets, storage buckets and external dependencies.
2. Apply to a disposable Supabase staging project first.
3. Verify tables, indexes, functions, triggers, RLS policies and storage policies.
4. Run the original SQL/RLS tests where present and add migration smoke tests.
5. Configure Auth redirect URLs, SMTP, storage and Realtime separately.
6. Keep production credentials out of Git.

## Conversion rules

- Browser: plain HTML, CSS and ES modules; one SPA shell using History API/hash routing.
- Server: Node.js/Express replaces Next.js route handlers, middleware, server actions and server-only library functions.
- Never expose Supabase service-role key, Meta app secret, WhatsApp access tokens, encryption key, cron secret or AI provider keys in browser code.
- Preserve webhook signature verification, idempotency, rate limits, role checks, account scoping and RLS.
- Keep delayed automation/broadcast execution in a durable worker/cron process; do not rely on a browser tab.
- Keep MCP server as a separate service/package and verify every tool's authorization.
- Retain upstream MIT license and attribution notices.
- No database project has been connected or modified by this scaffold.

## Parity acceptance checklist

- [ ] Auth lifecycle, invite redemption, session expiry and role restrictions
- [ ] Inbox: inbound/outbound text, media, templates, reactions, assignments, realtime updates
- [ ] Contact CRUD, custom fields, tags, CSV import and deduplication
- [ ] Pipeline CRUD, drag/drop, deal totals and permissions
- [ ] Broadcast audience, personalization, scheduling, pause/resume, delivery/failure tracking
- [ ] Automation trigger/condition/action/wait, retries and logs
- [ ] Flow validation, activation, run history, retries and cron
- [ ] AI config, usage, draft, auto-reply, playground, knowledge indexing/retrieval
- [ ] Team membership, invitations, ownership transfer, API keys
- [ ] Public API auth/scopes, webhook signing/retries, MCP tool permissions
- [ ] New Supabase RLS/storage/realtime/auth configuration
- [ ] Security, accessibility, responsive UI, browser compatibility and end-to-end tests

## Audit status

Initial structural audit complete. Detailed per-function behavioral mapping and test equivalence remain in progress; feature parity is not yet claimed.
