# SiteNova Connect AWS Deployment Runbook

**Target region:** `ap-south-1` (Mumbai)  
**Target backend:** Cognito + RDS PostgreSQL + ECS Fargate + S3 + SQS  
**Current status:** Planning only. No AWS resources have been provisioned.

## 1. Before provisioning

1. Review `AWS_ARCHITECTURE_BLUEPRINT.md` and `AWS_MIGRATION_IMPLEMENTATION_PLAN.md`.
2. Confirm AWS account owner, account IDs, billing alerts, budget, quotas, domain ownership and access model.
3. Approve dev/staging/prod account or isolation strategy.
4. Approve VPC CIDRs, AZ layout, egress/NAT, endpoints, security groups, TLS and DNS.
5. Approve RDS PostgreSQL version, instance/storage sizing, Multi-AZ, backup retention, KMS and RPO/RTO.
6. Approve S3 buckets, encryption, versioning, lifecycle, upload limits and retention.
7. Approve Cognito configuration, email/SMS delivery and MFA policy.
8. Approve WAF, API throttles, log retention, alerts and incident runbooks.
9. Complete a region-specific cost estimate and security review.
10. Review IaC plan before any apply operation.

## 2. Provisioning sequence (only after explicit approval)

1. Bootstrap IaC state and CI/CD OIDC trust.
2. Create network, subnets, route tables, security groups and VPC endpoints.
3. Create KMS keys and least-privilege IAM roles/policies.
4. Create private S3 buckets and CloudFront OAC/WAF configuration.
5. Create Cognito User Pool and application clients.
6. Create RDS PostgreSQL, subnet/parameter groups, backups and RDS Proxy.
7. Create ECR repositories, ECS cluster/services, internal ALB and API Gateway integrations.
8. Create SQS queues/DLQs, EventBridge schedules and WebSocket API.
9. Configure Secrets Manager and CloudWatch logs/alarms.
10. Deploy only reviewed application images and migrations into disposable dev first.

## 3. Validation

- Confirm RDS has no public endpoint and only approved security groups can connect.
- Confirm S3 Block Public Access and OAC; test unauthorized object access.
- Confirm Cognito JWT validation and application membership/role checks.
- Confirm RLS tenant-isolation tests and worker tenant scoping.
- Confirm API throttling, WAF rules, TLS, CORS and cookie/session security.
- Confirm webhook signature verification, idempotency, retries and DLQ redrive.
- Confirm CloudWatch alarms, audit logging and secret redaction.
- Demonstrate RDS restore, S3 recovery, deployment rollback and queue replay.

## 4. Production release gate

Production release requires feature parity acceptance, load/security tests, backup restore, operational readiness, a reviewed change window, a verified backup and explicit approval. Production cutover and data import are not authorized by this runbook.

## 5. Data safety

Both existing managed Supabase projects are explicitly excluded. Do not connect to them, run SQL against them, change their settings, use their credentials or move data from them. The upstream WACRM repository remains read-only. Use synthetic fixtures until a separately approved data-source and migration procedure exists.

## 6. Current scaffold note

The current `sitenova-connect/server/insforge.js` and InsForge environment settings are legacy prototype code. They are not the final AWS backend. Do not deploy the current scaffold as a production application.
