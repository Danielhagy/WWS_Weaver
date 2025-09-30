import { test, expect } from '@playwright/test';

test.describe('Sidebar Scroll and Color Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('HR Administrator text should be accent-teal color', async ({ page }) => {
    // Find the HR Administrator text in the sidebar footer
    const hrAdminText = page.locator('aside .text-accent-teal:has-text("HR Administrator")');

    await expect(hrAdminText).toBeVisible();
    await expect(hrAdminText).toHaveClass(/text-accent-teal/);
  });

  test('sidebar should not scroll when page scrolls', async ({ page }) => {
    // Get initial sidebar position
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    const initialBox = await sidebar.boundingBox();

    // Scroll the page content
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 500;
      }
    });

    await page.waitForTimeout(500);

    // Check sidebar position hasn't changed
    const afterScrollBox = await sidebar.boundingBox();

    expect(initialBox.x).toBe(afterScrollBox.x);
    expect(initialBox.y).toBe(afterScrollBox.y);
  });

  test('sidebar should have overflow-hidden to prevent scrolling', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Check that sidebar has overflow-hidden class
    await expect(sidebar).toHaveClass(/overflow-hidden/);
  });

  test('sidebar content should not be scrollable', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Try to scroll the sidebar
    const initialScrollTop = await sidebar.evaluate((el) => el.scrollTop);

    // Attempt to scroll sidebar
    await sidebar.evaluate((el) => {
      el.scrollTop = 100;
    });

    await page.waitForTimeout(200);

    const afterScrollTop = await sidebar.evaluate((el) => el.scrollTop);

    // Sidebar should not have scrolled
    expect(afterScrollTop).toBe(initialScrollTop);
  });

  test('sidebar should remain in fixed position', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Check that sidebar has fixed class
    await expect(sidebar).toHaveClass(/fixed/);

    // Verify it stays at left: 0, top: 0
    const box = await sidebar.boundingBox();
    expect(box.x).toBe(0);
    expect(box.y).toBe(0);
  });

  test('Integration Manager text should also be accent-teal', async ({ page }) => {
    const integrationManagerText = page.locator('aside .text-accent-teal:has-text("Integration Manager")');

    await expect(integrationManagerText).toBeVisible();
    await expect(integrationManagerText).toHaveClass(/text-accent-teal/);
  });

  test('main content should be independently scrollable', async ({ page }) => {
    const main = page.locator('main').first();
    await expect(main).toBeVisible();

    // Check that main has overflow-y-auto or similar
    const overflowY = await main.evaluate((el) => {
      const content = el.querySelector('.overflow-y-auto');
      return content !== null;
    });

    expect(overflowY).toBe(true);
  });

  test('should take screenshot of updated sidebar', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Take screenshot of just the sidebar
    const sidebar = page.locator('aside').first();
    await sidebar.screenshot({
      path: 'tests/screenshots/stitch-sidebar.png'
    });

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/screenshots/final-design.png',
      fullPage: true
    });
  });
});
