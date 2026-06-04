import http from "node:http";
import { config } from "./config";
import { disconnectDatabase, startDatabaseWatchdog } from "./db";
import { createApp } from "./app/create-app";
import { runBootstrap, runBackgroundJobs } from "./app/bootstrap";
import { logger } from "./lib/logger";

const log = logger.child("server");

async function main() {
  await runBootstrap();

  const app = createApp();
  runBackgroundJobs();

  process.on("uncaughtException", (err) => {
    log.error("uncaught exception", { message: err.message, stack: err.stack });
    if (config.isProduction) process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    log.error("unhandled rejection", {
      message: reason instanceof Error ? reason.message : String(reason),
    });
  });

  const server = http.createServer(app);
  server.listen(config.port, () => {
    log.info(`server listening on http://localhost:${config.port}`);
    log.info(`library: ${config.libraryPath}`);
    log.info(`cache: ${config.cacheDir}`);
  });

  const stopWatchdog = startDatabaseWatchdog();

  let shuttingDown = false;
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info(`received ${signal}, shutting down`);
    stopWatchdog();
    server.close((err) => {
      if (err) log.error("error closing http server", { message: err.message });
    });
    try {
      await disconnectDatabase();
    } catch (err) {
      log.warn("error disconnecting prisma", {
        message: err instanceof Error ? err.message : String(err),
      });
    }
    setTimeout(() => process.exit(0), 1500).unref();
  }
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  log.error("fatal startup error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
