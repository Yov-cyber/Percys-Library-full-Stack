import type { Request, Response, NextFunction } from "express";

const SUSPICIOUS_PATH = /(\.\.|%2e%2e|<script|javascript:|data:text\/html)/i;
const MAX_QUERY_LEN = 2048;

/** Lightweight hardening applied before route handlers. */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const raw = req.originalUrl ?? req.url ?? "";
  if (raw.length > MAX_QUERY_LEN) {
    return res.status(414).json({ error: "URI demasiado larga" });
  }
  if (SUSPICIOUS_PATH.test(raw)) {
    return res.status(400).json({ error: "Solicitud no válida" });
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

const CUID_LIKE = /^c[a-z0-9]{20,30}$/i;

export function validateComicIdParam(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  if (id && !CUID_LIKE.test(id)) {
    return res.status(400).json({ error: "ID de cómic no válido" });
  }
  next();
}
