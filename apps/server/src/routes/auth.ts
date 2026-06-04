import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { config } from "../config";
import { asyncHandler } from "../lib/async-handler";
import { signAccessToken } from "../lib/jwt";
import { signOwnerToken, validateOwnerId } from "../lib/owner";
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from "../services/refresh-tokens";
import { AppError } from "../core/app-error";

export const authRouter = Router();

const ACCESS_EXPIRES_SEC = 900;

const loginSchema = z.object({
  ownerId: z.string().max(64).optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(16).max(256),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!config.authSecret) {
      return res.status(503).json({ error: "AUTH_SECRET no configurado en el servidor" });
    }
    const { ownerId } = loginSchema.parse(req.body ?? {});
    const id = (ownerId?.trim() || "default");
    if (!validateOwnerId(id)) {
      return res.status(400).json({ error: "Invalid owner id" });
    }
    const accessToken = signAccessToken(id, ACCESS_EXPIRES_SEC);
    let refresh: { raw: string; expiresAt: Date };
    try {
      refresh = await issueRefreshToken(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2021" || err.code === "P2022")) {
        throw new AppError(
          "Base de datos desactualizada. En apps/server ejecuta: npx prisma db push",
          503,
        );
      }
      throw err;
    }
    res.json({
      ownerId: id,
      accessToken,
      refreshToken: refresh.raw,
      expiresIn: ACCESS_EXPIRES_SEC,
      tokenType: "Bearer",
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    if (!config.authSecret) {
      return res.status(503).json({ error: "AUTH_SECRET no configurado" });
    }
    const { refreshToken } = refreshSchema.parse(req.body ?? {});
    const rotated = await rotateRefreshToken(refreshToken);
    if (!rotated) {
      return res.status(401).json({ error: "Refresh token inválido o expirado" });
    }
    const accessToken = signAccessToken(rotated.ownerId, ACCESS_EXPIRES_SEC);
    res.json({
      ownerId: rotated.ownerId,
      accessToken,
      refreshToken: rotated.raw,
      expiresIn: ACCESS_EXPIRES_SEC,
      tokenType: "Bearer",
    });
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const raw = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
    if (raw) await revokeRefreshToken(raw);
    res.json({ ok: true });
  }),
);

/** Legacy HMAC token — still supported for dev migration. */
authRouter.post(
  "/owner-token",
  asyncHandler(async (req, res) => {
    const ownerId = typeof req.body?.ownerId === "string" ? req.body.ownerId.trim() : "default";
    if (!validateOwnerId(ownerId)) {
      return res.status(400).json({ error: "Invalid owner id" });
    }
    if (!config.authSecret && config.isProduction) {
      return res.status(503).json({ error: "Use POST /api/auth/login" });
    }
    const token = signOwnerToken(ownerId);
    res.json({ ownerId, token, tokenType: "Owner-HMAC" });
  }),
);
