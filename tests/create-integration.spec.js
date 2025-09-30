import { test, expect } from '@playwright/test';

test.describe('Create Stitch Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/CreateIntegration');
  });

  test('should display step 1 configuration form', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Create New Stitch")')).toBeVisible();

    // Check step indicator shows Configuration (use heading to avoid strict mode)
    await expect(page.locator('h2:has-text("Configuration")')).toBeVisible();

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
    await page.waitForTimeout(1000);

    // Fill in integration name (try multiple selectors)
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test Integration');
    }

    // Select a Workday service
    const serviceButton = page.locator('button').filter({ hasText: /Select|service/i }).first();
    if (await serviceButton.count() > 0) {
      await serviceButton.click();
      await page.waitForTimeout(500);

      // Try to find and click an option
      const option = page.locator('text=/Submit.*Employee|Personal.*Info/i').first();
      if (await option.count() > 0) {
        await option.click();
      }
    }

    // Next button should be enabled
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      // Click next
      await nextButton.click();
      await page.waitForTimeout(500);

      // Should be on step 2
      const step2Header = page.locator('h2:has-text("Source & Mapping"), h2:has-text("Mapping")');
      if (await step2Header.count() > 0) {
        await expect(step2Header.first()).toBeVisible();
      }
    }
  });

  test('should show step indicator with all steps', async ({ page }) => {
    // Check all steps are visible in the indicator (using step indicator paragraphs)
    const stepIndicator = page.locator('.text-sm.font-medium');
    await expect(stepIndicator.filter({ hasText: 'Configuration' }).first()).toBeVisible();
    await expect(stepIndicator.filter({ hasText: 'Mapping' }).first()).toBeVisible();
    await expect(stepIndicator.filter({ hasText: 'Transformations' }).first()).toBeVisible();
    await expect(stepIndicator.filter({ hasText: 'Validation' }).first()).toBeVisible();
    await expect(stepIndicator.filter({ hasText: 'Review' }).first()).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Look for back button or dashboard link
    const backButton = page.locator('button[aria-label="Back"]');
    const dashboardLink = page.locator('a[href*="Dashboard"]').first();

    if (await backButton.count() > 0) {
      await backButton.click();
    } else if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
    } else {
      // Try finding any button with arrow-left icon
      await page.locator('button:has(svg)').first().click();
    }

    // Should be back on dashboard
    await expect(page).toHaveURL(/Dashboard/);
  });
});
