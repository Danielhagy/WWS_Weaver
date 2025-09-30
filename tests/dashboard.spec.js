import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load dashboard with sample integrations', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Check page title
    await expect(page.locator('h1:has-text("Integration Dashboard")')).toBeVisible();
    
    // Check that integrations are displayed
    await expect(page.locator('text=New Hire Personal Info').first()).toBeVisible();
    await expect(page.locator('text=Time Off Requests').first()).toBeVisible();
    
    // Check stats cards are present
    await expect(page.locator('text=Total Integrations')).toBeVisible();
    await expect(page.locator('text=Recent Runs')).toBeVisible();
    await expect(page.locator('text=Success Rate')).toBeVisible();
  });

  test('should navigate to create integration page', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Click the "New Integration" button
    await page.click('text=New Integration');
    
    // Should be on create integration page
    await expect(page).toHaveURL('/CreateIntegration');
    await expect(page.locator('h1:has-text("Create New Integration")')).toBeVisible();
  });

  test('should display integration cards with correct status badges', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Wait for integrations to load
    await page.waitForSelector('text=New Hire Personal Info');
    
    // Check for active status badges
    const statusBadges = page.locator('text=active');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should show recent runs section', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Check recent runs section exists
    await expect(page.locator('text=Recent Execution History')).toBeVisible();
    
    // Should have at least one run displayed
    const runItems = page.locator('[class*="border rounded-lg"]');
    await expect(runItems.first()).toBeVisible();
  });
});
