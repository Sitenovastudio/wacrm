# SiteNova Connect

Vanilla JavaScript SPA and Node.js backend migration workspace for the original WACRM application.

## Current status

This is an additive migration workspace on `sitenova/vanilla-js-migration`. The original Next.js application, source files, MCP server and original Supabase SQL migrations remain in the repository as read-only migration references. The Vanilla JS frontend and Node API are still a scaffold; this is **not** a feature-complete CRM.

## Approved target architecture

The approved target is an AWS-native production backend in `ap-south-1` (Mumbai):
- Frontend: private Amazon S3 origin behind CloudFront and AWS WAF.
- Identity: Amazon Cognito User Pools.
- API/runtime: API Gateway HTTP API, VPC Link, internal ALB and Node.js services on ECS Fargate.
- Database: Amazon RDS for PostgreSQL, Multi-AZ in production, with tenant-aware PostgreSQL RLS.
- Files: private Amazon S3 buckets with short-lived presigned URLs.
- Background processing: Amazon SQS + dead-letter queues, EventBridge Scheduler and Step Functions where appropriate.
- Real-time: API Gateway WebSocket API.
- Security/operations: IAM task roles, KMS, Secrets Manager, CloudWatch, CloudTrail, X-Ray and ECR.

See [AWS_ARCHITECTURE_BLUEPRINT.md](./docs/AWS_ARCHITECTURE_BLUEPRINT.md) and [AWS_MIGRATION_IMPLEMENTATION_PLAN.md](./docs/AWS_MIGRATION_IMPLEMENTATION_PLAN.md).

## Legacy scaffold notice

The current `server/insforge.js`, InsForge environment settings and InsForge-specific docs are historical prototype scaffolding from the earlier design. They are **not** the approved target and must be replaced/retired during AWS implementation. Do not deploy them as the final backend. The architecture documents are plans, not proof that AWS services or application features are implemented.

## Local development

The current SPA/API scaffold can be inspected locally using Node.js 20+:
```bash
cd sitenova-connect
npm install
npm run check
npm run dev
```
This runs the current scaffold only; it does not connect to AWS or provision infrastructure. AWS adapters, Cognito flows, database migrations, SQS workers and feature APIs are not yet implemented.

## Migration and data safety

- Upstream `ArnasDon/wacrm` remains unchanged; work only in this fork and migration branch.
- Both existing managed Supabase projects are explicitly out of scope and must remain untouched.
- Do not run original Supabase migrations against either existing Supabase project.
- Review and port all 58 source SQL migrations individually for RDS; Supabase-specific auth, RLS, storage, realtime, RPC and edge-function assumptions require translation.
- Do not import real customer data or activate production WhatsApp webhooks before security, tenant-isolation and parity gates pass.
- Preserve the original MIT license and attribution.
