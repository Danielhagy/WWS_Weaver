import { test, expect } from '@playwright/test';

test.describe('Create Integration Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/CreateIntegration');
  });

  test('should display step 1 configuration form', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Create New Integration")')).toBeVisible();
    
    // Check step indicator shows Configuration
    await expect(page.locator('text=Configuration')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('label:has-text("Integration Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Workday Web Service")')).toBeVisible();
  });

  test('should validate required fields before proceeding', async ({ page }) => {
    // Try to click Next without filling fields
    const nextButton = page.locator('button:has-text("Next")');
    
    // Button should be disabled initially
    await expect(nextButton).toBeDisabled();
  });

  test('should allow filling configuration and moving to next step', async ({ page }) => {
    // Fill in integration name
    await page.fill('input[placeholder*="New Hire"]', 'Test Integration');
    
    // Select a Workday service
    await page.click('button:has-text("Select a Workday service")');
    await page.click('text=Submit Employee Personal Info');
    
    // Next button should be enabled
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();
    
    // Click next
    await nextButton.click();
    
    // Should be on step 2
    await expect(page.locator('text=Source & Mapping')).toBeVisible();
  });

  test('should show step indicator with all steps', async ({ page }) => {
    // Check all steps are visible in the indicator
    await expect(page.locator('text=Configuration')).toBeVisible();
    await expect(page.locator('text=Mapping')).toBeVisible();
    await expect(page.locator('text=Transformations')).toBeVisible();
    await expect(page.locator('text=Validation')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Click back button
    await page.click('button[aria-label="Back"]').catch(() => {
      // Try alternative selector
      return page.click('svg[class*="lucide-arrow-left"]').catch(() => {
        return page.click('button:has(svg)').first();
      });
    });
    
    // Should be back on dashboard
    await expect(page).toHaveURL('/Dashboard');
  });
});
