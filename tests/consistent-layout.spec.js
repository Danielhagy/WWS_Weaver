import { test, expect } from '@playwright/test';

test.describe('Consistent Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard should have header container with consistent styling', async ({ page }) => {
    // Check for header container
    const header = page.locator('.bg-white.rounded-2xl').first();
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/border-soft-gray/);

    // Check heading color
    const heading = page.locator('h1.text-primary-dark-blue');
    await expect(heading).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/dashboard-layout.png',
      fullPage: false
    });
  });

  test('Create Integration should have consistent header styling', async ({ page }) => {
    await page.goto('http://localhost:3000/CreateIntegration');
    await page.waitForLoadState('networkidle');

    const header = page.locator('.bg-white.rounded-2xl').first();
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/border-soft-gray/);

    const heading = page.locator('h1.text-primary-dark-blue');
    await expect(heading).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/create-integration-layout.png',
      fullPage: false
    });
  });

  test('Run History should have consistent header styling', async ({ page }) => {
    await page.goto('http://localhost:3000/RunHistory');
    await page.waitForLoadState('networkidle');

    const header = page.locator('.bg-white.rounded-2xl').first();
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/border-soft-gray/);

    const heading = page.locator('h1.text-primary-dark-blue');
    await expect(heading).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/run-history-layout.png',
      fullPage: false
    });
  });

  test('Credentials should have consistent header styling', async ({ page }) => {
    await page.goto('http://localhost:3000/Credentials');
    await page.waitForLoadState('networkidle');

    const header = page.locator('.bg-white.rounded-2xl').first();
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/border-soft-gray/);

    const heading = page.locator('h1.text-primary-dark-blue');
    await expect(heading).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/credentials-layout.png',
      fullPage: false
    });
  });

  test('all pages should have consistent spacing from sidebar', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Dashboard' },
      { path: '/CreateIntegration', name: 'Create Integration' },
      { path: '/RunHistory', name: 'Run History' },
      { path: '/Credentials', name: 'Credentials' }
    ];

    for (const pageInfo of pages) {
      await page.goto(`http://localhost:3000${pageInfo.path}`);
      await page.waitForLoadState('networkidle');

      // Check main content has ml-72 class (288px left margin)
      const main = page.locator('main').first();
      await expect(main).toHaveClass(/ml-72/);

      // Check sidebar is fixed at left
      const sidebar = page.locator('aside').first();
      await expect(sidebar).toHaveClass(/fixed/);
    }
  });
});
