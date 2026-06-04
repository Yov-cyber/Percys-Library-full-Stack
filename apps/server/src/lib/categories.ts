/**
 * Comic categories are stored as a JSON string in SQLite (`["Marvel","Manga"]`).
 * Route handlers work with `string[]`; these helpers keep read/write consistent.
 */

export function parseCategories(raw: string | null | undefined): string[] {
  if (!raw || raw === "[]") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const v = item.trim();
      if (!v || seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  } catch {
    return [];
  }
}

export function serializeCategories(tags: Iterable<string>): string {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const raw of tags) {
    const v = raw.trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    next.push(v);
  }
  return JSON.stringify(next);
}

/** Safe `contains` needle for a tag inside the JSON array column. */
export function categoryJsonContainsNeedle(tag: string): string {
  const escaped = tag.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function mergeCategoryTag(stored: string | null | undefined, tag: string): string {
  const value = tag.trim();
  if (!value) return serializeCategories(parseCategories(stored));
  const current = parseCategories(stored);
  if (current.includes(value)) return serializeCategories(current);
  return serializeCategories([...current, value]);
}

export function removeCategoryTag(stored: string | null | undefined, tag: string): string {
  const value = tag.trim();
  if (!value) return serializeCategories(parseCategories(stored));
  return serializeCategories(parseCategories(stored).filter((t) => t !== value));
}
