// Dedicated worker entry point. InsForge is the target backend, but durable
// queue semantics must be implemented and tested before enabling scheduled jobs.
if (process.env.NODE_ENV === "production" && process.env.WORKER_ENABLED !== "true") {
  throw new Error("Set WORKER_ENABLED=true only after the durable InsForge-backed queue is configured");
}

console.log("SiteNova Connect worker scaffold: no jobs are registered yet.");
