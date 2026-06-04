import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categoryJsonContainsNeedle,
  mergeCategoryTag,
  parseCategories,
  removeCategoryTag,
  serializeCategories,
} from "./categories";

test("parseCategories reads JSON array", () => {
  assert.deepEqual(parseCategories('["Marvel","Manga"]'), ["Marvel", "Manga"]);
  assert.deepEqual(parseCategories("[]"), []);
  assert.deepEqual(parseCategories(null), []);
});

test("serializeCategories dedupes and trims", () => {
  assert.equal(serializeCategories([" Marvel ", "Marvel", "DC"]), '["Marvel","DC"]');
});

test("merge and remove category tags", () => {
  const base = '["Marvel"]';
  assert.equal(mergeCategoryTag(base, "DC"), '["Marvel","DC"]');
  assert.equal(removeCategoryTag('["Marvel","DC"]', "Marvel"), '["DC"]');
});

test("categoryJsonContainsNeedle escapes quotes", () => {
  assert.equal(categoryJsonContainsNeedle('Say "Hi"'), '"Say \\"Hi\\""');
});
