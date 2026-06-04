import crypto from "node:crypto";
import { config } from "../config";

export interface AccessTokenPayload {
  sub: string;
  typ: "access";
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function parseBase64urlJson<T>(segment: string): T | null {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function signAccessToken(ownerId: string, expiresInSec = 900): string {
  const secret = config.authSecret;
  if (!secret) {
    if (config.isProduction) throw new Error("AUTH_SECRET is required in production");
    return "";
  }
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload & { iat: number; exp: number } = {
    sub: ownerId,
    typ: "access",
    iat: now,
    exp: now + expiresInSec,
  };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const secret = config.authSecret;
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expected = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const payload = parseBase64urlJson<AccessTokenPayload & { exp?: number; iat?: number }>(p);
  if (!payload || payload.typ !== "access" || typeof payload.sub !== "string") return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return null;
  return { sub: payload.sub, typ: "access" };
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateRefreshTokenRaw(): string {
  return crypto.randomBytes(32).toString("base64url");
}
