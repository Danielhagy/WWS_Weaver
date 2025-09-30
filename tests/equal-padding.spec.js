import { test, expect } from '@playwright/test';

test.describe('Equal Padding Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('main content should have equal left and right padding', async ({ page }) => {
    const contentContainer = page.locator('main > div').first();

    const padding = await contentContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        left: styles.paddingLeft,
        right: styles.paddingRight,
      };
    });

    // Both should be 32px (px-8) - equal padding from sidebar edge and right edge
    expect(padding.left).toBe('32px');
    expect(padding.right).toBe('32px');
  });

  test('content containers should have equal padding from sidebar edge and right edge', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Dashboard' },
      { path: '/CreateIntegration', name: 'Create Integration' },
      { path: '/RunHistory', name: 'Run History' },
      { path: '/Credentials', name: 'Credentials' }
    ];

    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3000${pageInfo.path}`);
      await page.waitForLoadState('networkidle');

      // Get main content container
      const contentContainer = page.locator('main > div').first();
      const mainElement = page.locator('main').first();

      const containerBox = await contentContainer.boundingBox();
      const mainBox = await mainElement.boundingBox();
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      // Calculate distances
      const leftDistance = containerBox.x - mainBox.x; // Should be 32px (padding from sidebar edge)
      const rightDistance = viewportWidth - (containerBox.x + containerBox.width); // Should be 32px (padding from right edge)

      // Both should be equal (allow 1px tolerance for rounding)
      expect(Math.abs(leftDistance - rightDistance)).toBeLessThanOrEqual(1);
    }
  });

  test('header containers should span full width with proper padding', async ({ page }) => {
    // Check dashboard header
    const header = page.locator('.bg-white.rounded-2xl').first();
    const contentContainer = page.locator('main > div').first();

    const headerBox = await header.boundingBox();
    const containerBox = await contentContainer.boundingBox();

    // Header should be within the padded content area
    expect(headerBox.x).toBeGreaterThanOrEqual(containerBox.x - 1);
    expect(headerBox.x + headerBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
  });

  test('should take screenshot showing equal padding', async ({ page }) => {
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/equal-padding-dashboard.png',
      fullPage: false
    });

    // Check Create Integration page
    await page.goto('http://localhost:3000/CreateIntegration');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/equal-padding-create-integration.png',
      fullPage: false
    });
  });
});
