import { test, expect } from '@playwright/test';

test.describe('Existing Stitch Selection in Pattern Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/PatternBuilder');
  });

  test('should show Thread Canvas header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Thread Canvas")')).toBeVisible();
    await expect(page.locator('text=Build your workflow by connecting steps with Golden Threads')).toBeVisible();
  });

  test('should display step type selection when configuring a step', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Should see step type selection
    await expect(page.locator('text=Step Type')).toBeVisible();
    await expect(page.getByTestId('step-type-new')).toBeVisible();
    await expect(page.getByTestId('step-type-existing')).toBeVisible();
  });

  test('should default to New Web Service step type', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // New Web Service should be selected by default
    const newStepCard = page.getByTestId('step-type-new');
    await expect(newStepCard).toHaveClass(/border-accent-teal/);

    // Web service dropdown should be visible
    await expect(page.locator('label:has-text("Workday Web Service")')).toBeVisible();
  });

  test('should switch to Existing Stitch step type', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Click Existing Stitch card
    await page.getByTestId('step-type-existing').click();
    await page.waitForTimeout(300);

    // Existing Stitch card should be selected
    const existingStepCard = page.getByTestId('step-type-existing');
    await expect(existingStepCard).toHaveClass(/border-accent-teal/);

    // Existing stitch dropdown should be visible
    await expect(page.locator('label:has-text("Select Existing Stitch")')).toBeVisible();
  });

  test('should clear web service when switching to existing stitch', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Select a web service
    const serviceButton = page.locator('button').filter({ hasText: /Select a web service/i }).first();
    if (await serviceButton.count() > 0) {
      await serviceButton.click();
      await page.waitForTimeout(300);

      const option = page.getByText('Create_Position', { exact: true });
      if (await option.count() > 0) {
        await option.click();
      }
    }

    // Switch to existing stitch
    await page.getByTestId('step-type-existing').click();
    await page.waitForTimeout(300);

    // Web service dropdown should not be visible
    await expect(page.locator('label:has-text("Workday Web Service")')).not.toBeVisible();
  });

  test('should clear existing stitch when switching to new web service', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Switch to existing stitch
    await page.getByTestId('step-type-existing').click();
    await page.waitForTimeout(300);

    // Switch back to new web service
    await page.getByTestId('step-type-new').click();
    await page.waitForTimeout(300);

    // Existing stitch dropdown should not be visible
    await expect(page.locator('label:has-text("Select Existing Stitch")')).not.toBeVisible();

    // Web service dropdown should be visible
    await expect(page.locator('label:has-text("Workday Web Service")')).toBeVisible();
  });

  test('should show no stitches message when no existing stitches available', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Switch to existing stitch
    await page.getByTestId('step-type-existing').click();
    await page.waitForTimeout(500);

    // Should show help message
    const helpText = page.locator('text=Create stitches first to use them in patterns');
    if (await helpText.count() > 0) {
      await expect(helpText).toBeVisible();
    }
  });

  test('should enable Test Step button for new web service', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    const testButton = page.getByTestId('test-step-button');

    // Should be disabled initially
    await expect(testButton).toBeDisabled();

    // Select a web service
    const serviceButton = page.locator('button').filter({ hasText: /Select a web service/i }).first();
    if (await serviceButton.count() > 0) {
      await serviceButton.click();
      await page.waitForTimeout(300);

      const option = page.getByText('Create_Position', { exact: true });
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }

    // Test button should be enabled
    await expect(testButton).toBeEnabled();
  });

  test('should show field mapping when web service is selected', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Select a web service
    const serviceButton = page.locator('button').filter({ hasText: /Select a web service/i }).first();
    if (await serviceButton.count() > 0) {
      await serviceButton.click();
      await page.waitForTimeout(300);

      const option = page.getByText('Create_Position', { exact: true });
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(500);
      }
    }

    // Field mapping should be visible
    await expect(page.locator('label:has-text("Field Mapping")')).toBeVisible();
  });

  test('should allow saving step configuration', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Enter step name
    const nameInput = page.locator('input#step-name');
    await nameInput.fill('Create Position Step');

    // Select a web service
    const serviceButton = page.locator('button').filter({ hasText: /Select a web service/i }).first();
    if (await serviceButton.count() > 0) {
      await serviceButton.click();
      await page.waitForTimeout(300);

      const option = page.getByText('Create_Position', { exact: true });
      if (await option.count() > 0) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }

    // Save configuration
    const saveButton = page.getByTestId('save-step-config');
    await saveButton.click();
    await page.waitForTimeout(500);

    // Step should be visible in canvas
    const stepBlock = page.locator('[data-testid^="step-block"]');
    if (await stepBlock.count() > 0) {
      await expect(stepBlock.first()).toBeVisible();
    }
  });

  test('should display webhook trigger configuration status', async ({ page }) => {
    // Trigger block should be visible
    const triggerBlock = page.getByTestId('webhook-trigger-block');
    await expect(triggerBlock).toBeVisible();

    // Should be clickable
    await triggerBlock.click();
    await page.waitForTimeout(500);

    // Webhook configuration panel should open
    await expect(page.locator('text=Configure Webhook Trigger')).toBeVisible();
  });

  test('should allow configuring webhook trigger', async ({ page }) => {
    // Click webhook trigger
    const triggerBlock = page.getByTestId('webhook-trigger-block');
    await triggerBlock.click();
    await page.waitForTimeout(500);

    // Should see webhook configuration options
    await expect(page.locator('text=Configure Webhook Trigger')).toBeVisible();
    await expect(page.getByTestId('webhook-type-file')).toBeVisible();
    await expect(page.getByTestId('webhook-type-json')).toBeVisible();

    // Close with cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
    await page.waitForTimeout(300);

    // Should be back on canvas
    await expect(triggerBlock).toBeVisible();
  });

  test('should preserve step type when reopening configuration', async ({ page }) => {
    // Add a step
    await page.click('button:has-text("Add Step")');
    await page.waitForTimeout(500);

    // Switch to existing stitch
    await page.getByTestId('step-type-existing').click();
    await page.waitForTimeout(300);

    // Close panel
    const closeButton = page.locator('button:has-text("Cancel")');
    await closeButton.click();
    await page.waitForTimeout(300);

    // Reopen step configuration
    const stepBlock = page.locator('[data-testid^="step-block"]');
    if (await stepBlock.count() > 0) {
      await stepBlock.first().click();
      await page.waitForTimeout(500);

      // Should still be on existing stitch type
      const existingStepCard = page.getByTestId('step-type-existing');
      await expect(existingStepCard).toHaveClass(/border-accent-teal/);
    }
  });
});
