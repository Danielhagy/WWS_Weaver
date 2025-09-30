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
    await expect(page.locator('input[placeholder*="Search by integration name"]')).toBeVisible();
    
    // Check filter dropdowns
    await expect(page.locator('text=All Statuses')).toBeVisible();
    await expect(page.locator('text=All Integrations')).toBeVisible();
  });

  test('should display execution history', async ({ page }) => {
    await page.goto('/RunHistory');
    
    // Wait for runs to load
    await page.waitForSelector('text=Execution History');
    
    // Should show run items
    await expect(page.locator('text=New Hire Personal Info').first()).toBeVisible();
    
    // Check that status badges are visible
    const statusBadges = page.locator('text=success, text=failed');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('should filter runs by status', async ({ page }) => {
    await page.goto('/RunHistory');
    
    // Wait for initial load
    await page.waitForSelector('text=Execution History');
    
    // Click status filter
    await page.click('button:has-text("All Statuses")');
    
    // Select "Success" status
    await page.click('text=Success').first();
    
    // Check that filter is applied (showing count)
    await expect(page.locator('text=Showing')).toBeVisible();
  });

  test('should search runs by integration name', async ({ page }) => {
    await page.goto('/RunHistory');
    
    // Wait for initial load
    await page.waitForSelector('text=Execution History');
    
    // Type in search box
    await page.fill('input[placeholder*="Search by integration name"]', 'Time Off');
    
    // Should filter results
    await expect(page.locator('text=Time Off Requests')).toBeVisible();
  });

  test('should display run details', async ({ page }) => {
    await page.goto('/RunHistory');
    
    // Wait for runs to load
    await page.waitForSelector('text=Execution History');
    
    // Check that run details are displayed
    const firstRun = page.locator('[class*="bg-gray-50 rounded-lg"]').first();
    
    // Should show trigger type
    await expect(firstRun.locator('text=webhook, text=manual')).toBeVisible();
    
    // Should show timestamp
    await expect(firstRun).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
