import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { asyncHandler } from "../lib/async-handler";
import { getOwnerId } from "../lib/owner";
import { searchFts } from "../services/fts";

export const searchRouter = Router();

const querySchema = z.object({
  q: z.string().max(200).default(""),
  limit: z.coerce.number().int().min(1).max(100).default(40),
});

function parseCategories(raw: string): string[] {
  try {
    return JSON.parse(raw || "[]") as string[];
  } catch {
    return [];
  }
}

function toSummary(c: {
  id: string;
  title: string;
  format: string;
  pageCount: number;
  currentPage: number;
  completed: boolean;
  isFavorite: boolean;
  category: string | null;
  categories: string;
  addedAt: Date;
  updatedAt: Date;
  lastReadAt: Date | null;
  sizeBytes: bigint;
  lastZoom: number | null;
}) {
  return {
    id: c.id,
    title: c.title,
    format: c.format,
    pageCount: c.pageCount,
    currentPage: c.currentPage,
    completed: c.completed,
    isFavorite: c.isFavorite,
    category: c.category,
    categories: parseCategories(c.categories),
    addedAt: c.addedAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastReadAt: c.lastReadAt?.toISOString() ?? null,
    sizeBytes: Number(c.sizeBytes),
    lastZoom: c.lastZoom,
  };
}

/**
 * Búsqueda full-text (FTS5 en SQLite) con fallback en memoria.
 */
searchRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const ownerId = getOwnerId(req);
    const { q, limit } = querySchema.parse(req.query);
    const term = q.trim();
    if (!term) {
      return res.json({ results: [], tookMs: 0, engine: "none" });
    }

    const started = Date.now();
    const ftsHits = await searchFts(ownerId, term, limit);
    if (ftsHits.length > 0) {
      const ids = ftsHits.map((h) => h.comic_id);
      const comics = await prisma.comic.findMany({
        where: { ownerId, id: { in: ids } },
      });
      const order = new Map(ids.map((id, i) => [id, i]));
      comics.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      return res.json({
        results: comics.map(toSummary),
        tookMs: Date.now() - started,
        engine: "fts5",
      });
    }

    const lowered = term.toLowerCase();
    const comics = await prisma.comic.findMany({
      where: { ownerId },
      take: 500,
    });
    const results = comics
      .filter((c) => {
        const tags = parseCategories(c.categories);
        const hay = [c.title, c.category ?? "", ...tags].join(" ").toLowerCase();
        return hay.includes(lowered);
      })
      .slice(0, limit)
      .map(toSummary);

    res.json({ results, tookMs: Date.now() - started, engine: "fallback" });
  }),
);
