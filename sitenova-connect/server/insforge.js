/**
 * InsForge integration boundary.
 *
 * Keep this adapter deliberately small until the installed InsForge release and
 * its official SDK/API version are pinned. Never guess endpoint paths or put
 * admin/database credentials into browser code.
 *
 * The browser may receive only the public project configuration and the
 * authenticated user's short-lived session token. Privileged operations must
 * remain behind authenticated Node API handlers.
 */
export function getInsForgePublicConfig(config) {
  if (!config.insforgeBaseUrl || !config.insforgeProjectId || !config.insforgeAnonKey) {
    return null;
  }

  return Object.freeze({
    baseUrl: config.insforgeBaseUrl,
    projectId: config.insforgeProjectId,
    anonKey: config.insforgeAnonKey,
  });
}

export function assertInsForgeServerCredentials(config) {
  if (!config.insforgeAdminKey && !config.insforgeDatabaseUrl) {
    throw new Error("InsForge server credentials are not configured");
  }
  return true;
}
