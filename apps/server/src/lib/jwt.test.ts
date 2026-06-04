import { test } from "node:test";
import assert from "node:assert/strict";
import { signAccessToken, verifyAccessToken } from "./jwt";

test("signAccessToken and verifyAccessToken round-trip", () => {
  const token = signAccessToken("default", 60);
  assert.ok(token.includes("."));
  const payload = verifyAccessToken(token);
  assert.equal(payload?.sub, "default");
  assert.equal(payload?.typ, "access");
});

test("verifyAccessToken rejects tampered token", () => {
  const token = signAccessToken("default", 60);
  const bad = `${token.slice(0, -1)}x`;
  assert.equal(verifyAccessToken(bad), null);
});
