import { test, expect } from "@playwright/test";

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: account forms expose only allowed registration roles`, async ({ page }) => {
    await page.goto(`/${locale}/signup`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "ar" ? "إنشاء حساب" : "Create an account");
    const role = page.getByRole("combobox");
    await expect(role.locator("option")).toHaveCount(2);
    expect(await role.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))).toEqual(["tourist", "guide"]);
    await expect(page.locator('input[name="password"]')).toHaveAttribute("minlength", "12");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("button", { name: locale === "ar" ? "إنشاء حساب" : "Create an account", exact: true })).toBeVisible();
  });

  test(`${locale}: unauthenticated account, admin and password update routes require sign-in`, async ({ page }) => {
    for (const route of ["account", "admin/guides", "update-password"]) {
      await page.goto(`/${locale}/${route}`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/login`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "ar" ? "تسجيل الدخول" : "Sign in");
    }
  });
}

test("language switch preserves the account page", async ({ page }) => {
  await page.goto("/ar/signup");
  await page.getByRole("link", { name: "View in English" }).click();
  await expect(page).toHaveURL(/\/en\/signup$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("link", { name: "عرض باللغة العربية" }).click();
  await expect(page).toHaveURL(/\/ar\/signup$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("invalid recovery callback cannot redirect to a third-party site", async ({ request }) => {
  const response = await request.get("/en/auth/callback?next=https://attacker.invalid", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const target = new URL(response.headers().location);
  expect(["localhost", "127.0.0.1"]).toContain(target.hostname);
  expect(target.pathname).toBe("/en/login");
  expect(target.searchParams.get("notice")).toBe("expired");
});

for (const locale of ["ar", "en"] as const) {
  test(`${locale}: recovery callback reaches browser bridge; missing credentials show retry form`, async ({ page, request }) => {
    const response = await request.get(`/${locale}/auth/callback?next=/${locale}/update-password`, { maxRedirects: 0 });
    const target = new URL(response.headers().location);
    expect(target.pathname).toBe(`/${locale}/auth/recovery`);
    expect(target.hash).toBe("");
    expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    await page.goto(`/${locale}/auth/callback?next=/${locale}/update-password#type=recovery`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/forgot-password\\?notice=expired$`));
    await expect(page.locator("p[role='alert']")).toBeVisible();
  });
}

test("HEAD probes do not consume recovery credentials", async ({ request }) => {
  const response = await request.head("/ar/auth/callback?code=scanner-probe");
  expect(response.status()).toBe(204);
  expect(response.headers()["cache-control"]).toContain("no-store");
});
