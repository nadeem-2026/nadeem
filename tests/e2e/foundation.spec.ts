import { expect, test } from "@playwright/test";

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: localized, responsive foundation with no external requests`, async ({ page }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => { if (!request.url().startsWith("http://127.0.0.1:3000")) external.push(request.url()); });
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(locale === "ar" ? "المرشدين السياحيين" : "local tour guides");
    await expect(page.getByText(locale === "ar" ? "الحجز والدفع غير متاحين بعد" : "Bookings and payments are not available yet", { exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("header img")).toBeVisible();
    expect(await page.locator("header img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const logoTransform = await page.locator("header img").evaluate((img) => getComputedStyle(img).transform);
    expect(logoTransform).toBe("none");
    const nav = page.getByRole("navigation");
    await nav.getByRole("link", { name: locale === "ar" ? "كيف تعمل المنصة" : "How it works" }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}#how-it-works$`));
    await expect(page.locator("#how-title")).toBeInViewport();
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("default route and language switch update document direction and metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page).toHaveTitle(/نديم/);
  await page.getByRole("link", { name: "View in English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page).toHaveTitle(/Nadeem/);
  await page.getByRole("link", { name: "عرض باللغة العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("keyboard skip link reaches main content", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("unknown locales and paths return localized not-found views", async ({ page }) => {
  for (const path of ["/fr", "/en/missing", "/ar/missing"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(path.startsWith("/en") ? "Page not found" : "الصفحة غير موجودة");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  }
});

test("URL locale overrides a forged client header", async ({ request }) => {
  const response = await request.get("/ar", { headers: { "x-nadeem-locale": "en" } });
  expect(await response.text()).toContain('<html lang="ar" dir="rtl"');
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
});
