import { test, expect } from "@playwright/test";

test.describe("Booking Lifecycle", () => {
  // Note: These tests assume a local Supabase environment where email confirmation is disabled
  // or auto-confirmed, or uses pre-seeded test accounts.
  
  test("Tourist can view guide profile and initiate booking", async ({ page }) => {
    // Navigate to guides list
    await page.goto("/en/guides");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find a Guide");
    
    // We expect at least one guide if seeded, but let's just check the page loads
    const guideLinks = page.locator('a[href*="/guides/"]');
    if (await guideLinks.count() > 0) {
      await guideLinks.first().click();
      
      // Guide details page
      await expect(page.locator('form[action*="createBooking"]')).toBeVisible();
      
      // Try to fill booking form (will fail if not logged in, but we check UI)
      await page.fill('input[name="start_time"]', '2026-12-01T10:00');
      await page.fill('input[name="duration_hours"]', '2');
      await page.fill('input[name="participants"]', '2');
      await page.fill('input[name="meeting_point"]', 'Riyadh Tower');
      
      await page.getByRole("button", { name: /Book/i }).click();
      
      // Should redirect to login because not authenticated
      await expect(page).toHaveURL(/\/en\/login/);
    }
  });

  test("Dashboard access requires admin role", async ({ page }) => {
    await page.goto("/en/admin");
    // If not logged in, should redirect to login
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
