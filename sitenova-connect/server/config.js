const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export function loadConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const production = nodeEnv === "production";
  const config = {
    nodeEnv, production,
    port: Number(process.env.PORT || 3000),
    appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
    insforgeBaseUrl: process.env.INSFORGE_BASE_URL || "http://localhost:7130",
    insforgeAnonKey: process.env.INSFORGE_ANON_KEY || "",
    insforgeApiKey: process.env.INSFORGE_API_KEY || "",
    cronSecret: process.env.CRON_SECRET || ""
  };
  if (production) {
    required("APP_BASE_URL"); required("INSFORGE_BASE_URL");
    if (!config.appBaseUrl.startsWith("https://") || !config.insforgeBaseUrl.startsWith("https://")) {
      throw new Error("APP_BASE_URL and INSFORGE_BASE_URL must use HTTPS in production");
    }
    if (!config.insforgeAnonKey || !config.insforgeApiKey) {
      throw new Error("Set InsForge ACCESS_ANON_KEY and server-only ACCESS_API_KEY");
    }
  }
  return Object.freeze(config);
}
