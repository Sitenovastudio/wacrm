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
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    cronSecret: process.env.CRON_SECRET || "",
  };

  if (production) {
    required("APP_BASE_URL");
    required("SUPABASE_URL");
    required("SUPABASE_ANON_KEY");
    required("SUPABASE_SERVICE_ROLE_KEY");
    if (!config.appBaseUrl.startsWith("https://")) {
      throw new Error("APP_BASE_URL must use HTTPS in production");
    }
    if (!config.supabaseUrl.startsWith("https://")) {
      throw new Error("SUPABASE_URL must use HTTPS in production");
    }
  }

  return Object.freeze(config);
}
