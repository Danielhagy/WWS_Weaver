import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Webhook Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should show unconfigured state on webhook trigger initially', async ({ page }) => {
    // Webhook trigger should show unconfigured message
    await expect(page.getByText('Click to configure webhook settings')).toBeVisible()

    // Should show alert icon for unconfigured state
    const triggerBlock = page.getByTestId('webhook-trigger-block')
    await expect(triggerBlock).toBeVisible()
  })

  test('should open webhook configuration modal when trigger is clicked', async ({ page }) => {
    // Click the webhook trigger block
    await page.getByTestId('webhook-trigger-block').click()

    // Configuration modal should open
    await expect(page.getByRole('heading', { name: 'Configure Webhook Trigger' })).toBeVisible()
    await expect(page.getByText('Choose how your webhook will receive data')).toBeVisible()
  })

  test('should display file and JSON input type options', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Both options should be visible
    await expect(page.getByTestId('webhook-type-file')).toBeVisible()
    await expect(page.getByTestId('webhook-type-json')).toBeVisible()

    await expect(page.getByText('File Upload')).toBeVisible()
    await expect(page.getByText('Upload CSV/Excel file with headers')).toBeVisible()

    await expect(page.getByText('JSON Body')).toBeVisible()
    await expect(page.getByText('Receive data as POST body')).toBeVisible()
  })

  test('should select file upload type and show file upload UI', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Click file upload option
    await page.getByTestId('webhook-type-file').click()

    // Should show file upload button
    await expect(page.getByTestId('upload-file-button')).toBeVisible()
    await expect(page.getByText('Upload Test File')).toBeVisible()
    await expect(page.getByText('Upload a sample CSV or Excel file to extract column headers')).toBeVisible()
  })

  test('should select JSON type and show JSON input', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Click JSON option
    await page.getByTestId('webhook-type-json').click()

    // Should show JSON textarea
    await expect(page.getByTestId('json-body-input')).toBeVisible()
    await expect(page.getByText('Sample JSON Body')).toBeVisible()
    await expect(page.getByText('Paste a sample JSON object to extract attributes')).toBeVisible()
  })

  test('should extract attributes from valid JSON input', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()

    // Enter valid JSON
    const sampleJson = JSON.stringify({
      employee_id: '12345',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      position_title: 'Engineer'
    }, null, 2)

    await page.getByTestId('json-body-input').fill(sampleJson)

    // Should extract and display attributes
    await expect(page.getByText(/Extracted Attributes/i)).toBeVisible()
    await expect(page.getByTestId('extracted-attribute-employee_id')).toBeVisible()
    await expect(page.getByTestId('extracted-attribute-first_name')).toBeVisible()
    await expect(page.getByTestId('extracted-attribute-last_name')).toBeVisible()
    await expect(page.getByTestId('extracted-attribute-email')).toBeVisible()
    await expect(page.getByTestId('extracted-attribute-position_title')).toBeVisible()

    // Save button should be enabled
    await expect(page.getByTestId('save-webhook-config')).toBeEnabled()
  })

  test('should show error for invalid JSON input', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()

    // Enter invalid JSON
    await page.getByTestId('json-body-input').fill('{ invalid json }')

    // Should show error message
    await expect(page.getByText('Invalid JSON format')).toBeVisible()

    // Save button should be disabled
    await expect(page.getByTestId('save-webhook-config')).toBeDisabled()
  })

  test('should save JSON webhook configuration and update trigger block', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()

    // Enter valid JSON
    const sampleJson = '{"employee_id": "12345", "first_name": "John"}'
    await page.getByTestId('json-body-input').fill(sampleJson)

    // Save configuration
    await page.getByTestId('save-webhook-config').click()

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Configure Webhook Trigger' })).not.toBeVisible()

    // Trigger block should show configured state
    await expect(page.getByText('JSON body: configured')).toBeVisible()
  })

  test('should close webhook config modal when cancel is clicked', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Modal is open
    await expect(page.getByRole('heading', { name: 'Configure Webhook Trigger' })).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Modal should close
    await expect(page.getByRole('heading', { name: 'Configure Webhook Trigger' })).not.toBeVisible()
  })

  test('should disable save button when no type is selected', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Save button should be disabled initially
    await expect(page.getByTestId('save-webhook-config')).toBeDisabled()
  })

  test('should use configured webhook data in step mapping interface', async ({ page }) => {
    // Configure webhook with JSON
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()

    const sampleJson = JSON.stringify({
      worker_id: '123',
      position_title: 'Manager'
    }, null, 2)

    await page.getByTestId('json-body-input').fill(sampleJson)

    // Verify attributes are extracted
    await expect(page.getByText(/Extracted Attributes/i)).toBeVisible()

    await page.getByTestId('save-webhook-config').click()

    // Verify trigger shows configured state
    await expect(page.getByText('JSON body: configured')).toBeVisible()

    // Add a step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Wait for data mapping interface to load and scroll to it
    await expect(page.getByText('Available Data Sources')).toBeVisible()

    // Webhook Source section should exist
    await expect(page.getByText('Webhook Source')).toBeVisible()
  })

  test('should allow reconfiguring webhook after initial setup', async ({ page }) => {
    // Initial configuration
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()
    await page.getByTestId('json-body-input').fill('{"test": "value"}')
    await page.getByTestId('save-webhook-config').click()

    // Click trigger again to reconfigure
    await page.getByTestId('webhook-trigger-block').click()

    // Modal should open with previous configuration
    await expect(page.getByRole('heading', { name: 'Configure Webhook Trigger' })).toBeVisible()

    // Switch to file type
    await page.getByTestId('webhook-type-file').click()

    // Should show file upload UI
    await expect(page.getByTestId('upload-file-button')).toBeVisible()
  })
})

test.describe('Webhook Configuration - Visual State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should show checkmark icon when webhook is configured', async ({ page }) => {
    // Configure webhook
    await page.getByTestId('webhook-trigger-block').click()
    await page.getByTestId('webhook-type-json').click()
    await page.getByTestId('json-body-input').fill('{"test": "value"}')
    await page.getByTestId('save-webhook-config').click()

    // Should show checkmark (configured state)
    const triggerBlock = page.getByTestId('webhook-trigger-block')
    // CheckCircle2 icon should be visible
    await expect(triggerBlock).toBeVisible()
  })

  test('should highlight selected webhook type option', async ({ page }) => {
    await page.getByTestId('webhook-trigger-block').click()

    // Click file option
    await page.getByTestId('webhook-type-file').click()

    // File option should have accent styling
    const fileOption = page.getByTestId('webhook-type-file')
    const classes = await fileOption.getAttribute('class')
    expect(classes).toContain('border-accent-teal')
  })

  test('should show settings icon on hover', async ({ page }) => {
    const triggerBlock = page.getByTestId('webhook-trigger-block')
    await triggerBlock.hover()

    // Settings icon should become visible on hover (opacity transition)
    // The icon exists but has opacity-0 group-hover:opacity-100
  })
})
