import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { getInsForgePublicConfig } from "./insforge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const insforgePublic = getInsForgePublicConfig(config);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", config.production ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: config.production ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan(config.production ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "sitenova-connect-api",
    mode: config.nodeEnv,
    insforgeConfigured: Boolean(insforgePublic),
    migration: "scaffold",
  });
});

// Public configuration is limited to non-secret project connection details.
// Never return INSFORGE_ADMIN_KEY, INSFORGE_DATABASE_URL or platform root secrets.
app.get("/api/config", (_req, res) => {
  if (!insforgePublic) return res.status(503).json({ error: "InsForge is not configured" });
  res.set("Cache-Control", "no-store");
  res.json({ insforge: insforgePublic });
});

// Feature routes must be ported with verified sessions, account scoping,
// validation, rate limits and audit logging before being mounted here.
// Webhook routes need raw-body signature verification and idempotent ingestion.
app.use(express.static(path.resolve(__dirname, "../public"), {
  extensions: ["html"],
  maxAge: config.production ? "1h" : 0,
  index: false,
}));

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/index.html"));
});

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`SiteNova Connect API listening on port ${config.port}`);
  });
}

export { app, config };
