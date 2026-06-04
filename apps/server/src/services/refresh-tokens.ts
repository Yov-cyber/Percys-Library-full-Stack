import { prisma } from "../db";
import { generateRefreshTokenRaw, hashRefreshToken } from "../lib/jwt";
import { validateOwnerId } from "../lib/owner";

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function issueRefreshToken(ownerId: string): Promise<{ raw: string; expiresAt: Date }> {
  if (!validateOwnerId(ownerId)) throw new Error("Invalid owner id");
  const raw = generateRefreshTokenRaw();
  const tokenHash = hashRefreshToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await prisma.refreshToken.create({
    data: { ownerId, tokenHash, expiresAt },
  });
  return { raw, expiresAt };
}

export async function rotateRefreshToken(raw: string): Promise<{ ownerId: string; raw: string; expiresAt: Date } | null> {
  const tokenHash = hashRefreshToken(raw);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) return null;
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
  const next = await issueRefreshToken(row.ownerId);
  return { ownerId: row.ownerId, raw: next.raw, expiresAt: next.expiresAt };
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  const tokenHash = hashRefreshToken(raw);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllForOwner(ownerId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { ownerId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
