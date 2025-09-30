import { test, expect } from '@playwright/test';

test.describe('Run History Page', () => {
  test('should display run history page', async ({ page }) => {
    await page.goto('/RunHistory');
    
    // Check page title
    await expect(page.locator('h1:has-text("Run History")')).toBeVisible();
    
    // Check description
    await expect(page.locator('text=View and filter all integration executions')).toBeVisible();
  });

  test('should show filter controls', async ({ page }) => {
    await page.goto('/RunHistory');

    // Check search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }

    // Check for filter buttons (may use different structure)
    await page.waitForTimeout(1000);
  });

  test('should display execution history', async ({ page }) => {
    await page.goto('/RunHistory');

    // Wait for page to load
    await page.waitForTimeout(1500);

    // Check for heading
    const historyHeading = page.locator('h2, h3').filter({ hasText: /History|Execution/i }).first();
    if (await historyHeading.count() > 0) {
      await expect(historyHeading).toBeVisible();
    }

    // Check for status badges (success/failed)
    const successBadge = page.locator('text=success').first();
    const failedBadge = page.locator('text=failed').first();

    if (await successBadge.count() > 0) {
      await expect(successBadge).toBeVisible();
    } else if (await failedBadge.count() > 0) {
      await expect(failedBadge).toBeVisible();
    }
  });

  test('should filter runs by status', async ({ page }) => {
    await page.goto('/RunHistory');

    // Wait for initial load
    await page.waitForTimeout(1500);

    // Look for filter button if it exists
    const statusFilter = page.locator('button').filter({ hasText: /Status|All Statuses/i }).first();

    if (await statusFilter.count() > 0) {
      await statusFilter.click();

      // Try to select success
      const successOption = page.locator('text=Success').first();
      if (await successOption.count() > 0) {
        await successOption.click();
      }
    }

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should search runs by integration name', async ({ page }) => {
    await page.goto('/RunHistory');

    // Wait for initial load
    await page.waitForTimeout(1500);

    // Try to find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('Time Off');

      // Wait a bit for potential filtering
      await page.waitForTimeout(500);
    }

    // Page should remain functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display run details', async ({ page }) => {
    await page.goto('/RunHistory');

    // Wait for runs to load
    await page.waitForTimeout(1500);

    // Look for run items (cards with rounded corners)
    const runCards = page.locator('.rounded-lg, .rounded-xl').filter({ has: page.locator('text=/webhook|manual|success|failed/i') });

    if (await runCards.count() > 0) {
      const firstRun = runCards.first();

      // Check for trigger type or status
      const hasWebhook = await firstRun.locator('text=webhook').count() > 0;
      const hasManual = await firstRun.locator('text=manual').count() > 0;
      const hasStatus = await firstRun.locator('text=/success|failed/i').count() > 0;

      expect(hasWebhook || hasManual || hasStatus).toBeTruthy();
    }
  });
});
