import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "sitenova-connect-api", migration: "scaffold" });
});

// TODO(migration): port and test every source route handler before exposing
// feature endpoints. Keep webhook raw-body/signature verification route-specific.
app.use(express.static(path.resolve(__dirname, "../public"), { extensions: ["html"] }));
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../public/index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`SiteNova Connect scaffold listening on port ${port}`);
});
