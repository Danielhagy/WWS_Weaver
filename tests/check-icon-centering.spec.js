import { test, expect } from '@playwright/test';

test.describe('Dashboard Stats Card Icon Centering', () => {
  test('should show icon centering in detail', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for stats cards to load
    await page.waitForSelector('text=Total Integrations', { timeout: 5000 });

    // Take a full screenshot of the stats section
    const statsSection = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first();
    await statsSection.screenshot({ path: 'tests/screenshots/stats-centering-before.png' });

    // Take individual card screenshots
    const cards = await statsSection.locator('> div');
    for (let i = 0; i < 4; i++) {
      await cards.nth(i).screenshot({ path: `tests/screenshots/card-${i + 1}-centering.png` });
    }

    console.log('Screenshots saved to tests/screenshots/');
  });
});
