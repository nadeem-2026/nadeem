import { test, expect } from "@playwright/test";

test("anonymous guide search exposes localized filters", async ({ page }) => {
  await page.goto("/en/guides", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find a Tour Guide");
  await expect(page.getByLabel("City", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Tour Language", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeVisible();
});

test("unauthenticated admin access requires sign-in", async ({ page }) => {
  await page.goto("/en/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/en\/login/);
});

test("disabled payment endpoints cannot acknowledge payment or display success", async ({ page, request }) => {
  const response = await request.post("/api/webhooks/tap", { data: { id: "synthetic", status: "CAPTURED" } });
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ error: "payments_not_enabled" });
  await page.goto("/en/payment/callback?tap_id=synthetic", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Payment could not be verified");
});

test("academic project notice is visible in both languages", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("مشروع جامعي — الحجوزات الجديدة تجريبية ولا تتم أي معاملات مالية حقيقية.", { exact: true })).toBeVisible();
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("College project — new bookings are simulations. No real financial transactions take place.", { exact: true })).toBeVisible();
});
