import { ensureSettings, prisma } from "../db";
import { scanLibrary, cleanupUploadOrphans } from "../services/scanner";
import { ensureFtsIndex, reindexOwnerComics } from "../services/fts";
import { logger } from "../lib/logger";

const log = logger.child("bootstrap");

export async function runBootstrap(): Promise<void> {
  await ensureSettings();
  await ensureFtsIndex();
}

async function warmCache(): Promise<void> {
  try {
    const recent = await prisma.comic.findMany({
      where: { lastReadAt: { not: null } },
      orderBy: { lastReadAt: "desc" },
      take: 10,
      select: { id: true, pageCount: true },
    });
    const { getPage } = await import("../services/pages");
    let warmed = 0;
    for (const comic of recent) {
      if (comic.pageCount > 0) {
        try {
          await getPage(comic.id, 0, { quality: "balanced" });
          warmed++;
        } catch {
          /* ignore per-comic errors */
        }
      }
    }
    if (warmed > 0) {
      log.info(`warmed cache for ${warmed} recent comic(s)`);
    }
  } catch (err) {
    log.warn("cache warming failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Library scan, FTS reindex, orphan cleanup, and cache warm — non-blocking. */
export function runBackgroundJobs(): void {
  scanLibrary()
    .then(async (result) => {
      log.info("initial scan complete", result);
      try {
        const n = await reindexOwnerComics("default");
        if (n > 0) log.info(`FTS reindexed ${n} comic(s)`);
      } catch (err) {
        log.warn("FTS reindex failed", {
          message: err instanceof Error ? err.message : String(err),
        });
      }
      try {
        const removed = await cleanupUploadOrphans();
        if (removed > 0) {
          log.info(`cleaned up ${removed} orphaned upload(s)`);
        }
      } catch (err) {
        log.warn("upload orphan cleanup failed", {
          message: err instanceof Error ? err.message : String(err),
        });
      }
      await warmCache();
    })
    .catch((err) =>
      log.error("initial scan failed", {
        message: err instanceof Error ? err.message : String(err),
      }),
    );
}
