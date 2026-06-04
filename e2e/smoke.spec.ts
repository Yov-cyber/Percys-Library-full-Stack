import { test, expect } from "@playwright/test";

test.describe("Percy's Library smoke", () => {
  test("home loads with global header search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("searchbox", { name: /búsqueda global/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("settings theme section reachable", async ({ page }) => {
    await page.goto("/settings/appearance");
    await expect(page.getByText(/apariencia/i).first()).toBeVisible({ timeout: 30_000 });
  });

  test("auth login endpoint responds", async ({ request }) => {
    const health = await request.get("http://localhost:4000/api/health");
    expect(health.ok()).toBeTruthy();
    const login = await request.post("http://localhost:4000/api/auth/login", {
      data: { ownerId: "default" },
    });
    if (login.status() === 503) {
      test.skip(true, "AUTH_SECRET not configured on server");
    }
    expect(login.ok()).toBeTruthy();
    const body = await login.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
  });
});
