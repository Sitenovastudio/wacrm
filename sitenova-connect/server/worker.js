// Dedicated durable worker entry point.
// Queue implementation must be added before enabling broadcasts or automation execution.
// Never enable a schedule by relying on a browser tab or in-memory timer.
if (process.env.NODE_ENV === "production" && process.env.WORKER_ENABLED !== "true") {
  throw new Error("Set WORKER_ENABLED=true only after the durable queue adapter is configured");
}

console.log("SiteNova Connect worker scaffold: no jobs are registered yet.");
