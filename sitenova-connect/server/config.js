const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const production = nodeEnv === "production";

  const config = {
    nodeEnv,
    production,
    port: Number(process.env.PORT || 3000),
    appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
    insforgeBaseUrl: process.env.INSFORGE_BASE_URL || "http://localhost:7130",
    insforgeProjectId: process.env.INSFORGE_PROJECT_ID || "",
    insforgeAnonKey: process.env.INSFORGE_ANON_KEY || "",
    insforgeApiKey: process.env.INSFORGE_API_KEY || "",
    insforgeAdminKey: process.env.INSFORGE_ADMIN_KEY || "",
    insforgeDatabaseUrl: process.env.INSFORGE_DATABASE_URL || "",
    cronSecret: process.env.CRON_SECRET || "",
  };

  if (production) {
    required("APP_BASE_URL");
    required("INSFORGE_BASE_URL");
    if (!config.appBaseUrl.startsWith("https://") || !config.insforgeBaseUrl.startsWith("https://")) {
      throw new Error("APP_BASE_URL and INSFORGE_BASE_URL must use HTTPS in production");
    }
    if (!config.insforgeProjectId || !config.insforgeAnonKey) {
      throw new Error("Set the InsForge project ID and public project key for production");
    }
    if (!config.insforgeAdminKey && !config.insforgeDatabaseUrl) {
      throw new Error("Configure a server-only InsForge admin integration or private database connection");
    }
  }

  return Object.freeze(config);
}
