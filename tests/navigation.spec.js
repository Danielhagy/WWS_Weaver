import { test, expect } from '@playwright/test';

test.describe('Navigation and Sidebar', () => {
  test('should display sidebar with navigation items', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Check sidebar branding
    await expect(page.locator('aside >> text=Workday Weaver')).toBeVisible();
    await expect(page.locator('text=Integration Platform')).toBeVisible();
    
    // Check navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Create Integration')).toBeVisible();
    await expect(page.locator('text=Run History')).toBeVisible();
    await expect(page.locator('text=Credentials')).toBeVisible();
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
    await expect(page.locator('h1:has-text("Integration Dashboard")')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Dashboard link should be active (check parent button has active class)
    const dashboardButton = page.locator('aside').locator('button:has-text("Dashboard")');
    await expect(dashboardButton).toHaveClass(/bg-blue-100/);
    
    // Navigate to Credentials
    await page.click('a:has-text("Credentials")');
    
    // Credentials button should now be active
    const credentialsButton = page.locator('aside').locator('button:has-text("Credentials")');
    await expect(credentialsButton).toHaveClass(/bg-blue-100/);
  });

  test('should display MVP mode badge', async ({ page }) => {
    await page.goto('/Dashboard');
    
    // Check MVP mode indicator
    await expect(page.locator('text=MVP Mode')).toBeVisible();
    await expect(page.locator('text=This is a visual prototype')).toBeVisible();
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
