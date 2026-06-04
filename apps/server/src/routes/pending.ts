import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { asyncHandler } from "../lib/async-handler";
import { getOwnerId } from "../lib/owner";

export const pendingRouter = Router();

const pendingPrioritySchema = z.enum(["low", "medium", "high"]);

const pendingSnapshotSchema = z.object({
  items: z.array(
    z.object({
      comicId: z.string().min(1),
      priority: pendingPrioritySchema.default("medium"),
      snoozeUntil: z.string().datetime().nullable().optional(),
      updatedAt: z.string().datetime().optional(),
    }),
  ).max(2_000),
});

type PendingRow = {
  comicId: string;
  priority: string;
  snoozeUntil: Date | null;
  updatedAt: Date;
};

function priorityScore(priority: string) {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
}

pendingRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    const items = await prisma.pendingComic.findMany({
      where: { ownerId },
      select: {
        comicId: true,
        priority: true,
        snoozeUntil: true,
        updatedAt: true,
      },
    });
    const sorted = (items as PendingRow[]).sort((a, b) => {
      const rankDelta = priorityScore(b.priority) - priorityScore(a.priority);
      if (rankDelta !== 0) return rankDelta;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    res.json({
      items: sorted.map((item) => ({
        comicId: item.comicId,
        priority: item.priority,
        snoozeUntil: item.snoozeUntil ? item.snoozeUntil.toISOString() : null,
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  }),
);

pendingRouter.put(
  "/snapshot",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    const parsed = pendingSnapshotSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const comicIds = Array.from(new Set(parsed.data.items.map((item) => item.comicId)));
    const existing = await prisma.comic.findMany({
      where: { ownerId, id: { in: comicIds } },
      select: { id: true },
    });
    const validIds = new Set(existing.map((comic) => comic.id));
    const items = parsed.data.items.filter((item) => validIds.has(item.comicId));

    await prisma.$transaction(async (tx) => {
      await tx.pendingComic.deleteMany({
        where: { ownerId, comicId: { notIn: Array.from(validIds) } },
      });
      for (const item of items) {
        await tx.pendingComic.upsert({
          where: {
            ownerId_comicId: {
              ownerId,
              comicId: item.comicId,
            },
          },
          create: {
            ownerId,
            comicId: item.comicId,
            priority: item.priority,
            snoozeUntil: item.snoozeUntil ? new Date(item.snoozeUntil) : null,
          },
          update: {
            priority: item.priority,
            snoozeUntil: item.snoozeUntil ? new Date(item.snoozeUntil) : null,
          },
        });
      }
    });

    const rows = await prisma.pendingComic.findMany({
      where: { ownerId },
      select: {
        comicId: true,
        priority: true,
        snoozeUntil: true,
        updatedAt: true,
      },
    });
    const sorted = (rows as PendingRow[]).sort((a, b) => {
      const rankDelta = priorityScore(b.priority) - priorityScore(a.priority);
      if (rankDelta !== 0) return rankDelta;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    res.json({
      items: sorted.map((item) => ({
        comicId: item.comicId,
        priority: item.priority,
        snoozeUntil: item.snoozeUntil ? item.snoozeUntil.toISOString() : null,
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  }),
);
