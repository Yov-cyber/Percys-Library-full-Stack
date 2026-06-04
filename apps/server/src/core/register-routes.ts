import type { Express } from "express";
import rateLimit from "express-rate-limit";
import { config } from "../config";
import { libraryRouter } from "../routes/library";
import { comicsRouter } from "../routes/comics";
import { pendingRouter } from "../routes/pending";
import { settingsRouter } from "../routes/settings";
import { statsRouter } from "../routes/stats";
import { bookmarksRouter } from "../routes/bookmarks";
import { healthRouter } from "../routes/health";
import { searchRouter } from "../routes/search";
import { authRouter } from "../routes/auth";

export function registerRoutes(app: Express): void {
  const writeLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => req.method === "GET" || req.method === "HEAD",
  });
  const uploadLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.uploadMax,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/library/upload", uploadLimiter);
  app.use("/api", writeLimiter);

  app.use("/api/library", libraryRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/comics", comicsRouter);
  app.use("/api/pending", pendingRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api", statsRouter);
  app.use("/api", bookmarksRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}
