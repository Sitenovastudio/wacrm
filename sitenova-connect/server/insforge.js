import { createAdminClient, createClient } from "@insforge/sdk";

// InsForge public clients are user-scoped; admin clients must remain server-only.
// Feature repositories will be implemented after the local release is pinned.
export function getInsForgePublicConfig(config) {
  if (!config.insforgeBaseUrl || !config.insforgeAnonKey) return null;
  return Object.freeze({ baseUrl: config.insforgeBaseUrl, anonKey: config.insforgeAnonKey });
}

export function createInsForgeUserClient(config) {
  return createClient({ baseUrl: config.insforgeBaseUrl, anonKey: config.insforgeAnonKey });
}

export function createInsForgeAdmin(config) {
  if (!config.insforgeApiKey) return null;
  return createAdminClient({ baseUrl: config.insforgeBaseUrl, apiKey: config.insforgeApiKey });
}
