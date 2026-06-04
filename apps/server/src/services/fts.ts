import { prisma, rawPrisma } from "../db";
import { config } from "../config";
import { logger } from "../lib/logger";

const log = logger.child("fts");

let ftsReady = false;

function isSqlite(): boolean {
  return String(config.databaseUrl).startsWith("file:");
}

export async function ensureFtsIndex(): Promise<void> {
  if (!isSqlite() || ftsReady) return;
  try {
    await rawPrisma.$executeRawUnsafe(`
      CREATE VIRTUAL TABLE IF NOT EXISTS comic_fts USING fts5(
        comic_id UNINDEXED,
        owner_id UNINDEXED,
        title,
        categories,
        bookmark_notes,
        tokenize='unicode61 remove_diacritics 2'
      );
    `);
    ftsReady = true;
    log.info("FTS5 index ready");
  } catch (err) {
    log.warn("FTS5 unavailable", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function reindexOwnerComics(ownerId: string): Promise<number> {
  if (!isSqlite() || !ftsReady) return 0;
  await rawPrisma.$executeRawUnsafe(`DELETE FROM comic_fts WHERE owner_id = ?`, ownerId);
  const comics = await prisma.comic.findMany({
    where: { ownerId },
    select: {
      id: true,
      title: true,
      categories: true,
      category: true,
      bookmarks: { select: { note: true } },
    },
  });
  for (const c of comics) {
    let tags: string[] = [];
    try {
      tags = JSON.parse(c.categories || "[]") as string[];
    } catch {
      tags = [];
    }
    if (c.category) tags.push(c.category);
    const notes = c.bookmarks.map((b) => b.note ?? "").filter(Boolean).join(" ");
    await rawPrisma.$executeRawUnsafe(
      `INSERT INTO comic_fts (comic_id, owner_id, title, categories, bookmark_notes)
       VALUES (?, ?, ?, ?, ?)`,
      c.id,
      ownerId,
      c.title,
      tags.join(" "),
      notes,
    );
  }
  return comics.length;
}

export async function upsertComicFts(
  ownerId: string,
  comicId: string,
  title: string,
  categoriesText: string,
  bookmarkNotes: string,
): Promise<void> {
  if (!isSqlite() || !ftsReady) return;
  await rawPrisma.$executeRawUnsafe(`DELETE FROM comic_fts WHERE comic_id = ?`, comicId);
  await rawPrisma.$executeRawUnsafe(
    `INSERT INTO comic_fts (comic_id, owner_id, title, categories, bookmark_notes)
     VALUES (?, ?, ?, ?, ?)`,
    comicId,
    ownerId,
    title,
    categoriesText,
    bookmarkNotes,
  );
}

export interface FtsHit {
  comic_id: string;
  rank: number;
}

export async function searchFts(ownerId: string, query: string, limit: number): Promise<FtsHit[]> {
  if (!isSqlite() || !ftsReady) return [];
  const term = query.trim().replace(/["']/g, "").split(/\s+/).filter(Boolean);
  if (term.length === 0) return [];
  const match = term.map((t) => `"${t}"*`).join(" ");
  try {
    const rows = await rawPrisma.$queryRawUnsafe<FtsHit[]>(
      `SELECT comic_id, rank
       FROM comic_fts
       WHERE owner_id = ? AND comic_fts MATCH ?
       ORDER BY rank
       LIMIT ?`,
      ownerId,
      match,
      limit,
    );
    return rows;
  } catch {
    return [];
  }
}
