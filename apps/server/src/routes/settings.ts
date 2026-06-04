import { Router } from "express";
import fs from "node:fs/promises";
import { z } from "zod";
import { ensureSettings, prisma } from "../db";
import { asyncHandler } from "../lib/async-handler";
import { getOwnerId } from "../lib/owner";

export const settingsRouter = Router();

settingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    await ensureSettings(ownerId);
    const settings = await prisma.settings.findUnique({ where: { ownerId } });
    res.json(settings);
  }),
);

// Avatars are either a built-in preset reference or a small data URL.
// Cap the data URL at ~256KB encoded to keep a single Settings row sane.
const AVATAR_MAX_LEN = 350_000;
const avatarSchema = z
  .string()
  .max(AVATAR_MAX_LEN)
  .regex(/^(preset:[a-z0-9-]{1,32}|data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+)$/);

// Library logo follows the same shape as the avatar: either a bundled
// preset reference or an inlined image up to ~256KB. The branding stays
// in the Settings row so it works the same way across devices for a
// single owner.
const LIBRARY_LOGO_MAX_LEN = 350_000;
const libraryLogoSchema = z
  .string()
  .max(LIBRARY_LOGO_MAX_LEN)
  .regex(/^(preset:[a-z0-9-]{1,32}|data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+)$/);

const BACKGROUND_IMAGE_MAX_LEN = 700_000;
const backgroundImageSchema = z
  .string()
  .max(BACKGROUND_IMAGE_MAX_LEN)
  .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/);

const DEFAULT_SETTINGS_PATCH = {
  theme: "dark",
  accentColor: "#7c5cff",
  coverSize: "md",
  readingMode: "paged-h",
  fitMode: "fit-width",
  direction: "ltr",
  showThumbStrip: true,
  autoCropMargins: false,
  uiHideDelayMs: 2500,
  autoAdvanceToNext: false,
  autoScrollSpeed: 80,
  showTopProgress: true,
  libraryView: "grid",
  librarySort: "lastReadAt",
  reduceMotion: false,
  dailyGoalPages: 0,
  customThemes: "[]",
  keyboardShortcuts: "{}",
  autoApplySettings: true,
  animationsEnabled: true,
  animPageTransitions: true,
  animHoverParallax: true,
  animHudFades: true,
  animMicroInteractions: true,
  animBrandShimmer: false,
  animIntensity: 100,
  readerPageGap: 8,
  readerMaxWidth: 900,
  readerSidePadding: 0,
  readerPagePreload: 3,
  imageQuality: "balanced",
  customCss: "",
  backgroundImage: null,
  backgroundDim: 60,
  fontScale: 100,
  statsRange: "30d",
  readerBrightness: 100,
  readerContrast: 100,
  libraryName: "",
  libraryLogo: null,
} as const;

const settingsSchema = z.object({
  // userName may be empty while the user is still onboarding; the UI
  // falls back to a "Lector" placeholder until they fill it in.
  userName: z.string().max(40).optional(),
  userLastName: z.string().max(40).nullable().optional(),
  theme: z.string().max(64).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  avatar: avatarSchema.nullable().optional(),
  coverSize: z.enum(["sm", "md", "lg"]).optional(),
  readingMode: z.enum(["scroll-v", "paged-h", "paged-v", "webtoon", "paged-h-2"]).optional(),
  fitMode: z.enum(["fit-width", "fit-height", "original"]).optional(),
  direction: z.enum(["ltr", "rtl"]).optional(),
  showThumbStrip: z.boolean().optional(),
  autoCropMargins: z.boolean().optional(),
  uiHideDelayMs: z.number().int().min(1000).max(60_000).optional(),
  autoAdvanceToNext: z.boolean().optional(),
  autoScrollSpeed: z.number().int().min(10).max(400).optional(),
  showTopProgress: z.boolean().optional(),
  libraryView: z.enum(["grid", "list", "shelf"]).optional(),
  librarySort: z.enum(["title", "lastReadAt", "progress", "addedAt"]).optional(),
  reduceMotion: z.boolean().optional(),
  libraryPath: z.string().optional(),
  dailyGoalPages: z.number().int().min(0).max(2_000).optional(),
  customThemes: z.string().optional(),
  keyboardShortcuts: z.string().optional(),
  hasOnboarded: z.boolean().optional(),
  autoApplySettings: z.boolean().optional(),
  animationsEnabled: z.boolean().optional(),
  animPageTransitions: z.boolean().optional(),
  animHoverParallax: z.boolean().optional(),
  animHudFades: z.boolean().optional(),
  animMicroInteractions: z.boolean().optional(),
  animBrandShimmer: z.boolean().optional(),
  animIntensity: z.number().int().min(0).max(100).optional(),
  readerPageGap: z.number().int().min(0).max(80).optional(),
  readerMaxWidth: z.number().int().min(0).max(2400).optional(),
  readerSidePadding: z.number().int().min(0).max(120).optional(),
  readerPagePreload: z.number().int().min(0).max(20).optional(),
  imageQuality: z.enum(["high", "balanced", "fast"]).optional(),
  customCss: z.string().optional(),
  backgroundImage: backgroundImageSchema.nullable().optional(),
  backgroundDim: z.number().int().min(0).max(100).optional(),
  fontScale: z.number().int().min(80).max(130).optional(),
  statsRange: z.enum(["7d", "30d", "90d", "1y", "all"]).optional(),
  readerBrightness: z.number().int().min(20).max(200).optional(),
  readerContrast: z.number().int().min(20).max(200).optional(),
  // Branding (logo + library name). An empty string for the name means
  // "use the default" so the client can fall back cleanly.
  libraryName: z.string().max(40).optional(),
  libraryLogo: libraryLogoSchema.nullable().optional(),
});

settingsRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    await ensureSettings(ownerId);
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const updated = await prisma.settings.update({ where: { ownerId }, data: parsed.data });
    res.json(updated);
  }),
);

settingsRouter.post(
  "/reset-profile",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    await ensureSettings(ownerId);

    // Delete comic files from disk BEFORE removing DB rows so we don't
    // orphan files that would be re-imported on the next scan.
    const existing = await prisma.comic.findMany({
      where: { ownerId },
      select: { id: true, path: true, format: true },
    });
    for (const c of existing) {
      try {
        if (c.format === "folder") {
          await fs.rm(c.path, { recursive: true, force: true });
        } else {
          await fs.unlink(c.path);
        }
      } catch {
        // The file might already be gone; that's fine.
      }
    }

    await prisma.$transaction([
      prisma.bookmark.deleteMany({ where: { ownerId } }),
      prisma.comic.deleteMany({ where: { ownerId } }),
      prisma.readingDay.deleteMany({ where: { ownerId } }),
      prisma.achievement.deleteMany({ where: { ownerId } }),
      prisma.settings.update({
        where: { ownerId },
        data: {
          ...DEFAULT_SETTINGS_PATCH,
          userName: "",
          userLastName: null,
          avatar: null,
          dailyGoalPages: 0,
          hasOnboarded: false,
          autoApplySettings: true,
          animationsEnabled: true,
          customThemes: "[]",
          keyboardShortcuts: "{}",
          customCss: "",
          backgroundImage: null,
          // Reset visual companions too so a fresh profile starts with
          // defaults end-to-end (no stale dim/font scale/anim intensity
          // bleeding into a brand-new onboarding flow).
          backgroundDim: 60,
          fontScale: 100,
          animIntensity: 100,
          animPageTransitions: true,
          animHoverParallax: true,
          animHudFades: true,
          animMicroInteractions: true,
          animBrandShimmer: false,
          statsRange: "30d",
          libraryName: "",
          libraryLogo: null,
        },
      }),
    ]);
    const settings = await prisma.settings.findUnique({ where: { ownerId } });
    if (!settings) {
      return res.status(500).json({ error: "settings_missing_after_reset" });
    }
    res.json({ ok: true, settings });
  }),
);

settingsRouter.post(
  "/reset-defaults",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    await ensureSettings(ownerId);
    const updated = await prisma.settings.update({
      where: { ownerId },
      data: DEFAULT_SETTINGS_PATCH,
    });
    res.json(updated);
  }),
);
