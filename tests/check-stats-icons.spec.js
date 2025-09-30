import { test, expect } from '@playwright/test';

test.describe('Dashboard Stats Card Icons', () => {
  test('should check if stats card icons are visible', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for stats cards to load
    await page.waitForSelector('text=Total Integrations', { timeout: 5000 });

    // Take a screenshot of the stats cards section
    const statsSection = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first();
    await statsSection.screenshot({ path: 'tests/screenshots/stats-cards-icons.png' });

    // Check all 4 stat cards
    const statCards = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').first().locator('> div');
    const count = await statCards.count();
    console.log(`Found ${count} stat cards`);

    // Check each card for icon SVG elements
    for (let i = 0; i < count; i++) {
      const card = statCards.nth(i);
      const cardText = await card.textContent();
      console.log(`Card ${i + 1}: ${cardText?.split('\n')[0]}`);

      // Look for SVG icons (lucide-react renders as SVG)
      const svgIcons = await card.locator('svg').count();
      console.log(`  SVG icons found: ${svgIcons}`);

      // Get card HTML for debugging
      const html = await card.innerHTML();
      console.log(`  Has icon container: ${html.includes('p-3 rounded-xl')}`);
    }

    // Take full page screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-full.png', fullPage: true });
  });
});
