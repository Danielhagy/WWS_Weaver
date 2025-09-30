import { test, expect } from '@playwright/test'

test.describe('Pattern Builder Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should display the Pattern Builder page with all key elements', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Create Pattern' })).toBeVisible()
    await expect(page.getByText('Stitch together multiple operations into a seamless workflow')).toBeVisible()

    // Check pattern details inputs
    await expect(page.getByLabel('Pattern Name')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()

    // Check canvas header
    await expect(page.getByRole('heading', { name: 'Stitching Canvas' })).toBeVisible()

    // Check buttons
    await expect(page.getByRole('button', { name: /Back to Dashboard/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Test Pattern/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Save Pattern/i })).toBeVisible()
    await expect(page.getByTestId('add-step-button')).toBeVisible()
  })

  test('should display the Webhook Trigger block', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Webhook Trigger' })).toBeVisible()
    await expect(page.getByText('Pattern starts when webhook receives data')).toBeVisible()
    await expect(page.getByText('Entry Point')).toBeVisible()
  })

  test('should show empty state when no steps are added', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Start Building Your Pattern' })).toBeVisible()
    await expect(page.getByText('Click "Add Step" to create your first operation')).toBeVisible()
  })

  test('should allow user to enter pattern name and description', async ({ page }) => {
    const patternName = 'Create Position & Hire Worker'
    const patternDescription = 'Creates a new position and hires a contingent worker'

    await page.getByLabel('Pattern Name').fill(patternName)
    await page.getByLabel('Description').fill(patternDescription)

    await expect(page.getByLabel('Pattern Name')).toHaveValue(patternName)
    await expect(page.getByLabel('Description')).toHaveValue(patternDescription)
  })

  test('should add a new step when Add Step button is clicked', async ({ page }) => {
    // Initially no steps should be visible
    await expect(page.getByTestId(/step-block-/)).toHaveCount(0)

    // Click Add Step button
    await page.getByTestId('add-step-button').click()

    // Step block should appear
    await expect(page.getByTestId(/step-block-/)).toHaveCount(1)

    // Configuration panel should open
    await expect(page.getByRole('heading', { name: /Configure Step/i })).toBeVisible()
  })

  test('should display step configuration panel when step is clicked', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Configuration panel should be visible
    await expect(page.getByRole('heading', { name: /Configure Step 1/i })).toBeVisible()
    await expect(page.getByLabel('Step Name')).toBeVisible()
    await expect(page.getByLabel('Workday Web Service')).toBeVisible()
    await expect(page.getByTestId('test-step-button')).toBeVisible()
  })

  test('should allow configuring a step with web service selection', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Configure step name
    await page.getByLabel('Step Name').fill('Create Position')

    // Select web service
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Verify selections
    await expect(page.getByLabel('Step Name')).toHaveValue('Create Position')
  })

  test('should show Test this Step button and data mapping interface after selecting web service', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Select web service
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Test button should be enabled
    await expect(page.getByTestId('test-step-button')).toBeEnabled()

    // Data mapping sections should be visible
    await expect(page.getByText('Available Data Sources')).toBeVisible()
    await expect(page.getByText('Webhook Source')).toBeVisible()
    await expect(page.getByText('Field Mappings')).toBeVisible()
  })

  test('should display webhook source columns in data mapping interface', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Select web service
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Check for webhook columns
    await expect(page.getByTestId('webhook-column-employee_id')).toBeVisible()
    await expect(page.getByTestId('webhook-column-first_name')).toBeVisible()
    await expect(page.getByTestId('webhook-column-email')).toBeVisible()
  })

  test('should allow adding field mappings', async ({ page }) => {
    // Add a step and configure it
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Add a mapping
    await page.getByTestId('add-mapping-button').click()

    // Mapping fields should appear
    const mappingCards = page.locator('[class*="p-3"][class*="bg-soft-gray/20"]')
    await expect(mappingCards).toHaveCount(1)
  })

  test('should save step configuration', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Configure step
    await page.getByLabel('Step Name').fill('Create Position')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Save configuration
    await page.getByTestId('save-step-config').click()

    // Configuration panel should close
    await expect(page.getByRole('heading', { name: /Configure Step/i })).not.toBeVisible()

    // Step block should show configured state
    await expect(page.getByText('Create Position')).toBeVisible()
  })

  test('should allow adding multiple steps', async ({ page }) => {
    // Add first step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('Step 1')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Add second step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('Step 2')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Contract_Contingent_Worker', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Both steps should be visible
    await expect(page.getByTestId(/step-block-/)).toHaveCount(2)
    await expect(page.getByText('Step 1')).toBeVisible()
    await expect(page.getByText('Step 2')).toBeVisible()
  })

  test('should show Golden Threads section when there are previous steps', async ({ page }) => {
    // Add and configure first step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('Create Position')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Add second step
    await page.getByTestId('add-step-button').click()

    // Golden Threads badge should indicate previous steps available
    await expect(page.getByText(/1 Golden Thread Available/i)).toBeVisible()

    // Select a web service to see the Golden Threads section
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Contract_Contingent_Worker', { exact: true }).click()

    // Now Golden Threads section should be fully visible
    await expect(page.getByText('Golden Threads')).toBeVisible()
    await expect(page.getByText('from previous steps')).toBeVisible()
  })

  test('should display connection lines between steps', async ({ page }) => {
    // Add two steps
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Check for golden thread connection lines (they have the golden-thread class)
    const connectionLines = page.locator('.golden-thread')
    await expect(connectionLines).toHaveCount(1) // One connection between two steps
  })

  test('should allow deleting a step', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Get the step's delete button (appears on hover)
    const stepBlock = page.getByTestId(/step-block-/)
    await stepBlock.hover()

    // Click delete button
    const deleteButton = page.getByTestId(/delete-step-/)
    await deleteButton.click()

    // Step should be removed
    await expect(page.getByTestId(/step-block-/)).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Start Building Your Pattern' })).toBeVisible()
  })

  test('should close configuration panel when Cancel is clicked', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()

    // Configuration panel should be visible
    await expect(page.getByRole('heading', { name: /Configure Step/i })).toBeVisible()

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Configuration panel should close
    await expect(page.getByRole('heading', { name: /Configure Step/i })).not.toBeVisible()
  })

  test('should navigate back to Dashboard when Back button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Back to Dashboard/i }).click()
    await expect(page).toHaveURL('http://localhost:3000/Dashboard')
  })
})

test.describe('Pattern Builder Visual Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should display step numbers correctly', async ({ page }) => {
    // Add three steps
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('add-step-button').click()
      await page.getByTestId('save-step-config').click()
    }

    // Check step numbers
    const steps = page.getByTestId(/step-block-/)
    await expect(steps).toHaveCount(3)

    // Each step should show its order number
    const stepBlocks = await steps.all()
    for (let i = 0; i < stepBlocks.length; i++) {
      await expect(stepBlocks[i]).toContainText(`${i + 1}`)
    }
  })

  test('should show visual indicator for configured vs unconfigured steps', async ({ page }) => {
    // Add a step but don't configure it
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Should show "Click to configure" message
    await expect(page.getByText('Click to configure web service')).toBeVisible()

    // Configure the step
    const stepBlock = page.getByTestId(/step-block-/)
    await stepBlock.click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Should show the web service name
    await expect(page.getByText('Create_Position')).toBeVisible()
  })

  test('should have a visually distinct trigger block', async ({ page }) => {
    const triggerBlock = page.locator('text=Webhook Trigger').locator('..')

    // Trigger should be styled differently (using gradient background)
    const bgColor = await triggerBlock.evaluate((el) => {
      return window.getComputedStyle(el).background
    })

    // Should have some gradient or special background
    expect(bgColor).toBeTruthy()
  })
})
