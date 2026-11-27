# SiteNova Connect Deployment Runbook

This runbook is for a new, dedicated Linux VPS. Never run it against either existing managed Supabase project or a server hosting unrelated production workloads.

## Before provisioning

- Confirm a VPS budget and provider. A production self-hosted Supabase stack needs at least 4 GB RAM / 2 CPU / 40 GB SSD by the current official Docker guide; 8 GB / 4 CPU / 80 GB SSD is recommended.
- Register DNS names for the app, API and (restricted) Studio.
- Prepare a separate off-host backup destination.
- Confirm SMTP delivery and an S3-compatible object-storage plan if off-host media storage is required.
- Decide recovery point objective (RPO), recovery time objective (RTO), retention and maintenance window.

## Host preparation

1. Provision a supported Ubuntu/Debian LTS server.
2. Create a non-root deployment user with SSH key authentication.
3. Configure a firewall. Public ingress should be limited to 80/443 and controlled SSH. Do not expose PostgreSQL, Supavisor, internal APIs or Studio publicly.
4. Install Docker Engine and the Compose plugin from the official Docker repository.
5. Install and configure Caddy or Nginx for TLS termination.
6. Configure host updates, time synchronization, disk monitoring and log rotation.

## Supabase stack

Follow the current official guide: https://supabase.com/docs/guides/self-hosting/docker

Use the official versioned self-hosted release. Generate fresh secrets on the host. Configure public URLs, database password, JWT signing keys, dashboard credentials, SMTP and storage. Protect the Studio hostname with VPN or an IP allowlist and strong credentials.

Do not commit the vendor Supabase `docker/` directory or generated `.env` secrets into this application repository. Keep deployment configuration in a private operations repository or on the host with restricted permissions.

## Application deployment

1. Build and test the SPA/API image in CI.
2. Inject runtime secrets through the host's secret-management mechanism.
3. Run the API and worker as separate processes/containers.
4. Mount persistent volumes only where needed.
5. Configure health checks, restart policies, CPU/memory limits and graceful shutdown.
6. Route public app traffic through HTTPS reverse proxy.
7. Configure Meta webhook URL over HTTPS and verify its challenge/signature.
8. Test login, account isolation, inbox send/receive, media upload, scheduled jobs, backups and restore.

## Backup/restore gate

Before every release or migration:
- Verify the latest database backup is recent and decryptable.
- Verify the object-storage backup.
- Restore both to a non-production environment.
- Record restore time and validation results.
- Do not proceed if restore verification fails.

## Production cutover

Production launch requires completed feature parity, security review, migration rehearsal, backup restore test, load test, webhook test, monitoring/alerting, rollback plan and explicit owner approval.
