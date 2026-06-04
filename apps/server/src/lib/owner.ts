import type { Request } from "express";
import crypto from "node:crypto";
import { config } from "../config";
import { verifyAccessToken } from "./jwt";

const VALID_OWNER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

function bearerToken(req: Request): string | null {
  const header = req.header("authorization")?.trim();
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function getOwnerId(req: Request): string {
  const access = bearerToken(req);
  if (access && config.authSecret) {
    const payload = verifyAccessToken(access);
    if (payload && validateOwnerId(payload.sub)) return payload.sub;
    throw Object.assign(new Error("Invalid or expired access token"), { statusCode: 401 });
  }

  const raw = req.header("x-owner-id")?.trim();
  const ownerId = raw && VALID_OWNER_ID_PATTERN.test(raw) ? raw : "default";
  if (!config.authSecret) {
    if (config.isProduction) {
      throw new Error("AUTH_SECRET is required in production");
    }
    return ownerId;
  }
  const token = req.header("x-owner-token")?.trim() ?? "";
  if (!verifyOwnerToken(ownerId, token, config.authSecret)) {
    throw Object.assign(new Error("Invalid owner token"), { statusCode: 401 });
  }
  return ownerId;
}

export function signOwnerToken(ownerId: string, secret = config.authSecret): string {
  if (!secret) {
    if (config.isProduction) throw new Error("AUTH_SECRET is required in production");
    return "";
  }
  if (!validateOwnerId(ownerId)) {
    throw new Error("Invalid owner id");
  }
  const issuedAt = Date.now().toString(36);
  const payload = `${ownerId}.${issuedAt}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOwnerToken(ownerId: string, token: string, secret = config.authSecret): boolean {
  if (!secret) return !config.isProduction;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenOwner, issuedAt, sig] = parts;
  if (tokenOwner !== ownerId || !validateOwnerId(tokenOwner)) return false;
  const issuedMs = Number.parseInt(issuedAt, 36);
  if (!Number.isFinite(issuedMs) || Date.now() - issuedMs > TOKEN_MAX_AGE_MS) return false;
  const payload = `${tokenOwner}.${issuedAt}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function validateOwnerId(id: string): boolean {
  return VALID_OWNER_ID_PATTERN.test(id);
}
