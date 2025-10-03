import { test, expect } from '@playwright/test';

test('should capture final design with new sidebar', async ({ page }) => {
  await page.goto('http://localhost:3000/Dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take full page screenshot
  await page.screenshot({
    path: 'tests/screenshots/final-design.png',
    fullPage: true
  });
});
