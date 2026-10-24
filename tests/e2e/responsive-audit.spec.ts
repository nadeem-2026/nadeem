import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "Mobile (Ultra-compact 320x568)", width: 320, height: 568 },
  { name: "Mobile (Compact Android 360x780)", width: 360, height: 780 },
  { name: "Mobile (iPhone 13 390x844)", width: 390, height: 844 },
  { name: "Mobile (Pixel 7 412x915)", width: 412, height: 915 },
  { name: "Tablet Portrait (iPad 768x1024)", width: 768, height: 1024 },
  { name: "Tablet Landscape (iPad 1024x768)", width: 1024, height: 768 },
  { name: "Laptop (13-inch 1280x800)", width: 1280, height: 800 },
  { name: "Desktop (Standard 1440x900)", width: 1440, height: 900 },
  { name: "Desktop FHD (1920x1080)", width: 1920, height: 1080 },
  { name: "Desktop 2K Ultrawide (2560x1440)", width: 2560, height: 1440 }
];

const ROUTES = [
  { path: "/ar", label: "Home (AR)" },
  { path: "/en", label: "Home (EN)" },
  { path: "/ar/guides", label: "Guides Directory (AR)" },
  { path: "/en/guides", label: "Guides Directory (EN)" },
  { path: "/ar/become-a-guide", label: "Become a Guide (AR)" },
  { path: "/ar/contact", label: "Contact (AR)" },
  { path: "/ar/login", label: "Login (AR)" },
  { path: "/ar/signup", label: "Signup (AR)" },
  { path: "/ar/terms", label: "Terms (AR)" },
  { path: "/ar/privacy", label: "Privacy (AR)" }
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive Viewport: ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`checks ${route.label} for horizontal overflow and layout fit`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(150);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const innerWidth = window.innerWidth;
          const hasOverflow = scrollWidth > innerWidth + 1;

          let culprits: string[] = [];
          if (hasOverflow) {
            const all = document.querySelectorAll("*");
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                if (rect.right > innerWidth + 1 || rect.left < -1) {
                  const tag = el.tagName.toLowerCase();
                  const cls = el.className && typeof el.className === "string" ? el.className.split(" ").slice(0, 3).join(".") : "";
                  const id = el.id ? `#${el.id}` : "";
                  culprits.push(`${tag}${id}${cls ? `.${cls}` : ""} (right: ${Math.round(rect.right)}, innerWidth: ${innerWidth})`);
                  if (culprits.length >= 4) break;
                }
              }
            }
          }
          return { hasOverflow, scrollWidth, innerWidth, diff: scrollWidth - innerWidth, culprits };
        });

        if (overflow.hasOverflow) {
          console.warn(`[OVERFLOW] ${vp.name} on ${route.path}: scrollWidth=${overflow.scrollWidth} > innerWidth=${overflow.innerWidth} (diff: +${overflow.diff}px). Culprits: ${overflow.culprits.join(" | ")}`);
        }

        expect(overflow.hasOverflow, `Page ${route.path} has horizontal overflow at ${vp.width}px. Culprits: ${overflow.culprits.join(", ")}`).toBe(false);

        // Nav visibility verification
        const navCheck = await page.evaluate((width) => {
          const mobileBtn = document.querySelector(".mobile-menu-btn");
          const desktopNav = document.querySelector(".header-inner .desktop-nav");
          const isMobile = width < 900;
          const mobileBtnVisible = mobileBtn ? window.getComputedStyle(mobileBtn).display !== "none" : false;
          const desktopNavVisible = desktopNav ? window.getComputedStyle(desktopNav).display !== "none" : false;
          return { isMobile, mobileBtnVisible, desktopNavVisible };
        }, vp.width);

        if (navCheck.isMobile) {
          expect(navCheck.desktopNavVisible, `Desktop nav should be hidden on mobile (${vp.width}px)`).toBe(false);
          expect(navCheck.mobileBtnVisible, `Mobile hamburger button should be visible on mobile (${vp.width}px)`).toBe(true);
        } else {
          expect(navCheck.desktopNavVisible, `Desktop nav should be visible on desktop (${vp.width}px)`).toBe(true);
          expect(navCheck.mobileBtnVisible, `Mobile hamburger button should be hidden on desktop (${vp.width}px)`).toBe(false);
        }
      });
    }
  });
}
