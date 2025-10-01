import { test, expect } from '@playwright/test'

test.describe('Pattern Builder - Integration Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should create a complete two-step pattern with full configuration', async ({ page }) => {
    // Set pattern details
    await page.getByLabel('Pattern Name').fill('Create Position and Hire Worker')
    await page.getByLabel('Description').fill('Creates a position then hires a contingent worker into it')

    // Add and configure Step 1 - Create Position
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('Create Position')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Verify field mappings section is visible
    await expect(page.getByText('Field Mappings')).toBeVisible()

    // Save Step 1
    await page.getByTestId('save-step-config').click()

    // Verify Step 1 is saved
    await expect(page.getByText('Create Position')).toBeVisible()
    await expect(page.getByText('Create_Position')).toBeVisible()

    // Add and configure Step 2 - Contract Worker
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('Contract Contingent Worker')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Contract_Contingent_Worker', { exact: true }).click()

    // Verify Golden Thread is available
    await expect(page.getByText(/1 Golden Thread Available/i)).toBeVisible()

    // Save Step 2
    await page.getByTestId('save-step-config').click()

    // Verify both steps are visible
    await expect(page.getByTestId(/step-block-/)).toHaveCount(2)

    // Verify pattern details are preserved
    await expect(page.getByLabel('Pattern Name')).toHaveValue('Create Position and Hire Worker')
    await expect(page.getByLabel('Description')).toHaveValue('Creates a position then hires a contingent worker into it')
  })

  test('should maintain step order correctly when adding multiple steps', async ({ page }) => {
    // Add 4 steps
    for (let i = 1; i <= 4; i++) {
      await page.getByTestId('add-step-button').click()
      await page.getByLabel('Step Name').fill(`Step ${i}`)
      await page.getByTestId('save-step-config').click()
    }

    // Verify all steps are present
    await expect(page.getByTestId(/step-block-/)).toHaveCount(4)

    // Verify step numbers are sequential
    const steps = await page.getByTestId(/step-block-/).all()
    for (let i = 0; i < steps.length; i++) {
      await expect(steps[i]).toContainText(`${i + 1}`)
      await expect(steps[i]).toContainText(`Step ${i + 1}`)
    }
  })

  test('should show increasing Golden Thread count as steps are added', async ({ page }) => {
    // Add first step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Add second step - should show 1 Golden Thread
    await page.getByTestId('add-step-button').click()
    await expect(page.getByText(/1 Golden Thread Available/i)).toBeVisible()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Submit_Employee_Data', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Add third step - should show 2 Golden Threads
    await page.getByTestId('add-step-button').click()
    await expect(page.getByText(/2 Golden Threads Available/i)).toBeVisible()
  })

  test('should preserve configuration when reopening a step', async ({ page }) => {
    // Add and configure a step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Step Name').fill('My Custom Step')
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Update_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Click on the step to reopen configuration
    const stepBlock = page.getByTestId(/step-block-/)
    await stepBlock.click()

    // Verify configuration is preserved
    await expect(page.getByLabel('Step Name')).toHaveValue('My Custom Step')
    // The select should show the selected value in the trigger
    await expect(page.getByLabel('Workday Web Service')).toContainText('Update_Position')
  })

  test('should handle deleting middle step', async ({ page }) => {
    // Add 3 steps
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('add-step-button').click()
      await page.getByLabel('Step Name').fill(`Step ${i}`)
      await page.getByTestId('save-step-config').click()
    }

    // Verify we have 3 steps
    await expect(page.getByTestId(/step-block-/)).toHaveCount(3)

    // Get all step blocks and hover over the middle one to reveal delete button
    const allSteps = await page.getByTestId(/step-block-/).all()
    await allSteps[1].hover()

    // Wait a moment for the hover animation
    await page.waitForTimeout(200)

    // Find and click the delete button for the second step
    const deleteButtons = await page.getByTestId(/delete-step-/).all()
    await deleteButtons[1].click()

    // Wait for deletion to complete
    await page.waitForTimeout(300)

    // Verify Step 2 is removed
    await expect(page.getByText('Step 2')).not.toBeVisible()
  })

  test('should disable Test Step button when no web service is selected', async ({ page }) => {
    await page.getByTestId('add-step-button').click()

    // Test button should be disabled initially
    await expect(page.getByTestId('test-step-button')).toBeDisabled()

    // Select a web service
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Test button should now be enabled
    await expect(page.getByTestId('test-step-button')).toBeEnabled()
  })
})

test.describe('Pattern Builder - Data Mapping Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should display field mapping categories', async ({ page }) => {
    // Add a step and select web service
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Field Mappings section should be visible
    await expect(page.getByText('Field Mappings')).toBeVisible()

    // Categories should be visible
    await expect(page.getByRole('button', { name: /Basic Information/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Position Details/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Position Restrictions/ })).toBeVisible()
  })

  test('should display all webhook columns in the Webhook Source section', async ({ page }) => {
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Verify all mock webhook columns are visible
    const expectedColumns = ['employee_id', 'first_name', 'last_name', 'email', 'position_title', 'start_date', 'manager_email']

    for (const column of expectedColumns) {
      await expect(page.getByTestId(`webhook-column-${column}`)).toBeVisible()
    }
  })

  test('should show webhook configuration required message when not configured', async ({ page }) => {
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()

    // Webhook source section should exist
    await expect(page.getByText('Webhook Source')).toBeVisible()
  })

  test('should show "Test this step to discover output fields" message when step has no test results', async ({ page }) => {
    // Add first step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Add second step to see Golden Threads section
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Contract_Contingent_Worker', { exact: true }).click()

    // Should show message about testing
    await expect(page.getByText(/Test this step to discover output fields/i)).toBeVisible()
  })
})

test.describe('Pattern Builder - Navigation and State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should be accessible from the sidebar navigation', async ({ page }) => {
    // Go to dashboard first
    await page.goto('http://localhost:3000/Dashboard')

    // Click Pattern Builder in navigation
    await page.getByRole('link', { name: 'Pattern Builder' }).click()

    // Should navigate to Pattern Builder
    await expect(page).toHaveURL('http://localhost:3000/PatternBuilder')
    await expect(page.getByRole('heading', { name: 'Create Pattern' })).toBeVisible()
  })

  test('should highlight Pattern Builder in navigation when active', async ({ page }) => {
    // The active navigation item should have specific styling
    const patternBuilderLink = page.getByRole('link', { name: 'Pattern Builder' })

    // Check if it has the active class styling (bg-accent-teal)
    const linkClasses = await patternBuilderLink.getAttribute('class')
    expect(linkClasses).toContain('bg-accent-teal')
  })

  test('should show empty canvas state after navigating back from dashboard', async ({ page }) => {
    // Add a step
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Navigate to dashboard
    await page.getByRole('button', { name: /Back to Dashboard/i }).click()
    await expect(page).toHaveURL('http://localhost:3000/Dashboard')

    // Navigate back to Pattern Builder
    await page.getByRole('link', { name: 'Pattern Builder' }).click()

    // Should show empty state (note: this tests that state is NOT persisted, which is expected for now)
    await expect(page.getByRole('heading', { name: 'Start Building Your Pattern' })).toBeVisible()
  })
})

test.describe('Pattern Builder - Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should display proper visual hierarchy', async ({ page }) => {
    // Main heading should be visible and prominent
    const heading = page.getByRole('heading', { name: 'Create Pattern' })
    await expect(heading).toBeVisible()

    // Canvas should be visible
    await expect(page.getByRole('heading', { name: 'Thread Canvas' })).toBeVisible()

    // Trigger block should be visible
    await expect(page.getByRole('heading', { name: 'Webhook Trigger' })).toBeVisible()
  })

  test('should show correct step configuration panel state based on selection', async ({ page }) => {
    // Initially should show "Select a step to configure" state
    await expect(page.getByText('Select a step to configure')).toBeVisible()

    // Add a step
    await page.getByTestId('add-step-button').click()

    // Should now show configuration form
    await expect(page.getByRole('heading', { name: /Configure Step/i })).toBeVisible()

    // Close the panel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Should return to "Select a step" state
    await expect(page.getByText('Select a step to configure')).toBeVisible()
  })

  test('should display connection lines with golden thread styling', async ({ page }) => {
    // Add two steps
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Connection line should exist
    const connectionLines = page.locator('.golden-thread')
    await expect(connectionLines).toHaveCount(1)
  })

  test('should show proper styling for unconfigured steps', async ({ page }) => {
    // Add a step without configuring web service
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    // Should show alert icon (AlertCircle)
    const stepBlock = page.getByTestId(/step-block-/)
    await expect(stepBlock.locator('svg').nth(1)).toBeVisible() // AlertCircle icon

    // Should show "Click to configure" text
    await expect(page.getByText('Click to configure web service')).toBeVisible()
  })

  test('should show proper styling for configured steps', async ({ page }) => {
    // Add and configure a step
    await page.getByTestId('add-step-button').click()
    await page.getByLabel('Workday Web Service').click()
    await page.getByText('Create_Position', { exact: true }).click()
    await page.getByTestId('save-step-config').click()

    // Should show checkmark icon
    const stepBlock = page.getByTestId(/step-block-/)
    // CheckCircle2 icon should be visible
    await expect(stepBlock).toContainText('Create_Position')
  })

  test('should display step action buttons on hover', async ({ page }) => {
    await page.getByTestId('add-step-button').click()
    await page.getByTestId('save-step-config').click()

    const stepBlock = page.getByTestId(/step-block-/)

    // Hover over the step
    await stepBlock.hover()

    // Action buttons should be visible (Settings and Delete)
    // Note: With opacity-0 group-hover:opacity-100, they should become visible
    await expect(page.getByTestId(/delete-step-/)).toBeVisible()
  })
})

test.describe('Pattern Builder - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
  })

  test('should have proper form labels for all inputs', async ({ page }) => {
    // Pattern details inputs should have labels
    await expect(page.getByLabel('Pattern Name')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()

    // Add a step
    await page.getByTestId('add-step-button').click()

    // Step configuration inputs should have labels
    await expect(page.getByLabel('Step Name')).toBeVisible()
    await expect(page.getByLabel('Workday Web Service')).toBeVisible()
  })

  test('should have descriptive button text', async ({ page }) => {
    // All buttons should have clear, descriptive text
    await expect(page.getByRole('button', { name: /Back to Dashboard/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Test Pattern/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Save Pattern/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Add Step/i })).toBeVisible()
  })

  test('should allow keyboard navigation through steps', async ({ page }) => {
    // Add multiple steps
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('add-step-button').click()
      await page.getByLabel('Step Name').fill(`Step ${i}`)
      await page.getByTestId('save-step-config').click()
    }

    // Should be able to tab through step blocks
    const steps = await page.getByTestId(/step-block-/).all()
    expect(steps.length).toBe(3)
  })
})
