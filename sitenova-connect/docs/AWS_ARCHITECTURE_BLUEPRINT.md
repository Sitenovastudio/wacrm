# SiteNova Connect — AWS Production Architecture Blueprint

**Approved target:** AWS-native backend replacing InsForge  
**Region:** `ap-south-1` (Mumbai)  
**Database:** Amazon RDS for PostgreSQL  
**Deployment:** Production-ready, with isolated development, staging and production environments  
**Status:** Design only. No AWS resources, credentials, deployments or data migrations have been created.

## 1. Objectives and boundaries

- Preserve the original WACRM feature set and behavior; placeholder screens/routes do not count as parity.
- Keep the Vanilla JavaScript SPA and Node.js application runtime.
- Keep upstream `ArnasDon/wacrm` unchanged; work only in `Sitenovastudio/wacrm`, branch `sitenova/vanilla-js-migration`.
- Keep both existing managed Supabase projects untouched. They are not migration targets and must not be connected, modified, paused, deleted or used for testing.
- Retain original WACRM source, SQL migrations and MIT attribution as read-only references until parity acceptance and an explicitly approved cutover.
- Never commit credentials, real environment files, access tokens, private keys or customer data.

## 2. Logical architecture

```text
Browser --HTTPS--> Route 53 / CloudFront + AWS WAF
                         |                     |
                         |                     +--> private S3 origin (SPA assets)
                         |
                         +--> API Gateway HTTP API (Cognito JWT authorizer)
                                      |
                                   VPC Link
                                      |
                                  internal ALB
                                      |
                              ECS Fargate (private)
                             /       |       \
                           API    Webhook   Workers
                            |       |         |
                       Cognito   Meta API   SQS + DLQs
                            |                 |
                       RDS PostgreSQL <--- EventBridge /
                          |                 Step Functions
                       RDS Proxy
                            |
                     private S3 objects
                            |
                   API Gateway WebSocket
                   (authorized live inbox)

Cross-cutting: IAM task roles, KMS, Secrets Manager, ECR,
CloudWatch, CloudTrail, X-Ray, AWS Backup.
```

## 3. Service design

| Layer | AWS service | Design responsibility |
|---|---|---|
| DNS/edge | Route 53, CloudFront, AWS WAF | DNS, TLS edge, static delivery, managed rules and rate controls |
| Frontend | Private S3 + CloudFront OAC | Host Vanilla JS/CSS; S3 Block Public Access remains enabled |
| Authentication | Cognito User Pools | Signup, sign-in, verification, password reset, token lifecycle and MFA options |
| REST ingress | API Gateway HTTP API | Cognito JWT authorizer, throttling, access logs and request limits |
| Private routing | VPC Link + internal ALB | Route API requests to private ECS services |
| Application | ECS Fargate | Modular Node.js API, webhook service and independently scalable workers |
| Database | RDS PostgreSQL | Relational CRM, conversations, messages, settings, audit and job metadata |
| Connection pooling | RDS Proxy | Protect PostgreSQL from bursty ECS connection counts |
| Files | Private Amazon S3 | WhatsApp media, avatars, imports/exports, knowledge files and generated assets |
| Async jobs | SQS + dead-letter queues | Durable message, campaign, webhook, import, media and automation jobs |
| Scheduling/orchestration | EventBridge Scheduler + Step Functions | Delayed/recurring jobs and durable multi-step workflows |
| Realtime | API Gateway WebSocket API | Live inbox updates, presence and notifications |
| Cache | ElastiCache Redis (optional) | Cache, ephemeral presence and distributed rate-limit state; not source of truth |
| AI | Amazon Bedrock or provider adapter | AI agents/replies and retrieval integration; keep provider-neutral |
| Secrets/security | IAM, KMS, Secrets Manager | Least privilege, encryption and secret rotation |
| Operations | CloudWatch, CloudTrail, X-Ray | Logs, metrics, alarms, audit and tracing |
| Containers | ECR | Immutable API/worker images |

Meta WhatsApp Cloud API remains the WhatsApp provider. AWS hosts the secure integration, webhook verification, queues, workers, media and delivery-state synchronization; it does not replace Meta onboarding, phone registration, templates or WhatsApp policy requirements.

## 4. Network and environment layout

Use isolated dev, staging and production environments. Prefer separate AWS accounts under AWS Organizations; if not initially possible, use separate VPCs, IAM roles, KMS keys, buckets, databases and secrets.

Each environment:
- One VPC across at least two Availability Zones.
- Public subnets only for required ingress/egress components.
- Private application subnets for ECS tasks and internal ALB targets.
- Isolated database subnets for RDS and Redis.
- Strict security-group rules; no public database endpoint.
- S3 and other supported VPC endpoints where useful.
- Controlled NAT/egress for Meta, AI and email provider calls.
- VPC Flow Logs and CloudTrail per retention policy.

Production baseline: ECS spread across at least two AZs, RDS Multi-AZ, encrypted backups, health checks, deployment rollback, alarms and tested restore. Multi-region DR is a separate costed decision, not included automatically.

## 5. Identity, tenant model and database security

Cognito is the identity provider, not the CRM authorization database. Link Cognito `sub` to an internal application user. Store tenants, memberships, roles, permissions, invitations, entitlements and audit history in PostgreSQL.

Use pooled PostgreSQL tenancy with a mandatory `tenant_id` on tenant-owned records unless source behavior requires a documented exception. Enforce tenant access with PostgreSQL Row-Level Security (RLS).

Required rules:
1. API verifies Cognito issuer, audience, expiry and token use.
2. Server maps Cognito `sub` to an active application user and membership.
3. Tenant context is set transaction-locally only after membership verification.
4. Enable and FORCE RLS on tenant-owned tables where compatible with the schema.
5. Runtime DB roles must not own tables, be superusers or have BYPASSRLS.
6. Never trust browser-supplied tenant ID, user ID, role or account ID.
7. Workers re-check tenant/resource ownership; queue payloads are not authorization.
8. Test cross-tenant denial across APIs, joins, search, exports, workers, WebSockets, public API keys, webhooks and MCP.
9. Separate migration, runtime, reporting and break-glass DB roles.

Use parameterized SQL, explicit transaction boundaries, indexes, constraints and query timeouts. Use pgvector only after validating extension availability and the retrieval design.

## 6. S3 design

Use private buckets for SPA assets, user/media objects, imports/exports, knowledge documents and backups. Separate buckets or strict prefixes/policies by environment and data class.

- Enable S3 Block Public Access and bucket-owner-enforced object ownership.
- Encrypt at rest (SSE-KMS where appropriate), enable versioning and lifecycle rules.
- Keep object metadata/ownership in PostgreSQL; do not place personal data in object keys.
- Issue short-lived presigned URLs only after backend authorization.
- Validate size, MIME type, extension and checksum; scan untrusted uploads before use.
- Do not expose AWS credentials in the browser or use S3 as a relational database/public file server.

## 7. WhatsApp, jobs and real-time processing

Inbound flow: Meta webhook -> verify signature against raw body -> persist event/idempotency record -> transactional outbox/SQS -> worker updates PostgreSQL -> authorized WebSocket notification.

Outbound flow: API persists outbound message -> SQS -> worker sends via Meta -> provider callbacks update accepted/sent/delivered/read/failed states. Store media in private S3.

Use separate queues for inbound events, outbound messages, broadcasts, media, automation runs and outbound webhooks. Configure visibility timeouts, bounded retries, exponential backoff, DLQs, alarms and redrive. Every consumer must be idempotent. Use FIFO only where strict per-conversation ordering is proven necessary.

EventBridge Scheduler handles delayed/recurring jobs. Step Functions orchestrates long-running flows where durable waits, branching or retries justify it. Persist before publishing real-time events; clients reconnect and reconcile from the API.

## 8. AI and knowledge

Place AI behind a provider adapter. Bedrock is an available AWS-native option; preserve an approved external-provider option. Store agent configuration, usage, quotas and document metadata in PostgreSQL. Store source documents in private S3 and extract/chunk/index asynchronously. Evaluate pgvector or a dedicated retrieval service before committing to one. Apply tenant isolation, prompt-injection defenses, PII controls and human-approval settings.

## 9. Planned resource inventory (not created)

| Area | Planned resources |
|---|---|
| Edge | Route 53 records, CloudFront, OAC, WAF web ACL |
| Network | VPC, 2+ AZ subnets, routes, NAT/egress, VPC endpoints, security groups |
| Identity | Cognito User Pool, app clients and domain |
| Compute | ECR, ECS cluster/services/task definitions, internal ALB, VPC Link |
| Data | RDS PostgreSQL Multi-AZ, subnet/parameter groups, RDS Proxy, KMS key |
| Storage | Private S3 buckets for frontend, tenant objects and backups |
| Jobs | SQS queues/DLQs, EventBridge schedules, Step Functions |
| Realtime/cache | API Gateway WebSocket; optional ElastiCache Redis |
| Security/ops | IAM task roles, KMS, Secrets Manager, CloudWatch, CloudTrail, X-Ray |
| Delivery | GitHub Actions OIDC role and reviewed deployment workflow |

Exact resource names, CIDRs, sizing, retention, KMS policies, WAF rules and quotas are implementation-time decisions requiring review and cost approval.

## 10. Reliability, monitoring and recovery

- Structured JSON logs with request/trace IDs and non-sensitive tenant/actor identifiers; redact tokens, secrets and message bodies by default.
- CloudWatch alarms for API latency/errors, ECS health/CPU/memory, SQS age/depth/DLQ, webhook failures, Meta send failures, RDS connections/storage/CPU and S3 errors.
- Trace API, DB and worker paths with X-Ray or OpenTelemetry.
- RDS automated backups and point-in-time recovery; periodic encrypted snapshots.
- S3 versioning and lifecycle policies; consider replication/Object Lock only if retention needs justify them.
- Define RPO/RTO with the business owner and demonstrate PostgreSQL and object restore.
- Document incidents for credential compromise, tenant breach, Meta outage, queue backlog, poison messages, DB failover and accidental deletion.

## 11. Security and cost gates

Use least-privilege IAM task roles and GitHub Actions OIDC; no permanent app access keys. Store Meta/AI/SMTP/database secrets in Secrets Manager and rotate them. Enforce TLS, KMS encryption, WAF, API throttles, upload scanning, signed/replay-protected outbound webhooks, hashed/scoped API keys, dependency/container/secret scanning and audit logs.

No monthly cost is asserted. Estimate RDS/Multi-AZ/backups, ECS, ALB, API Gateway, NAT, CloudFront, S3, SQS, CloudWatch, KMS, Redis and AI token usage using actual region pricing and workload assumptions before provisioning.

## 12. Acceptance criteria

- No InsForge SDK, endpoint, key or runtime dependency remains after AWS cutover.
- Cognito identity and database membership/permissions protect all routes.
- RLS cross-tenant negative tests pass for synchronous and asynchronous paths.
- No public S3 bucket or public RDS endpoint.
- Webhook signature, idempotency, retry and DLQ tests pass.
- All 58 source SQL migrations have a documented compatibility decision and target migration/test.
- All original WACRM feature areas pass end-to-end acceptance.
- Backup restore, rollback, monitoring and incident runbooks are demonstrated.
- Production cutover receives explicit approval.

## 13. Approval boundary

This is a design document only. It does not create AWS resources, open an AWS account, create Cognito users, issue credentials, deploy code, import data, connect either existing Supabase project or modify upstream WACRM. Provisioning requires separate explicit approval after cost, ownership and security review.
