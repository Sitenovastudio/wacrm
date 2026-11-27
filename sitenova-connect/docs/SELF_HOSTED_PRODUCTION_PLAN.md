# SiteNova Connect — Self-Hosted InsForge Architecture

## Decision
Target backend: a dedicated self-hosted InsForge instance. Current developer environment: local Docker. Production hosting is a later phase. Both existing managed Supabase projects are explicitly out of scope and must remain untouched.

## Architecture
- Frontend: HTML/CSS/Vanilla JavaScript SPA.
- Application API: Node.js + Express with validation, authorization, audit trail and webhook endpoints.
- Backend platform: dedicated InsForge instance with its own PostgreSQL, Auth, Storage and supported realtime/functions.
- Background processing: separate Node worker with durable queue/outbox, retries and dead-letter handling.
- Integrations: Meta WhatsApp Cloud API and AI providers through server-side adapters.
- Files: InsForge Storage; local persistent volume for development, supported S3-compatible backend and off-host backups for production.

Browser code receives only public project configuration and authenticated user sessions. InsForge project admin API key, database password, root admin password, JWT secret and encryption key remain server/platform secrets.

## Local-first rollout
1. Run InsForge locally in a dedicated directory using official Docker Compose setup.
2. Validate Auth, PostgreSQL API, Storage, realtime, health and backup/restore in a disposable environment.
3. Pin the tested InsForge release/image and @insforge/sdk version.
4. Port all 58 source WACRM SQL migrations into a separate ordered target migration set; never apply source migrations to either existing managed Supabase project.
5. Implement tenant isolation and role tests before migrating user data.
6. Port features in parity-tracker order and acceptance-test against original WACRM behavior.
7. Only after local acceptance, design production VPS, TLS, domain, firewall, backups, monitoring, SMTP, upgrade/rollback and recovery.

## Isolation guarantee
- No credentials or endpoints for either existing Supabase project belong in this app configuration.
- No migration operation should create, alter, pause, delete or move data in those projects.
- Original WACRM source/upstream repository remains unchanged.
- Original Supabase migrations remain read-only references until each is reviewed and ported.

## Production hardening
Do not expose PostgreSQL, PostgREST, Studio/admin UI or internal services directly to the internet. Use TLS reverse proxy, firewall, persistent volumes, encrypted off-host backups, tested restores, log retention, monitoring, SMTP and documented update/rollback. Pin release/image digests; do not deploy production from moving latest tags.

## Current status
Architecture and local setup docs are in place. Frontend/API remain a scaffold. No WACRM business feature is marked migrated solely because a placeholder exists. InsForge is not yet running on the user's machine; no schema or user data has been imported.
