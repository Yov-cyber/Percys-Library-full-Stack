import express, { type ErrorRequestHandler, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { config } from "../config";
import { logger } from "../lib/logger";
import { securityMiddleware } from "../middleware/security";
import { registerRoutes } from "../core/register-routes";
import { resolveClientStatusCode } from "../core/app-error";

const REQUEST_TIMEOUT_MS = 60_000;
const log = logger.child("server");

const TRANSIENT_DB_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1017",
  "P2024",
]);

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "blob:"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "script-src": ["'self'"],
          "connect-src": ["'self'", "http://localhost:*", "ws://localhost:*"],
          "object-src": ["'none'"],
          "frame-ancestors": ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
      hsts: config.isProduction
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      frameguard: { action: "deny" },
      hidePoweredBy: true,
    }),
  );

  if (config.corsOrigins === "*") {
    app.use(cors());
  } else {
    const allowed = new Set(config.corsOrigins);
    app.use(
      cors({
        origin(origin, cb) {
          if (!origin || allowed.has(origin)) return cb(null, true);
          cb(new Error(`Origin not allowed: ${origin}`));
        },
        credentials: true,
      }),
    );
  }

  app.use(securityMiddleware);

  app.use(
    compression({
      level: 9,
      threshold: 512,
      filter: (req, res) => {
        if (req.path.includes("/pages/") || req.path.includes("/thumbs/")) return false;
        return compression.filter(req, res);
      },
    }),
  );
  app.use(express.json({ limit: config.jsonBodyLimit }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const elapsedMs = Number((process.hrtime.bigint() - start) / 1_000_000n);
      const meta = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        elapsedMs,
      };
      if (res.statusCode >= 500) log.error("request", meta);
      else if (res.statusCode >= 400) log.warn("request", meta);
      else log.debug("request", meta);
    });
    next();
  });

  app.use((req, res, next) => {
    res.setTimeout(REQUEST_TIMEOUT_MS, () => {
      res.status(503).json({ error: "Request timeout" });
    });
    next();
  });

  registerRoutes(app);

  const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    const errorId = crypto.randomUUID().slice(0, 8);
    const statusCode = resolveClientStatusCode(err);
    if (statusCode !== undefined) {
      log.warn("request rejected", {
        errorId,
        method: req.method,
        path: req.originalUrl,
        message: err instanceof Error ? err.message : String(err),
      });
      if (!res.headersSent) {
        res.status(statusCode).json({
          error: err instanceof Error ? err.message : "Request rejected",
          errorId,
        });
      }
      return;
    }
    const isTransientDb =
      (err instanceof Prisma.PrismaClientKnownRequestError &&
        TRANSIENT_DB_CODES.has(err.code)) ||
      err instanceof Prisma.PrismaClientInitializationError;
    if (isTransientDb) {
      log.warn("transient db error during request", {
        errorId,
        method: req.method,
        path: req.originalUrl,
        message: err instanceof Error ? err.message : String(err),
      });
      if (!res.headersSent) {
        res
          .status(503)
          .setHeader("Retry-After", "2")
          .json({
            error: "La base de datos no respondió a tiempo. Reintenta en unos segundos.",
            transient: true,
            errorId,
          });
      }
      return;
    }
    log.error("route error", {
      errorId,
      method: req.method,
      path: req.originalUrl,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    if (res.headersSent) return;
    res.status(500).json({ error: "Internal server error", errorId });
  };
  app.use(errorHandler);

  return app;
}
