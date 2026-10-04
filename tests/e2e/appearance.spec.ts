import { expect, test } from "@playwright/test";

test("theme follows the device and persists explicit choices across routes and reloads", async ({ page }) => {
  const errors: string[]=[]; page.on("pageerror",error=>errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en",{waitUntil:"domcontentloaded"});
  await expect(page.locator("body")).toHaveCSS("background-color","rgb(16, 28, 25)");
  await page.getByLabel("Appearance").selectOption("light");
  await expect(page.locator("body")).toHaveCSS("background-color","rgb(247, 243, 234)");
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.getByLabel("Appearance").selectOption("dark");
  await page.getByRole("link",{name:"عرض باللغة العربية"}).click();
  await expect(page.getByLabel("مظهر الموقع")).toHaveValue("dark");
  await page.goto("/ar/login",{waitUntil:"domcontentloaded"});
  await expect(page.locator("body")).toHaveCSS("background-color","rgb(16, 28, 25)");
  await expect(page.locator("input").first()).toHaveCSS("background-color","rgb(27, 44, 39)");
  await page.getByLabel("مظهر الموقع").selectOption("system");
  await page.emulateMedia({colorScheme:"light"});
  await expect(page.locator("body")).toHaveCSS("background-color","rgb(247, 243, 234)");
  expect(errors).toEqual([]);
});

test("footer has real information pages and intentionally unlinked social labels", async ({ page }) => {
  await page.goto("/ar",{waitUntil:"domcontentloaded"});
  const footer=page.locator("footer");
  for(const name of ["Facebook","X","WhatsApp","Gmail","YouTube"]) {
    await expect(footer.getByText(name,{exact:true})).toBeVisible();
    await expect(footer.getByRole("link",{name,exact:true})).toHaveCount(0);
  }
  for(const slug of ["terms","privacy","photo-credits"]) {
    const response=await page.goto(`/ar/${slug}`,{waitUntil:"domcontentloaded"});
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading",{level:1})).toBeVisible();
  }
  await expect(page.locator('main a[href*="creativecommons.org"]')).toHaveCount(4);
});

test("destination photos load locally in dark mode without mobile overflow", async ({ page },testInfo) => {
  await page.emulateMedia({colorScheme:"dark"});
  await page.goto("/ar",{waitUntil:"domcontentloaded"});
  await expect(page.locator(".destination-img")).toHaveCount(4);
  for(const photo of await page.locator(".destination-img, .hero-img").all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveJSProperty("complete",true);
    expect(await photo.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(await photo.getAttribute("src")).toContain("%2Fphotos%2F");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath("dark-home.png"),fullPage:true});
  await page.getByLabel("مظهر الموقع").selectOption("light");
  await page.screenshot({path:testInfo.outputPath("light-home.png"),fullPage:true});
});
