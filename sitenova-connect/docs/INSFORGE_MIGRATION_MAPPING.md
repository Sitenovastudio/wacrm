# WACRM to InsForge Migration Mapping

## Platform decision

The target backend is a dedicated self-hosted InsForge instance. It is independent of both existing managed Supabase projects. InsForge provides its own PostgreSQL, authentication, storage and backend runtime. The original WACRM Supabase implementation is retained as the behavioral/schema reference.

## Important compatibility boundary

InsForge is not a drop-in Supabase replacement. Do not point the existing Supabase SDK at InsForge and assume compatibility. Migrate through a dedicated InsForge adapter using the SDK and API documented for the pinned InsForge release.

The source contains 58 Supabase SQL migration files. Review and port them one by one:
- Preserve table relationships, constraints, indexes, defaults and database functions where compatible.
- Translate auth references and membership rules to the InsForge identity model.
- Recreate RLS/authorization policies using the target platform's supported PostgreSQL roles, grants and request identity claims.
- Rework Supabase Storage buckets/policies to InsForge Storage APIs and S3-compatible object storage.
- Rework Supabase Realtime subscriptions to InsForge's supported realtime API. If any required semantics are missing, add an application event stream or Postgres-backed outbox.
- Review every Supabase RPC, trigger and security-definer function for equivalent behavior and privileges.
- Preserve all business rules and tests. Do not silently remove unsupported behavior.

## Feature mapping

| WACRM capability | InsForge target |
|---|---|
| Authentication, sessions, password reset | InsForge Auth adapter; verify token/session and recovery flows |
| Profiles, account membership, roles, invitations | PostgreSQL schema + application authorization service |
| Contacts, tags, custom fields, deduplication | PostgreSQL + API |
| Shared inbox, messages, assignments, notes, presence | PostgreSQL + realtime/event adapter |
| WhatsApp config and credentials | Server-only encrypted secrets; Meta Cloud API adapter |
| Media and profile avatars | InsForge Storage / configured S3-compatible backend |
| Pipelines and deals | PostgreSQL + SPA |
| Templates and broadcasts | PostgreSQL + Meta API + durable worker |
| Automations and wait-for-reply | Durable queue, scheduler and worker; not browser timers |
| Flows and run history | PostgreSQL + worker; preserve validation and execution semantics |
| AI config, draft, auto-reply, usage | Server-side provider adapter and usage ledger |
| Knowledge base | PostgreSQL + vector extension if available; verify extension support on deployed InsForge image |
| API keys and public REST API | Hashed API-key store, scopes, rate limits and audit events |
| Outbound webhooks | Durable delivery queue, HMAC signatures, retry and dead-letter records |
| MCP server | Keep separate; use scoped service credentials and per-tool authorization |

## Local API boundary

- Browser code may use only public project-level credentials and short-lived user sessions.
- Server-side admin credentials, database credentials and InsForge root/admin keys remain in server secrets.
- Node API validates sessions and account membership before privileged operations.
- Do not trust a browser-supplied account_id, user_id, role or tenant identifier.
- All queries and jobs must be account-scoped.
- Use idempotency keys for Meta webhook ingestion and outbound job execution.

## Migration sequence

1. Pin an InsForge release/compose version and run a local disposable instance.
2. Verify Auth, database, Storage, realtime, API keys and backup/restore behavior.
3. Create a schema compatibility inventory for each of the 58 source migrations.
4. Port schema and security policies into new ordered InsForge migration files.
5. Add automated tests for cross-account isolation and role boundaries before UI integration.
6. Port Auth and account membership.
7. Port contacts, pipelines and dashboard.
8. Port inbox, Meta webhook, media, templates and messaging.
9. Port broadcasts, automation and flow execution to durable workers.
10. Port AI, knowledge retrieval, public API, outbound webhooks and MCP.
11. Compare each module against source behavior and mark the parity tracker only after acceptance tests pass.

## Operational cautions

- InsForge local setup generates its own credentials and volumes; use a unique Compose project name and dedicated directory.
- Local development ports must not collide with other services.
- The InsForge setup helper creates files but does not start services. Inspect it before running.
- Production requires persistent volumes, off-host encrypted backups, tested restores, TLS, firewall, SMTP, monitoring, upgrades and rollback.
- The InsForge platform release and its APIs can evolve. Pin the tested release and SDK version rather than following a moving `latest` tag in production.
