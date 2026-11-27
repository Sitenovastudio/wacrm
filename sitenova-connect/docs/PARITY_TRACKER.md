# SiteNova Connect Feature Parity Tracker — AWS Target

A feature is complete only when its Vanilla JS frontend, AWS-backed API, database behavior, authorization, background processing, migration and automated acceptance tests pass. A placeholder screen or route does not count.

| Domain | Source area | SPA | AWS API/service | RDS schema/RLS | Tests | Status |
|---|---|---|---|---|---|---|
| Auth and invitations | `src/app/(auth)`, `src/app/auth`, `src/app/join` | Scaffold only | Cognito + membership API pending | Pending | Pending | Not migrated |
| Dashboard | dashboard pages/components | Scaffold only | ECS API + RDS aggregates pending | Pending | Pending | Not migrated |
| Inbox/messages/media | inbox components, WhatsApp API/webhook | Scaffold only | ECS + SQS + WebSocket + S3 pending | Pending | Pending | Not migrated |
| Contacts/tags/import | contacts components/API | Scaffold only | ECS API + S3 import jobs pending | Pending | Pending | Not migrated |
| Pipelines | pipeline pages/components | Scaffold only | ECS API pending | Pending | Pending | Not migrated |
| Templates/broadcasts | broadcast pages, Meta templates API | Scaffold only | ECS + Meta API + SQS workers pending | Pending | Pending | Not migrated |
| Automations | automation pages/API | Scaffold only | EventBridge + SQS + ECS workers pending | Pending | Pending | Not migrated |
| Flows | flow pages/API | Scaffold only | ECS + Step Functions where appropriate pending | Pending | Pending | Not migrated |
| AI/knowledge | agent pages, AI APIs | Scaffold only | ECS provider adapter + S3 + retrieval pending | Pending | Pending | Not migrated |
| Team/settings/API keys | account, invitations, settings APIs | Scaffold only | Cognito + ECS RBAC/API-key services pending | Pending | Pending | Not migrated |
| Public API/webhooks | `src/app/api/v1`, webhook routes | Pending | API Gateway + ECS + SQS pending | Pending | Pending | Not migrated |
| MCP | `mcp-server` | Original retained | AWS-backed scoped adapter pending | Pending | Pending | Not migrated |
| Notifications/quick replies | quick-replies, dashboard notifications | Pending | WebSocket + ECS + RDS pending | Pending | Pending | Not migrated |

## AWS backend readiness gates

- [ ] AWS account/environment ownership, region, budget, quotas and RPO/RTO approved.
- [ ] Infrastructure blueprint and threat model approved.
- [ ] IaC reviewed; dev environment provisioned only after separate approval.
- [ ] Cognito lifecycle and identity-to-membership mapping tests pass.
- [ ] All 58 source migrations reviewed and individually mapped to RDS target migrations.
- [ ] RLS and cross-tenant isolation tests pass for API, exports, workers, WebSockets, public API, webhooks and MCP.
- [ ] S3 private access, upload validation, presigned URL expiry and object deletion tests pass.
- [ ] SQS retries, idempotency, DLQ and redrive tests pass.
- [ ] Meta webhook signature, deduplication and message lifecycle tests pass.
- [ ] Backup/restore, rollback, monitoring and incident runbooks are demonstrated.
- [ ] Every feature row has end-to-end acceptance evidence before marking migrated.

## Migration boundaries

The former InsForge scaffold is legacy and is not a target backend. No AWS resources have been provisioned, no AWS credentials created, no source data imported, and neither existing managed Supabase project has been touched. Original WACRM source and SQL migrations remain read-only references until each feature is ported and accepted.
