# SiteNova Connect — AWS Migration Implementation Plan

**Target:** AWS-native backend replacing InsForge  
**Region:** `ap-south-1` (Mumbai)  
**Database:** Amazon RDS for PostgreSQL  
**Runtime:** Node.js API and workers on ECS Fargate; Vanilla JavaScript SPA  
**Status:** Planned. No AWS provisioning, code cutover or data migration has occurred.

## 1. Migration principles

1. Preserve original WACRM behavior, workflows, permissions, integrations and data semantics.
2. Migrate incrementally by vertical feature slice; do not blindly translate Supabase SDK calls.
3. Review all 58 source SQL migrations in order and document each AWS equivalent.
4. Replace Supabase-specific Auth, Storage, Realtime, RPC, Edge Functions and service-role patterns with explicit AWS/application equivalents.
5. Keep both existing managed Supabase projects untouched. No test, migration or connection may target them.
6. Keep upstream WACRM read-only and preserve MIT license/attribution.
7. Use synthetic fixtures until a separate real-data migration is explicitly approved.
8. A feature is complete only when frontend, API, authorization, database behavior, jobs and automated acceptance tests pass.

## 2. Proposed repository layout

```text
sitenova-connect/
  public/                         # Vanilla JS SPA
  server/
    app.js
    middleware/
      cognito-auth.js
      tenant-context.js
      permissions.js
      request-id.js
      rate-limit.js
    modules/
      auth/ users/ tenants/
      dashboard/ contacts/ pipelines/
      inbox/ whatsapp/ templates/
      broadcasts/ automations/ flows/
      ai/ knowledge/
      integrations/ webhooks/ api-keys/
      notifications/ settings/
    adapters/
      postgres/ s3/ sqs/ cognito/
      whatsapp-meta/ ai-providers/
    jobs/
      inbound-webhooks/ outbound-messages/ broadcasts/
      media/ automations/ webhook-delivery/
    db/
      migrations/ seeds/ repositories/
    realtime/
    observability/
  infrastructure/
    terraform/                    # or CDK; choose one, not both
      modules/
      environments/dev/
      environments/staging/
      environments/prod/
  docs/
    AWS_ARCHITECTURE_BLUEPRINT.md
    AWS_MIGRATION_IMPLEMENTATION_PLAN.md
    AWS_DATABASE_MIGRATION_MATRIX.md
    AWS_SECURITY_AND_OPERATIONS.md
  tests/
    unit/ integration/ contract/ e2e/ tenant-isolation/
```

Choose one IaC framework after review. Terraform is reasonable for provider-neutral plans; AWS CDK is reasonable for TypeScript-defined AWS infrastructure. Whichever is selected must include remote state, locking, plan/review/apply separation, drift detection and secret handling.

## 3. Phased implementation and gates

### Phase 0 — Source inventory and freeze
- Record source baseline commit and fork branch.
- Inventory every API route, SQL migration, trigger, RPC, RLS policy, storage bucket/policy, realtime subscription, scheduled task and MCP tool.
- Build a source-to-target matrix: source path/migration, behavior, target service/table/queue, risk and tests.
- Mark InsForge files as legacy prototype; do not delete until AWS replacements are reviewed.
- **Gate:** inventory reviewed; no source behavior silently omitted.

### Phase 1 — AWS foundation design (no deployment)
- Confirm AWS account owner, account strategy, budget, quotas and domain ownership.
- Finalize VPC CIDRs, AZs, subnets, egress/NAT, VPC endpoints, security groups, DNS and TLS.
- Define Cognito pool/client and identity-to-application-user mapping.
- Define RDS PostgreSQL version, sizing, storage, Multi-AZ, backup, KMS and network controls.
- Define S3 buckets, KMS, retention, versioning, upload policy and scanning.
- Define ECS services, task roles, ECR, API Gateway/ALB, WebSocket, SQS/DLQs, EventBridge and observability.
- Complete cost estimate, threat model, RPO/RTO and runbooks.
- **Gate:** architecture, cost and security review approved. This phase creates no resources.

### Phase 2 — IaC and isolated development environment
- Implement IaC for network, KMS, IAM, Cognito, S3, RDS, ECS/ECR, API Gateway, queues, logs and alarms.
- Add CI plan/review/apply separation and GitHub Actions OIDC; do not store AWS access keys in GitHub secrets.
- Provision only after separate explicit approval, first in a disposable dev environment.
- Validate network reachability, TLS, secrets access, logs, alarms, deployment rollback and deletion protection.
- **Gate:** dev smoke tests pass; production remains untouched.

### Phase 3 — Database conversion and tenant security
- Create ordered AWS target migrations, preserving source order and documenting any consolidation.
- Translate Supabase auth references to Cognito subject mapping and application users/memberships.
- Translate Supabase RLS policies to PostgreSQL RLS using trusted transaction-local tenant context.
- Review every SECURITY DEFINER function, trigger, RPC, extension, storage policy and privilege.
- Add tenant-aware constraints/indexes and audit, outbox and idempotency tables.
- Create synthetic tenant A/B fixtures and exhaustive negative isolation tests.
- **Gate:** schema review and RLS/security tests pass before any real data import.

### Phase 4 — Identity, sessions and account lifecycle
- Implement Cognito signup, sign-in, verification, resend, password reset, refresh, logout, MFA policy and invitation acceptance.
- Create internal user, tenant, membership, role, permission and invitation services.
- Enforce membership checks in API, WebSocket, MCP, public API and worker paths.
- **Gate:** full auth lifecycle and role/tenant matrix pass, including revoked/disabled-user tests.

### Phase 5 — Core CRM and dashboard
- Port dashboard KPIs/activity, contacts, tags, custom fields, deduplication, CSV import/export, pipelines and deals.
- Use S3 presigned uploads and background import workers with validation and result reports.
- Add pagination, filtering, sorting, validation, audit history and tenant-aware uniqueness.
- **Gate:** source behavior comparisons and CRUD/import/export tests pass.

### Phase 6 — WhatsApp channels, inbox and media
- Port Meta app/channel configuration, webhook challenge, signature verification and subscription lifecycle.
- Persist inbound event/idempotency record and enqueue processing through transactional outbox/SQS.
- Port conversations, assignments, notes, messages, statuses, reactions, templates, media and contact synchronization.
- Send outbound messages through workers and reconcile accepted/sent/delivered/read/failed callbacks.
- Store media in private S3; authorize every presigned download.
- Implement WebSocket delivery, reconnect and API reconciliation.
- **Gate:** end-to-end tests with Meta test assets; duplicate, out-of-order and retry scenarios pass.

### Phase 7 — Broadcasts, automations and flows
- Port broadcast targeting, recipient snapshots, scheduling, throttling, cancellation, progress and result counters.
- Port automation triggers/actions and wait-for-reply semantics to durable workers/scheduled events.
- Port flow editor data model, graph validation, node execution, checkpointing, timeout, cancellation and run history.
- Use SQS, EventBridge Scheduler and Step Functions where appropriate; never use browser timers as durable scheduling.
- **Gate:** retries, idempotency, ordering requirements, rate limits, pause/resume and DLQ recovery pass.

### Phase 8 — AI, knowledge base and usage
- Implement provider-neutral AI adapter; evaluate Bedrock and approved external providers.
- Port agent configuration, prompts, draft/auto-reply, playground, quotas and usage ledger.
- Store source files in S3; extract/chunk/index asynchronously; test retrieval isolation by tenant.
- Add prompt-injection defenses, source traceability, PII controls and human approval settings.
- **Gate:** provider failure, quota, tenant isolation, retrieval and usage accounting tests pass.

### Phase 9 — Public API, webhooks, MCP, notifications and settings
- Port API-key creation/rotation/revocation/scopes; store only hashes and display secret once.
- Port public REST routes with versioning, validation, pagination, rate limits and tenant scope.
- Port signed outbound webhooks with timestamp/replay protection, retries, delivery logs and DLQ.
- Port MCP tools with scoped credentials and authorization per tool/action.
- Port notifications, quick replies, team settings, integration settings and audit trails.
- **Gate:** contract tests, key revocation, webhook replay and MCP authorization tests pass.

### Phase 10 — Frontend parity and hardening
- Connect all Vanilla JS screens to final API contracts; remove mock data and placeholder-only routes.
- Add accessible loading/empty/error states, pagination, safe optimistic updates and reconnect handling.
- Run unit, integration, contract, end-to-end, tenant isolation, dependency, container, SAST/DAST and load tests.
- Verify CSP, CORS, CSRF strategy, cookie flags, upload validation, API throttles and log redaction.
- **Gate:** every parity row has acceptance evidence and no critical/high unresolved security defect.

### Phase 11 — Staging, rehearsal and production cutover
- Deploy staging from immutable image digests and reviewed IaC.
- Run realistic load tests, Meta webhook tests, backup/restore drill, AZ failure rehearsal, queue replay and rollback rehearsal.
- Prepare a data migration rehearsal from an explicitly approved source dataset; do not connect to either protected Supabase project.
- Define freeze window, final reconciliation, DNS/traffic switch, monitoring watch and rollback criteria.
- Production cutover requires explicit approval and a verified backup.
- **Gate:** owner signs off RPO/RTO, data reconciliation, feature parity, support and rollback.

## 4. Supabase-to-AWS translation guide

| Supabase capability | AWS target | Required migration |
|---|---|---|
| Supabase Auth | Cognito User Pools | Map auth user IDs to Cognito `sub`; rebuild invitations, sessions, reset and verification |
| Profiles/account sharing | RDS PostgreSQL | Preserve profile semantics; create memberships/roles and tenant authorization |
| PostgreSQL database | RDS PostgreSQL | Port migrations, functions, triggers, extensions, indexes and grants |
| RLS / `auth.uid()` | PostgreSQL RLS + trusted app context | Rewrite policies; never trust browser claims |
| Supabase Storage | Private S3 | Port buckets, object paths, metadata, policies and signed URL behavior |
| Supabase Realtime | API Gateway WebSocket + outbox/SQS | Rebuild authorized subscriptions, reconnect and reconciliation |
| Edge Functions/API routes | ECS Fargate Node.js services | Port runtime, secrets, validation, auth and observability |
| Scheduled jobs | EventBridge Scheduler + SQS/Step Functions | Durable schedules, retries, cancellation and idempotency |
| RPC/Postgres functions | SQL functions or Node.js domain services | Review privilege and transaction behavior individually |
| Service role | IAM task role + restricted DB role | No browser service-role equivalent; least privilege per service |
| Supabase secrets | Secrets Manager + KMS | Separate per environment, rotation and audit |

## 5. Review protocol for all 58 source SQL migrations

For every source migration:
1. Record exact filename, order, checksum and source commit.
2. Identify tables, columns, indexes, constraints, triggers, functions, grants, RLS and storage/realtime side effects.
3. Classify Supabase dependencies: `auth.users`, `auth.uid()`, `storage.*`, `realtime.*`, extensions, RPC and service role.
4. Specify target SQL/API/IAM implementation and data conversion.
5. Add forward migration and rollback/compensation strategy where safe.
6. Add schema assertions and behavioral tests.
7. Review privilege escalation and tenant isolation.
8. Mark reviewed/ported only after tests pass.

Do not blindly execute source Supabase migrations on RDS. They may assume Supabase-managed schemas, roles, extensions, auth tables or storage services. Preserve source files as immutable references.

## 6. Testing strategy

- Unit: domain rules, validators, permissions, mapping, idempotency and queue handlers.
- Database integration: migrations from empty DB, constraints, transactions, RLS, triggers and rollback.
- Tenant isolation: positive/negative tests across APIs, exports, search, workers, WebSockets, webhooks, MCP and public API.
- Contract: SPA/API, Meta webhook/payload, public API and MCP tool contracts.
- End-to-end: auth, contacts, inbox, message lifecycle, broadcasts, automations, flows, AI and team operations.
- Resilience: duplicate/out-of-order events, retries, DLQ redrive, provider timeout, DB failover, worker termination and WebSocket reconnect.
- Security: JWT misuse, IDOR, CSRF/XSS, SQL injection, SSRF, upload abuse, webhook replay, API-key leakage and privilege escalation.
- Performance: dashboard queries, inbox pagination, broadcast fan-out, concurrent webhook ingestion, S3 transfers and AI quotas.

## 7. Definition of done

A feature is complete only when source behavior is documented; SPA uses real API behavior; server validates/authenticates; tenant and role permissions are enforced; schema/RLS are present; async work is durable/idempotent/observable; tests pass; recovery/errors are handled; audit requirements are met; and acceptance evidence is linked in the parity tracker.

## 8. Explicit exclusions and status

This plan does not provision AWS resources, create Cognito pools, RDS instances, buckets, queues, IAM roles, KMS keys or domains. It does not deploy code, create credentials, import customer data, connect to either existing Supabase project or modify upstream WACRM. The current Express/InsForge adapter is legacy scaffold and must be replaced in a separately reviewed implementation phase. Production deployment and data cutover require further explicit approval.
