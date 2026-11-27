# SiteNova Connect — Local Self-Hosted InsForge Setup

This is a local development setup. It does not modify either existing managed Supabase project.

## Prerequisites

- Docker Desktop with Docker Compose v2 (Windows/macOS) or Docker Engine + Compose v2 (Linux).
- Git and Node.js 20+.
- Allocate at least 4 GB RAM to Docker as an initial local baseline; 8 GB+ is preferable.
- Free disk space for images, PostgreSQL data, logs and uploaded media.

## Install InsForge separately

Use a dedicated folder, separate from the WACRM repository. InsForge's official setup helper downloads its Compose files and generates private secrets; it does not start containers. Inspect the helper before running it:

```bash
mkdir -p ~/sitenova-infrastructure
curl -fsSL https://raw.githubusercontent.com/InsForge/InsForge/main/deploy/setup.sh -o /tmp/insforge-setup.sh
less /tmp/insforge-setup.sh
sh /tmp/insforge-setup.sh ~/sitenova-infrastructure/insforge
cd ~/sitenova-infrastructure/insforge
```

Review the generated `.env`. Keep its secrets private. Set `API_BASE_URL` and `VITE_API_BASE_URL` for your local browser-facing URL as described by the official InsForge README. Keep a unique `COMPOSE_PROJECT_NAME` if you run more than one instance; different directories sharing a Compose project name can share/adopt containers and volumes.

Start and inspect:

```bash
docker compose up -d
docker compose ps
docker compose logs -f --tail=100
```

Use the dashboard/admin UI port shown in the generated Compose configuration (the current upstream setup commonly uses APP_PORT 7130 and UI_PORT 7132; do not assume ports if you changed them). Keep PostgreSQL, PostgREST and internal auth/admin ports local/private.

## Configure SiteNova Connect

In a second terminal:

```bash
cd <path-to-your-wacrm-clone>/sitenova-connect
cp .env.example .env
```

Map InsForge's generated `ACCESS_ANON_KEY` to `INSFORGE_ANON_KEY` and `ACCESS_API_KEY` to `INSFORGE_API_KEY`. The latter is server-only and must never enter browser bundles. Set `INSFORGE_BASE_URL` to the local InsForge API base URL.

Then:

```bash
npm install
npm run check
npm run dev
```

Open `http://localhost:3000`. The UI/API remain a migration scaffold; feature modules and schema are not yet ported.

## Verify isolation

- Confirm InsForge has its own containers, volumes, database and generated secrets.
- Confirm the database is not publicly reachable.
- Confirm neither existing Supabase project URL/key is present in this app's environment.
- Test Auth, a disposable table and Storage before schema migration.
- Do not import customer data until authorization and tenant-isolation tests pass.

## Stop safely

```bash
docker compose stop
docker compose start
```

`docker compose down` removes containers but preserves named volumes. Avoid `docker compose down -v`: it deletes this local InsForge data.

Local Docker is not production hosting. Production needs a dedicated always-on server, HTTPS, firewall, persistent volumes, encrypted off-host backups, tested restores, monitoring, SMTP, object-storage strategy and a tested rollback process.
