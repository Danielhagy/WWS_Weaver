import { test, expect } from '@playwright/test';

/**
 * Choice Field Clear Button and Edit Mode Tests
 *
 * Tests that:
 * 1. Clear buttons appear for ALL fields (required and optional) when they have values
 * 2. Set badges appear for ALL fields with values
 * 3. Choice field values persist when editing an integration
 * 4. Clear button works correctly
 */

test.describe('Choice Field Clear Buttons and Edit Mode', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should show clear buttons for required fields (First Name, Last Name)', async ({ page }) => {
    // Navigate to create integration
    await page.click('text=Create New Integration');
    await page.waitForSelector('text=Select Workday Service');

    // Select Contract Contingent Worker
    await page.click('select[name="workday_service"]');
    await page.selectOption('select[name="workday_service"]', 'contract_contingent_worker');

    // Fill integration name and continue
    await page.fill('input[name="name"]', 'Test Choice Fields');
    await page.click('button:has-text("Next")');

    // Wait for mapping step
    await page.waitForSelector('text=Upload your data file');

    // Create a test CSV file with sample data
    const csvContent = 'first_name,last_name,email,start_date\nJohn,Doe,john@example.com,2025-01-15';
    const buffer = Buffer.from(csvContent);

    // Upload file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });

    // Wait for file to be processed
    await page.waitForSelector('text=Pre-hire Selection', { timeout: 10000 });

    // Click "Create New Applicant" option
    await page.click('text=Create New Applicant');

    // Wait for expansion
    await page.waitForSelector('text=First Name');

    // Fill in First Name using File mapping
    const firstNameField = await page.locator('text=First Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();

    // Click File tab
    await firstNameField.locator('button:has-text("File")').click();

    // Select file column
    await firstNameField.locator('select, button[role="combobox"]').first().click();
    await page.click('text=first_name');

    // Wait a moment for value to be set
    await page.waitForTimeout(500);

    // Check that "Set" badge appears
    const setBadge = await firstNameField.locator('text=Set').count();
    expect(setBadge).toBeGreaterThan(0);

    // Check that Clear button appears (even though it's a required field)
    const clearButton = await firstNameField.locator('button:has-text("Clear")').count();
    expect(clearButton).toBeGreaterThan(0);

    // Verify field has green background indicating it's set
    const fieldContainer = await firstNameField.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log('First Name field background:', fieldContainer);
  });

  test('should allow clearing required fields', async ({ page }) => {
    // Navigate and setup (same as above)
    await page.click('text=Create New Integration');
    await page.waitForSelector('text=Select Workday Service');
    await page.click('select[name="workday_service"]');
    await page.selectOption('select[name="workday_service"]', 'contract_contingent_worker');
    await page.fill('input[name="name"]', 'Test Clear Functionality');
    await page.click('button:has-text("Next")');

    const csvContent = 'first_name,last_name\nJohn,Doe';
    const buffer = Buffer.from(csvContent);
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });

    await page.waitForSelector('text=Pre-hire Selection', { timeout: 10000 });
    await page.click('text=Create New Applicant');
    await page.waitForSelector('text=First Name');

    // Fill First Name with hardcoded value
    const firstNameField = await page.locator('text=First Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await firstNameField.locator('button:has-text("Static")').click();
    await firstNameField.locator('input[type="text"]').fill('TestName');

    await page.waitForTimeout(500);

    // Verify Set badge appears
    await expect(firstNameField.locator('text=Set')).toBeVisible();

    // Click Clear button
    await firstNameField.locator('button:has-text("Clear")').click();

    await page.waitForTimeout(300);

    // Verify field is cleared
    const inputValue = await firstNameField.locator('input[type="text"]').inputValue();
    expect(inputValue).toBe('');

    // Verify Set badge is gone
    const setBadgeAfterClear = await firstNameField.locator('text=Set').count();
    expect(setBadgeAfterClear).toBe(0);
  });

  test('should persist choice field values in edit mode', async ({ page }) => {
    // Create an integration with choice fields
    await page.click('text=Create New Integration');
    await page.waitForSelector('text=Select Workday Service');
    await page.selectOption('select[name="workday_service"]', 'contract_contingent_worker');
    await page.fill('input[name="name"]', 'Test Edit Persistence');
    await page.click('button:has-text("Next")');

    const csvContent = 'first_name,last_name,email\nJane,Smith,jane@test.com';
    const buffer = Buffer.from(csvContent);
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });

    await page.waitForSelector('text=Pre-hire Selection', { timeout: 10000 });

    // Select Create New Applicant
    await page.click('text=Create New Applicant');
    await page.waitForSelector('text=First Name');

    // Fill First Name
    const firstNameField = await page.locator('text=First Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await firstNameField.locator('button:has-text("File")').click();
    await page.waitForTimeout(200);

    // Select from dropdown
    const firstNameSelect = firstNameField.locator('select, button[role="combobox"]').first();
    await firstNameSelect.click();
    await page.click('text=first_name');

    // Fill Last Name with hardcoded value
    const lastNameField = await page.locator('text=Last Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await lastNameField.locator('button:has-text("Static")').click();
    await lastNameField.locator('input[type="text"]').fill('TestLastName');

    await page.waitForTimeout(500);

    // Verify both fields show as set
    await expect(firstNameField.locator('text=Set')).toBeVisible();
    await expect(lastNameField.locator('text=Set')).toBeVisible();

    // Navigate to next step (this saves the data)
    await page.click('button:has-text("Next")');

    // Wait for Review step
    await page.waitForSelector('text=Review & Save', { timeout: 5000 });

    // Go back to mapping step
    await page.click('button:has-text("Back")');

    // Wait for mapping step to load
    await page.waitForSelector('text=Pre-hire Selection', { timeout: 5000 });

    // Verify Create New Applicant is still selected
    const createApplicantCard = await page.locator('text=Create New Applicant').locator('xpath=ancestor::div[contains(@class, "border-blue-500")]');
    expect(await createApplicantCard.count()).toBeGreaterThan(0);

    // Verify it's still expanded (or click to expand if needed)
    const firstNameVisible = await page.locator('text=First Name').isVisible();
    if (!firstNameVisible) {
      await page.click('button:has-text("Expand")');
      await page.waitForSelector('text=First Name');
    }

    // Verify First Name value is still there
    const firstNameFieldAfter = await page.locator('text=First Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await expect(firstNameFieldAfter.locator('text=Set')).toBeVisible();

    // Verify Last Name value is still there
    const lastNameFieldAfter = await page.locator('text=Last Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await expect(lastNameFieldAfter.locator('text=Set')).toBeVisible();

    const lastNameInput = await lastNameFieldAfter.locator('input[type="text"]').inputValue();
    expect(lastNameInput).toBe('TestLastName');
  });

  test('should show Set badges with correct colors for required vs optional fields', async ({ page }) => {
    await page.click('text=Create New Integration');
    await page.waitForSelector('text=Select Workday Service');
    await page.selectOption('select[name="workday_service"]', 'contract_contingent_worker');
    await page.fill('input[name="name"]', 'Test Badge Colors');
    await page.click('button:has-text("Next")');

    const csvContent = 'first_name,email\nTest,test@example.com';
    const buffer = Buffer.from(csvContent);
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });

    await page.waitForSelector('text=Pre-hire Selection', { timeout: 10000 });
    await page.click('text=Create New Applicant');
    await page.waitForSelector('text=First Name');

    // Fill First Name (required field)
    const firstNameField = await page.locator('text=First Name').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await firstNameField.locator('button:has-text("Static")').click();
    await firstNameField.locator('input[type="text"]').fill('Required');

    await page.waitForTimeout(300);

    // Check First Name badge is blue (required field)
    const firstNameBadge = await firstNameField.locator('text=Set');
    await expect(firstNameBadge).toBeVisible();
    const firstNameBadgeClass = await firstNameBadge.getAttribute('class');
    expect(firstNameBadgeClass).toContain('bg-blue-100'); // Required fields get blue badge

    // Fill Email (optional field)
    const emailField = await page.locator('text=Email Address').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await emailField.locator('button:has-text("Static")').click();
    await emailField.locator('input[type="text"]').fill('optional@test.com');

    await page.waitForTimeout(300);

    // Check Email badge is green (optional field)
    const emailBadge = await emailField.locator('text=Set');
    await expect(emailBadge).toBeVisible();
    const emailBadgeClass = await emailBadge.getAttribute('class');
    expect(emailBadgeClass).toContain('bg-green-100'); // Optional fields get green badge
  });

  test('should clear text_with_type fields properly (Applicant ID)', async ({ page }) => {
    await page.click('text=Create New Integration');
    await page.waitForSelector('text=Select Workday Service');
    await page.selectOption('select[name="workday_service"]', 'contract_contingent_worker');
    await page.fill('input[name="name"]', 'Test Applicant ID Clear');
    await page.click('button:has-text("Next")');

    const csvContent = 'applicant_id\nAPP001';
    const buffer = Buffer.from(csvContent);
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });

    await page.waitForSelector('text=Pre-hire Selection', { timeout: 10000 });
    await page.click('text=Create New Applicant');
    await page.waitForSelector('text=Applicant ID');

    // Fill Applicant ID
    const applicantIdField = await page.locator('text=Applicant ID').locator('xpath=ancestor::div[contains(@class, "space-y-2")]').first();
    await applicantIdField.locator('button:has-text("Static")').click();

    // Fill the ID value
    const idInput = await applicantIdField.locator('input[type="text"]').first();
    await idInput.fill('TEST-123');

    await page.waitForTimeout(300);

    // Verify Set badge appears
    await expect(applicantIdField.locator('text=Set')).toBeVisible();

    // Click Clear
    await applicantIdField.locator('button:has-text("Clear")').click();

    await page.waitForTimeout(300);

    // Verify both ID and type are cleared
    const inputValue = await idInput.inputValue();
    expect(inputValue).toBe('');

    // Verify type dropdown reset to default
    const typeSelect = await applicantIdField.locator('select').first();
    const typeValue = await typeSelect.inputValue();
    expect(typeValue).toBe('Applicant_ID'); // Default type
  });
});
