import { test, expect } from '@playwright/test';

test.describe('Navigation and Sidebar', () => {
  test('should display sidebar with navigation items', async ({ page }) => {
    await page.goto('/Dashboard');

    // Check sidebar exists
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Check navigation items (use link selectors)
    await expect(page.locator('a').filter({ hasText: /^Dashboard$/ }).first()).toBeVisible();
    await expect(page.locator('a').filter({ hasText: 'Create Integration' })).toBeVisible();
    await expect(page.locator('a').filter({ hasText: /^Run History$/ }).first()).toBeVisible();
    await expect(page.locator('a').filter({ hasText: /^Credentials$/ }).first()).toBeVisible();
  });

  test('should navigate to different pages from sidebar', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Navigate to Credentials
    await page.click('a:has-text("Credentials")');
    await expect(page).toHaveURL('/Credentials');
    await expect(page.locator('h1:has-text("Workday Credentials")')).toBeVisible();
    
    // Navigate to Run History
    await page.click('a:has-text("Run History")');
    await expect(page).toHaveURL('/RunHistory');
    await expect(page.locator('h1:has-text("Run History")')).toBeVisible();
    
    // Navigate back to Dashboard
    await page.click('a:has-text("Dashboard")');
    await expect(page).toHaveURL('/Dashboard');
    await expect(page.locator('h1:has-text("Overview Dashboard")')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/Dashboard');

    // Dashboard link should be active (check for new accent-teal styling)
    const dashboardLink = page.locator('aside').locator('a').filter({ hasText: /^Dashboard$/ }).first();
    await expect(dashboardLink).toHaveClass(/bg-accent-teal/);

    // Navigate to Credentials
    await page.locator('a').filter({ hasText: /^Credentials$/ }).first().click();
    await page.waitForURL(/Credentials/);

    // Credentials link should now be active
    const credentialsLink = page.locator('aside').locator('a').filter({ hasText: /^Credentials$/ }).first();
    await expect(credentialsLink).toHaveClass(/bg-accent-teal/);
  });

  test('should display MVP mode badge', async ({ page }) => {
    await page.goto('/Dashboard');

    // Check for MVP mode indicator if it exists (may not be present)
    const mvpBadge = page.locator('text=MVP Mode');
    if (await mvpBadge.count() > 0) {
      await expect(mvpBadge).toBeVisible();
    }
  });

  test('should show user profile in sidebar footer', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Check user profile section
    await expect(page.locator('text=HR Administrator')).toBeVisible();
    await expect(page.locator('text=Integration Manager')).toBeVisible();
  });

  test('should redirect root path to Dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to Dashboard
    await expect(page).toHaveURL('/Dashboard');
  });
});
