# SiteNova Connect — AWS Production Plan

## Approved target

- Region: AWS Asia Pacific (Mumbai), `ap-south-1`.
- Database: Amazon RDS for PostgreSQL, Multi-AZ for production.
- Frontend: Vanilla JS SPA hosted in private S3 behind CloudFront + WAF.
- Identity: Amazon Cognito.
- Application runtime: Node.js API, webhook and worker services on ECS Fargate.
- API ingress: API Gateway HTTP API + Cognito JWT authorizer + VPC Link + internal ALB.
- Files: private S3 buckets with KMS encryption and short-lived presigned URLs.
- Async processing: SQS/DLQs, EventBridge Scheduler and Step Functions where required.
- Realtime: API Gateway WebSocket API.
- Security/operations: IAM task roles, KMS, Secrets Manager, CloudWatch, CloudTrail, X-Ray and ECR.

The full design is in [AWS_ARCHITECTURE_BLUEPRINT.md](./AWS_ARCHITECTURE_BLUEPRINT.md). The phased source-to-AWS work plan is in [AWS_MIGRATION_IMPLEMENTATION_PLAN.md](./AWS_MIGRATION_IMPLEMENTATION_PLAN.md).

## Environment strategy

Maintain isolated dev, staging and production environments. Prefer separate AWS accounts under AWS Organizations. Production must use private application/database subnets, RDS Multi-AZ, encrypted backups, deployment approvals, observability, incident runbooks and tested restore/rollback.

## Migration requirements

The source WACRM app uses Supabase-specific authentication, database policies, storage, realtime and server-side APIs. The 58 source SQL migrations require individual review and translation; they must not be run unchanged against RDS. Rebuild Cognito identity mapping, PostgreSQL RLS, S3 access, WebSocket events, durable jobs and all application APIs. Preserve original feature behavior and MIT attribution.

## Isolation and safety

- Work only in `Sitenovastudio/wacrm`, branch `sitenova/vanilla-js-migration`.
- Keep upstream `ArnasDon/wacrm` unchanged.
- Keep both existing managed Supabase projects untouched; do not connect to them or run migrations against them.
- Do not commit credentials or real customer data.
- The InsForge adapter and docs are legacy scaffolding, not the target architecture.

## Current status

Blueprint and migration plan are documentation only. No AWS resources, IAM roles, Cognito pools, RDS databases, S3 buckets, queues, domains or deployments have been created. No customer data has been migrated. No production WhatsApp webhook has been activated. The current SPA/API remains a scaffold and is not feature complete.

## Provisioning gate

Any AWS provisioning, billable resource creation, account access, credential creation, DNS change, deployment or data cutover requires separate explicit approval after cost estimate, ownership confirmation, security review and a reviewed IaC plan.
