import { test, expect } from '@playwright/test';

test.describe('Service Visibility in UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Create Stitch navigation button', async ({ page }) => {
    // Look for the "Create Stitch" button in the navigation
    const createStitchButton = page.locator('text=Create Stitch');
    await expect(createStitchButton).toBeVisible({ timeout: 10000 });
  });

  test('should show all 3 Workday services in Configuration step', async ({ page }) => {
    // Navigate to Create Stitch
    await page.click('text=Create Stitch');

    // Wait for Configuration page to load
    await expect(page.locator('h2:has-text("Configuration")')).toBeVisible({ timeout: 10000 });

    // Expand the Staffing service category
    const staffingCard = page.locator('text=Staffing').first();
    await expect(staffingCard).toBeVisible();
    await staffingCard.click();

    // Wait for operations to expand
    await page.waitForTimeout(500);

    // Verify all 3 services are visible
    await expect(page.locator('text=Create Position (Legacy - v44.2)')).toBeVisible();
    await expect(page.locator('text=Create Position (Enhanced - v45.0)')).toBeVisible();
    await expect(page.locator('text=End Contingent Worker Contract (v45.0)')).toBeVisible();
  });

  test('should allow selecting Create Position Enhanced service', async ({ page }) => {
    // Navigate to Create Stitch
    await page.click('text=Create Stitch');

    // Wait for Configuration page
    await expect(page.locator('h2:has-text("Configuration")')).toBeVisible();

    // Enter integration name
    await page.fill('input[placeholder*="e.g., Q4 2025"]', 'Test Enhanced Position Creation');

    // Expand Staffing category
    await page.click('text=Staffing');
    await page.waitForTimeout(500);

    // Select Create Position (Enhanced - v45.0)
    await page.click('text=Create Position (Enhanced - v45.0)');

    // Verify it's selected (should show checkmark)
    const selectedOperation = page.locator('[class*="border-accent-teal"]').filter({ hasText: 'Create Position (Enhanced - v45.0)' });
    await expect(selectedOperation).toBeVisible();

    // Next button should be enabled
    const nextButton = page.locator('button:has-text("Next: Source & Mapping")');
    await expect(nextButton).toBeEnabled();
  });

  test('should load correct field definitions for Enhanced Create Position', async ({ page }) => {
    // Navigate to Create Stitch
    await page.click('text=Create Stitch');

    // Fill in name
    await page.fill('input[placeholder*="e.g., Q4 2025"]', 'Enhanced Position Test');

    // Select service
    await page.click('text=Staffing');
    await page.waitForTimeout(500);
    await page.click('text=Create Position (Enhanced - v45.0)');

    // Proceed to mapping step
    await page.click('button:has-text("Next: Source & Mapping")');

    // Wait for mapping step to load
    await expect(page.locator('h2:has-text("Source & Mapping")')).toBeVisible();

    // Upload a sample file to trigger field mapper
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('Supervisor ID,Position Title,Job Posting Title\n12345,Manager,Senior Manager')
      });

      // Wait for file to process
      await page.waitForTimeout(2000);

      // Verify that Enhanced Create Position fields appear (23 total)
      // Look for the Supervisory Organization ID field (required field for v45.0)
      await expect(page.locator('text=Supervisory Organization ID')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should allow selecting End Contingent Worker Contract service', async ({ page }) => {
    // Navigate to Create Stitch
    await page.click('text=Create Stitch');

    // Fill in name
    await page.fill('input[placeholder*="e.g., Q4 2025"]', 'End Contract Test');

    // Select service
    await page.click('text=Staffing');
    await page.waitForTimeout(500);
    await page.click('text=End Contingent Worker Contract (v45.0)');

    // Verify selection
    const selectedOperation = page.locator('[class*="border-accent-teal"]').filter({ hasText: 'End Contingent Worker Contract' });
    await expect(selectedOperation).toBeVisible();

    // Next button should be enabled
    const nextButton = page.locator('button:has-text("Next: Source & Mapping")');
    await expect(nextButton).toBeEnabled();
  });

  test('should search and filter services', async ({ page }) => {
    // Navigate to Create Stitch
    await page.click('text=Create Stitch');

    // Wait for Configuration page
    await expect(page.locator('h2:has-text("Configuration")')).toBeVisible();

    // Expand Staffing section first
    await page.click('text=Staffing');
    await page.waitForTimeout(500);

    // Verify all services are initially visible
    await expect(page.locator('text=Create Position (Legacy - v44.2)')).toBeVisible();
    await expect(page.locator('text=Create Position (Enhanced - v45.0)')).toBeVisible();
    await expect(page.locator('text=End Contingent Worker Contract (v45.0)')).toBeVisible();

    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search web services"]');
    await expect(searchInput).toBeVisible();

    // Search for "contingent"
    await searchInput.fill('contingent');
    await page.waitForTimeout(500);

    // Should only show End Contingent Worker Contract
    await expect(page.locator('text=End Contingent Worker Contract (v45.0)')).toBeVisible();

    // Create Position services should be filtered out
    await expect(page.locator('text=Create Position (Legacy - v44.2)')).toHaveCount(0);
    await expect(page.locator('text=Create Position (Enhanced - v45.0)')).toHaveCount(0);
  });
});
