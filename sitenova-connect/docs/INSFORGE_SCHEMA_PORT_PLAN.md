> **SUPERSEDED — historical reference only.** The approved SiteNova Connect backend is AWS-native: Cognito, Amazon RDS for PostgreSQL, ECS Fargate, S3, SQS and related services in `ap-south-1`. Do not provision or deploy InsForge for this project. See `AWS_ARCHITECTURE_BLUEPRINT.md` and `AWS_MIGRATION_IMPLEMENTATION_PLAN.md`. No AWS resources have been created; both existing Supabase projects remain untouched.

# WACRM database migration inventory — AWS RDS target

Source: `ArnasDon/wacrm`, `supabase/migrations/`.
Target: Amazon RDS for PostgreSQL in `ap-south-1`.
Status: **reference inventory only — none of these SQL files have been executed or ported yet.**

The source has 58 SQL migrations. Preserve their ordering and review every statement. Some gaps in numbering are intentional in the source repository; do not renumber the source files or infer missing migrations.

| Source migration | Domain / review focus | AWS target status |
|---|---|---|
| `001_initial_schema.sql` | Profiles, contacts, tags, custom fields, core tables | Not ported |
| `002_pipelines_enhancements.sql` | Pipeline schema and stages | Not ported |
| `003_broadcast_recipient_wamid.sql` | Broadcast recipient message identifiers | Not ported |
| `004_contact_delete_set_null.sql` | Contact deletion relationship behavior | Not ported |
| `005_broadcast_counts_incremental.sql` | Broadcast aggregate counters | Not ported |
| `006_automations.sql` | Automation definitions and actions | Not ported |
| `007_automations_increment_counter.sql` | Automation execution counters | Not ported |
| `008_profile_avatars_storage.sql` | Avatar storage bucket and policies | Not ported |
| `009_message_actions.sql` | Message actions | Not ported |
| `010_flows.sql` | Flow definitions and nodes | Not ported |
| `011_profile_beta_features.sql` | Profile feature flags | Not ported |
| `012_flows_increment_counter.sql` | Flow run counters | Not ported |
| `013_whatsapp_config_phone_number_id_unique.sql` | WhatsApp account uniqueness | Not ported |
| `014_message_templates_meta_integration.sql` | Meta template integration | Not ported |
| `015_whatsapp_config_registration.sql` | WhatsApp registration state | Not ported |
| `016_flow_media.sql` | Flow media storage | Not ported |
| `017_account_sharing.sql` | Accounts and memberships | Not ported |
| `018_account_member_rpcs.sql` | Membership database functions | Not ported |
| `019_invitation_rpcs.sql` | Invitation functions | Not ported |
| `020_account_sharing_followups.sql` | Membership follow-up constraints/functions | Not ported |
| `021_account_default_currency.sql` | Account currency | Not ported |
| `022_contact_phone_dedup.sql` | Contact phone deduplication | Not ported |
| `023_chat_media.sql` | Conversation media | Not ported |
| `024_member_presence.sql` | Team member presence | Not ported |
| `025_filter_contacts_by_tags.sql` | Contact tag filtering | Not ported |
| `026_api_keys.sql` | API key records and scopes | Not ported |
| `027_notifications.sql` | Notifications | Not ported |
| `028_webhook_endpoints.sql` | Outbound webhook configuration | Not ported |
| `029_ai_reply.sql` | AI reply configuration | Not ported |
| `030_ai_knowledge.sql` | Knowledge base | Not ported |
| `031_ai_reply_slot_grant.sql` | AI reply permissions | Not ported |
| `032_fix_ai_knowledge_membership.sql` | Knowledge base membership authorization | Not ported |
| `033_ai_reply_polish.sql` | AI reply schema/functions | Not ported |
| `034_fix_profiles_update_rls.sql` | Profile authorization correction | Not ported |
| `035_interactive_messages.sql` | Interactive WhatsApp messages | Not ported |
| `036_conversation_contact_dedup.sql` | Conversation/contact deduplication | Not ported |
| `037_webhook_broadcast_reliability.sql` | Webhook and broadcast reliability | Not ported |
| `038_broadcast_resume.sql` | Broadcast resume behavior | Not ported |
| `039_inbound_media_mirror.sql` | Inbound media mirroring | Not ported |
| `040_contact_business_scoped_user_id.sql` | WhatsApp business-scoped identities | Not ported |
| `041_fix_broadcast_contact_id_ambiguity.sql` | Broadcast relationship correction | Not ported |
| `042_message_failure_reason.sql` | Message failure metadata | Not ported |
| `043_storage_scoped_select.sql` | Storage access scope | Not ported |
| `044_internal_definer_grants.sql` | Privileged database function grants | Not ported |
| `045_automation_wait_for_reply.sql` | Automation wait-for-reply state | Not ported |
| `046_ai_openai_compatible.sql` | AI provider compatibility | Not ported |
| `047_account_membership_integrity.sql` | Account membership integrity | Not ported |
| `048_quick_reply_content_matches_kind.sql` | Quick reply validation | Not ported |
| `049_broadcast_params_jsonb.sql` | Broadcast parameter JSON | Not ported |
| `051_automation_pending_integrity.sql` | Automation pending-state integrity | Not ported |
| `052_flow_run_integrity.sql` | Flow run integrity | Not ported |
| `053_ai_reply_integrity.sql` | AI reply integrity | Not ported |
| `054_webhook_status_integrity.sql` | Webhook status integrity | Not ported |
| `055_authz_membership_holes.sql` | Authorization boundary fixes | Not ported |
| `057_message_templates_account_unique.sql` | Account-scoped template uniqueness | Not ported |
| `058_engine_race_gaps.sql` | Automation/flow race conditions | Not ported |
| `059_dashboard_overview.sql` | Dashboard aggregate queries | Not ported |
| `060_inbound_unsupported_reason.sql` | Unsupported inbound message reason | Not ported |

## Mandatory compatibility review per migration

1. Identify all tables, columns, constraints, indexes, triggers, functions, extensions and storage changes.
2. Identify every dependency on `auth.users`, `auth.uid()`, JWT claims, Supabase roles, service-role bypass and Supabase Storage internals.
3. Re-map user identity to AWS Auth without assuming the internal `auth` schema is exposed through the public data API.
4. Rebuild account/member authorization with explicit tenant checks and least-privilege RLS policies. Test cross-account read/write denial.
5. Rework storage buckets and policies through InsForge Storage; never assume Supabase bucket APIs or policy tables are compatible.
6. Validate Postgres extensions and function privileges against the pinned local InsForge image.
7. Add an upgrade-safe target migration with a rollback or recovery note.
8. Run migration tests on a disposable local database, then test app-level flows.

## Do not do

- Do not run original Supabase migration files directly against InsForge without review.
- Do not point any migration tool at either of the user's existing managed Supabase projects.
- Do not import real contacts/messages until tenant isolation, backups and restore have passed.
- Do not mark a migration complete based on SQL execution alone; verify its dependent feature behavior.
