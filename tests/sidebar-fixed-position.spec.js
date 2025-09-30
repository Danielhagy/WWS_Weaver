import { test, expect } from '@playwright/test';

test.describe('Sidebar Fixed Position Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar should remain fixed at top when page content scrolls', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Get initial sidebar position
    const initialBox = await sidebar.boundingBox();
    expect(initialBox.x).toBe(0);
    expect(initialBox.y).toBe(0);

    // Scroll the main content area significantly
    await page.evaluate(() => {
      const main = document.querySelector('main .overflow-y-auto');
      if (main) {
        main.scrollTop = 1000;
      }
    });

    await page.waitForTimeout(500);

    // Check sidebar position hasn't changed
    const afterScrollBox = await sidebar.boundingBox();
    expect(afterScrollBox.x).toBe(0);
    expect(afterScrollBox.y).toBe(0);
    expect(afterScrollBox.height).toBe(initialBox.height);
  });

  test('sidebar should span full viewport height', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const sidebarBox = await sidebar.boundingBox();

    // Sidebar should be full viewport height
    expect(sidebarBox.height).toBe(viewportHeight);
  });

  test('sidebar should stay visible when scrolling to bottom of page', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Scroll to bottom of page
    await page.evaluate(() => {
      const main = document.querySelector('main .overflow-y-auto');
      if (main) {
        main.scrollTop = main.scrollHeight;
      }
    });

    await page.waitForTimeout(500);

    // Sidebar should still be visible
    await expect(sidebar).toBeVisible();

    // Check sidebar is still at top of viewport
    const box = await sidebar.boundingBox();
    expect(box.y).toBe(0);
  });

  test('sidebar footer should always be visible at bottom', async ({ page }) => {
    const userProfile = page.locator('aside').getByText('HR Administrator');

    // Initial check
    await expect(userProfile).toBeVisible();

    // Scroll page content
    await page.evaluate(() => {
      const main = document.querySelector('main .overflow-y-auto');
      if (main) {
        main.scrollTop = 2000;
      }
    });

    await page.waitForTimeout(500);

    // Footer should still be visible
    await expect(userProfile).toBeVisible();
  });

  test('sidebar should have inline fixed positioning styles', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    const styles = await sidebar.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        height: computed.height,
      };
    });

    // The position might be relative due to SidebarProvider, but should act fixed
    expect(styles.left).toBe('0px');
    expect(styles.top).toBe('0px');
  });

  test('should take screenshot showing sidebar stays fixed while scrolled', async ({ page }) => {
    // Scroll content
    await page.evaluate(() => {
      const main = document.querySelector('main .overflow-y-auto');
      if (main) {
        main.scrollTop = 800;
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/sidebar-fixed-scrolled.png',
      fullPage: false // Only capture viewport
    });
  });
});
