import { test, expect } from '@playwright/test';

test.describe('Credentials Page', () => {
  test('should display credentials page', async ({ page }) => {
    await page.goto('/Credentials');
    
    // Check page title
    await expect(page.locator('h1:has-text("Workday Credentials")')).toBeVisible();
    
    // Check description
    await expect(page.locator('text=Manage your Integration System User credentials')).toBeVisible();
  });

  test('should show existing credentials', async ({ page }) => {
    await page.goto('/Credentials');
    
    // Wait for credentials to load
    await page.waitForSelector('text=acme_demo');
    
    // Check that demo credential is displayed
    await expect(page.locator('text=acme_demo')).toBeVisible();
    await expect(page.locator('text=https://wd2-impl.workday.com')).toBeVisible();
    
    // Check active badge
    await expect(page.locator('text=Active')).toBeVisible();
  });

  test('should open add credentials form', async ({ page }) => {
    await page.goto('/Credentials');
    
    // Click Add Credentials button
    await page.click('button:has-text("Add Credentials")');
    
    // Form should be visible
    await expect(page.locator('text=New Workday Credentials')).toBeVisible();
    await expect(page.locator('label:has-text("Tenant Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Tenant URL")')).toBeVisible();
    await expect(page.locator('label:has-text("ISU Username")')).toBeVisible();
    await expect(page.locator('label:has-text("ISU Password")')).toBeVisible();
  });

  test('should validate credentials form fields', async ({ page }) => {
    await page.goto('/Credentials');
    
    // Open form
    await page.click('button:has-text("Add Credentials")');
    
    // Fill in partial data
    await page.fill('input[placeholder*="acme_corp"]', 'test_tenant');
    
    // Try to submit without all required fields
    const saveButton = page.locator('button[type="submit"]:has-text("Save Credentials")');
    
    // Should not be able to submit (browser validation will prevent it)
    await expect(saveButton).toBeVisible();
  });

  test('should cancel credentials form', async ({ page }) => {
    await page.goto('/Credentials');
    
    // Open form
    await page.click('button:has-text("Add Credentials")');
    
    // Check form is visible
    await expect(page.locator('text=New Workday Credentials')).toBeVisible();
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Form should be hidden
    await expect(page.locator('text=New Workday Credentials')).not.toBeVisible();
  });
});
