import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { createSupabaseClients } from "./supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const { publicClient, adminClient } = createSupabaseClients(config);
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
    databaseConfigured: Boolean(publicClient && adminClient),
    migration: "scaffold",
  });
});

// Feature routes must be ported with per-request authentication, account scoping,
// validation, rate limiting and audit logging before they are mounted here.
// Keep webhook routes separate so Meta signature checks can use the raw body.
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
