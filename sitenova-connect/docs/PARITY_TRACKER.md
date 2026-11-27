# SiteNova Connect Feature Parity Tracker

A feature is complete only when its frontend, backend, authorization, data migration and automated acceptance tests pass. A placeholder screen or route does not count as migrated.

| Domain | Source area | SPA | API/service | InsForge schema/RLS | Tests | Status |
|---|---|---|---|---|---|---|
| Auth and invitations | src/app/(auth), src/app/auth, src/app/join | Pending | Pending | Pending | Pending | Not migrated |
| Dashboard | src/app/(dashboard)/dashboard, components/dashboard | Scaffold only | Pending | Pending | Pending | Not migrated |
| Inbox/messages/media | src/app/(dashboard)/inbox, components/inbox, api/whatsapp | Scaffold only | Pending | Pending | Pending | Not migrated |
| Contacts/tags/import | src/app/(dashboard)/contacts, components/contacts | Scaffold only | Pending | Pending | Pending | Not migrated |
| Pipelines | src/app/(dashboard)/pipelines | Scaffold only | Pending | Pending | Pending | Not migrated |
| Templates/broadcasts | src/app/(dashboard)/broadcasts, api/whatsapp/templates | Scaffold only | Pending | Pending | Pending | Not migrated |
| Automations | src/app/(dashboard)/automations, api/automations | Scaffold only | Pending | Pending | Pending | Not migrated |
| Flows | src/app/(dashboard)/flows, api/flows | Scaffold only | Pending | Pending | Pending | Not migrated |
| AI/knowledge | src/app/(dashboard)/agents, api/ai | Scaffold only | Pending | Pending | Pending | Not migrated |
| Team/settings/API keys | api/account, api/invitations, settings | Scaffold only | Pending | Pending | Pending | Not migrated |
| Public API/webhooks | src/app/api/v1 | Pending | Pending | Pending | Pending | Not migrated |
| MCP | mcp-server | Original retained | Original retained | Pending | Pending | Not migrated |
| Notifications/quick replies | api/quick-replies, dashboard/notifications | Pending | Pending | Pending | Pending | Not migrated |

## Backend migration gate

- [ ] Local InsForge stack starts and health checks pass.
- [ ] SDK and InsForge image/release versions are pinned.
- [ ] Auth sign-up, sign-in, verification, refresh, sign-out and recovery tests pass.
- [ ] All 58 source migrations have an individual compatibility review.
- [ ] Tenant/account isolation tests deny cross-account reads and writes.
- [ ] Storage upload/download/delete authorization tests pass.
- [ ] Realtime behavior and reconnect tests pass.
- [ ] Durable job queue, retries, idempotency and dead-letter behavior pass.
- [ ] Backup and restore are demonstrated on a disposable instance.

Original Next.js source and migrations remain available until every feature passes acceptance testing and production cutover is explicitly approved.
