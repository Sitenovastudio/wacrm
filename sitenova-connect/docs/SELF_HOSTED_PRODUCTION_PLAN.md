# SiteNova Connect — Self-Hosted Production Plan

## Decision

- Database platform: self-hosted Supabase (official Docker Compose distribution).
- Application: Vanilla JavaScript SPA + Node.js API.
- Deployment: Linux VPS with Docker Compose, reverse proxy and HTTPS.
- Isolation: a dedicated Supabase stack and dedicated PostgreSQL volume for SiteNova Connect.
- Existing Supabase projects: no connection, schema change, migration, pause, or data operation is authorized against either existing project.

## Production sizing

Supabase's official Docker guide currently specifies a minimum of 4 GB RAM, 2 CPU cores and 40 GB SSD, and recommends 8 GB RAM, 4 CPU cores and 80 GB SSD for a comfortable deployment. Treat these as starting points, not capacity guarantees. Load-test against expected concurrent agents, message volume, media retention and automation throughput.

Do not expose Postgres, Studio, or internal service ports directly to the public internet. Expose only HTTPS through a reverse proxy/firewall. Use separate hostnames, for example:
- `app.example.com` — SPA and Node API
- `supabase.example.com` — Supabase API gateway
- `studio.example.com` — Studio, protected by an additional access layer/VPN

## Services

### Supabase stack
Use the official, version-pinned Supabase self-hosted Docker Compose distribution. It includes the API gateway, Auth, PostgREST, Realtime, Storage, PostgreSQL, Studio, Supavisor and supporting services. Do not hand-copy a compose file from an unpinned branch.

### Application stack
- Static SPA served by the Node application or a reverse proxy.
- Node.js API for privileged workflows, Meta webhooks, AI provider calls, API keys, outbound webhooks and scheduled work.
- Durable PostgreSQL-backed job queue with locking, retry/backoff, idempotency keys and dead-letter handling.
- Separate worker process for broadcasts, automation waits, flow runs and webhook retries.
- MCP server remains a separately deployed process with per-tool authorization.

### Storage
Start with Supabase Storage on a persistent mounted volume. For production, configure an independent S3-compatible object store if off-server media durability and lifecycle management are required. Back up object data separately from PostgreSQL.

## Network and security

1. Use a supported Linux LTS server and keep OS packages and Docker patched.
2. Use a reverse proxy (Caddy or Nginx) with automatic TLS and renewal.
3. Firewall inbound access to 80/443 and tightly restrict SSH. Keep database and internal container ports private.
4. Restrict Studio to VPN/IP allowlist and strong dashboard credentials.
5. Generate unique high-entropy secrets and JWT signing keys. Never reuse the credentials of either managed Supabase project.
6. Store secrets in server environment/secret manager; do not commit `.env`, database passwords, service keys, Meta tokens, webhook secrets, encryption keys or AI keys.
7. Use a least-privilege database role for the application. Service-role credentials must only exist server-side.
8. Validate Auth JWTs, account membership and role permissions on every protected operation; retain RLS as a second authorization boundary.
9. Verify Meta webhook signatures against the raw request body, validate challenge tokens, and make inbound event handling idempotent.
10. Apply request size limits, rate limits, CSRF protections where cookie sessions are used, strict CORS, secure cookies, security headers and audit logging.
11. Encrypt backups and restrict backup access independently from the application host.

## Database migration strategy

The source repository has 58 SQL migration files, numbered 001–060 with gaps. The files are Supabase-specific and must not be applied blindly to a generic PostgreSQL server or a live production database.

1. Preserve all source migrations unchanged as the reference.
2. Review every migration for destructive DDL, extensions, roles, grants, triggers, RLS, storage buckets, auth schema assumptions and Supabase RPC behavior.
3. Create a disposable staging self-hosted Supabase instance on a separate database volume.
4. Apply the source migrations in lexical order using a migration runner that records checksums and applied versions.
5. Resolve incompatibilities in new, clearly numbered SiteNova migration files; do not rewrite historical migrations.
6. Verify tables, indexes, functions, triggers, RLS policies, storage policies, Auth flows, Realtime publication and pgvector support.
7. Port application code and run feature-level tests against staging.
8. Take and test a restorable backup before production migration.
9. Run production migrations during a planned maintenance window, then perform smoke tests and monitor logs.
10. Keep rollback instructions for each release. Prefer forward-fix migrations; never assume reversing DDL restores deleted data.

## Original WACRM feature parity scope

The original Next.js implementation remains in the repository until parity is demonstrated.

| Feature | Migration target | Required acceptance test |
|---|---|---|
| Signup, login, reset, callbacks, invitations | Supabase Auth + SPA routes | Full auth lifecycle, expired sessions, invite redemption |
| Account, team, roles, ownership transfer | API + membership/RLS | Cross-account isolation and role enforcement |
| Dashboard, KPIs, activity, health | SPA + read APIs | Metric parity against source |
| Shared inbox, assignments, notes, presence | Realtime + API | Multi-agent concurrent conversation test |
| Messages, replies, media, reactions | WhatsApp adapter + Storage | Inbound/outbound text and media round-trip |
| Contacts, tags, custom fields, CSV import | API + PostgreSQL | Deduplication, import validation and access scope |
| Pipelines and deals | SPA + API | CRUD, stage moves, totals and permissions |
| Templates and WhatsApp registration | Meta adapter | Sync, submit, status updates and template variables |
| Broadcasts | Worker + API | Schedule, pause/resume, retries and delivery receipts |
| Automations | Durable worker | Trigger, conditions, waits, retries and execution logs |
| Flow builder and runs | SPA + worker | Validation, activation, branching and run history |
| AI agents, draft, auto-reply, playground | Server-side provider adapters | Provider failure, usage accounting and safe fallback |
| Knowledge base and retrieval | pgvector + worker | Index, reindex, retrieval and account isolation |
| API keys and public REST API | Versioned API | Scope enforcement, rotation and rate limits |
| Outbound webhooks | Worker | Signature, retry, replay and delivery log |
| MCP server | Separate service | Tool authorization and account scoping |
| Notifications, quick replies, settings | SPA + API | CRUD, realtime updates and permissions |

## Backup and disaster recovery

- Nightly encrypted PostgreSQL logical backups (and scheduled physical/base backups as appropriate).
- Continuous WAL archiving/PITR if the chosen infrastructure supports it and operations are staffed.
- Separate, versioned object-storage backups.
- Keep backups off the VPS and preferably in a second region/provider.
- Define RPO/RTO before launch; proposed initial targets must be confirmed by the owner.
- Perform monthly restore drills and record recovery duration.
- Monitor disk capacity, CPU, RAM, container health, database connections, replication/WAL, backup age, TLS expiry, queue depth, webhook failures and WhatsApp health.

Self-hosting does not include the managed platform's backup/PITR and other operational conveniences. SiteNova must operate these capabilities itself.

## CI/CD and release process

1. CI runs syntax checks, unit tests, API tests, migration lint and dependency/security checks.
2. Deploy to staging from the migration branch.
3. Apply additive migrations and run smoke tests.
4. Require approval before production deployment.
5. Deploy versioned application images; keep the previous image available for rollback.
6. Never run destructive database reset commands in production.
7. Pin the Supabase self-hosted release and follow the official update process. Back up Postgres and Storage separately before upgrades.

## Delivery phases

- Phase 0 — Architecture, audit and isolated deployment scaffold.
- Phase 1 — Provision VPS, DNS, firewall, TLS, Docker and self-hosted Supabase staging.
- Phase 2 — Port schema, Auth, account boundaries and storage.
- Phase 3 — Port contacts, inbox, WhatsApp webhooks, media and realtime.
- Phase 4 — Port pipelines, templates, broadcasts and durable jobs.
- Phase 5 — Port automations, flows, AI and knowledge base.
- Phase 6 — Port account administration, public API, webhooks and MCP.
- Phase 7 — Feature parity, security review, load tests, backup restore and production cutover.

## Current implementation status

This document and the initial frontend/API scaffold are committed to the migration branch. No VPS, DNS, Supabase self-hosted stack, production secrets, migrations, WhatsApp account or external service has been provisioned or changed. The feature conversion is not complete. The next executable step is to provision a dedicated staging VPS/host and test the pinned Supabase stack before porting production data or enabling live messaging.
