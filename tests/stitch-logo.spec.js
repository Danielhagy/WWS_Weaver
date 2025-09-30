import { test, expect } from '@playwright/test';

test.describe('Stitch Logo Tests', () => {
  test('should display Stitch logo in sidebar', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check for Stitch logo (updated alt text)
    const logo = page.locator('img[alt="Stitch"]').first();
    await expect(logo).toBeVisible();

    // Verify the logo source
    const src = await logo.getAttribute('src');
    expect(src).toContain('StitchLogo.svg');

    // Take a screenshot
    await page.screenshot({
      path: 'tests/screenshots/stitch-logo.png',
      fullPage: true
    });
  });

  test('should display logo in sidebar header', async ({ page }) => {
    await page.goto('http://localhost:3000/Dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Take a screenshot focusing on the sidebar
    await page.locator('aside').first().screenshot({
      path: 'tests/screenshots/stitch-sidebar.png'
    });
  });
});
