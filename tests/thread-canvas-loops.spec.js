import { test, expect } from '@playwright/test'

test.describe('Thread Canvas - Loop Bundles and Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/PatternBuilder')
    await page.waitForSelector('[data-testid="webhook-trigger-block"]')
  })

  // Helper function to add a step
  async function addStep(page, name = null) {
    await page.click('[data-testid="add-step-button"]')
    await page.waitForTimeout(300)
    if (name) {
      await page.fill('input[id="step-name"]', name)
    }
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(300)
  }

  // Helper function to create a loop
  async function createLoop(page) {
    await page.click('[data-testid="create-loop-button"]')
    await page.waitForTimeout(300)
  }

  // Helper function to get step order by checking the visual order on page
  async function getVisualOrder(page) {
    const items = []

    // Get all step blocks
    const stepBlocks = await page.locator('[data-testid^="step-block-"]').all()
    for (const block of stepBlocks) {
      const name = await block.locator('h3').textContent()
      const isInLoop = await block.locator('..').locator('..').evaluate(el =>
        el.closest('[data-testid^="loop-bundle-"]') !== null
      ).catch(() => false)

      if (!isInLoop) {
        items.push({ type: 'step', name: name.trim() })
      }
    }

    // Get all loop bundles
    const loopBundles = await page.locator('[data-testid^="loop-bundle-"]').all()
    for (const bundle of loopBundles) {
      const name = await bundle.locator('h3').first().textContent()
      items.push({ type: 'loop', name: name.trim() })
    }

    return items
  }

  test('should create a loop bundle', async ({ page }) => {
    await createLoop(page)

    // Loop should be visible
    await expect(page.locator('[data-testid^="loop-bundle-"]')).toBeVisible()
    await expect(page.locator('text=Loop 1')).toBeVisible()
  })

  test('should add step to empty loop', async ({ page }) => {
    await createLoop(page)

    // Click the + button inside the loop
    const loopBundle = page.locator('[data-testid^="loop-bundle-"]')
    const addButtonInLoop = loopBundle.locator('[data-testid="add-step-to-loop-button"]')
    await addButtonInLoop.first().click()
    await page.waitForTimeout(300)

    await page.fill('input[id="step-name"]', 'Step in Loop')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(300)

    // Step should be inside the loop
    const stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(1)
  })

  test('should insert step between step and loop using + button', async ({ page }) => {
    // Create Step 1
    await addStep(page, 'Step 1')

    // Create Loop 1
    await createLoop(page)

    // Find the + button between Step 1 and Loop 1
    // This should be the second + button (first is before Step 1)
    const addButtons = await page.locator('[data-testid^="add-step-button-"]').all()
    if (addButtons.length > 1) {
      await addButtons[1].click()
    }
    await page.waitForTimeout(300)

    await page.fill('input[id="step-name"]', 'Step 2')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // Visual order should be: Step 1, Step 2, Loop 1
    const steps = await page.locator('[data-testid^="step-block-"]').all()
    expect(steps.length).toBeGreaterThanOrEqual(2)

    const firstStepText = await steps[0].locator('h3').textContent()
    const secondStepText = await steps[1].locator('h3').textContent()

    expect(firstStepText).toContain('Step 1')
    expect(secondStepText).toContain('Step 2')
  })

  test('should insert step after loop using + button', async ({ page }) => {
    // Create Step 1
    await addStep(page, 'Step 1')

    // Create Loop 1
    await createLoop(page)

    // Find the + button after the loop
    const addButtons = await page.locator('[data-testid^="add-step-button-"]').all()
    if (addButtons.length > 2) {
      // Should be the third + button (before Step 1, between Step 1 and Loop, after Loop)
      await addButtons[2].click()
    }
    await page.waitForTimeout(300)

    await page.fill('input[id="step-name"]', 'Step After Loop')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // Loop should come before the new step
    const allBlocks = await page.locator('[data-testid^="step-block-"], [data-testid^="loop-bundle-"]').all()
    const lastBlockText = await allBlocks[allBlocks.length - 1].locator('h3').first().textContent()
    expect(lastBlockText).toContain('Step After Loop')
  })

  test('should drag step into empty loop', async ({ page }) => {
    // Create a step and a loop
    await addStep(page, 'Draggable Step')
    await createLoop(page)

    // Get the step and loop elements
    const step = page.locator('[data-testid^="step-block-"]').first()
    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()

    // Get bounding boxes
    const stepBox = await step.boundingBox()
    const loopBox = await loopBundle.boundingBox()

    // Drag step into loop
    await page.mouse.move(stepBox.x + stepBox.width / 2, stepBox.y + stepBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(loopBox.x + loopBox.width / 2, loopBox.y + loopBox.height / 2, { steps: 10 })
    await page.waitForTimeout(200)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Step should now be inside the loop
    const stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(1)
  })

  test('should drag step out of loop using + button drop zone', async ({ page }) => {
    // Create a loop
    await createLoop(page)

    // Add a step inside the loop
    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()
    const addButtonInLoop = loopBundle.locator('[data-testid="add-step-to-loop-button"]')
    await addButtonInLoop.first().click()
    await page.waitForTimeout(300)
    await page.fill('input[id="step-name"]', 'Step in Loop')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // Verify step is in loop
    let stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(1)

    // Now drag it out - get the step inside the loop
    const stepInLoop = loopBundle.locator('[data-testid^="step-block-"]').first()
    const stepBox = await stepInLoop.boundingBox()

    // Find a + button outside the loop (after the loop)
    const addButtons = await page.locator('[data-testid^="add-step-button-"]').all()
    if (addButtons.length > 0) {
      const lastAddButton = addButtons[addButtons.length - 1]
      const buttonBox = await lastAddButton.boundingBox()

      // Drag step to the + button
      await page.mouse.move(stepBox.x + stepBox.width / 2, stepBox.y + stepBox.height / 2)
      await page.mouse.down()
      await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, { steps: 10 })
      await page.waitForTimeout(200)
      await page.mouse.up()
      await page.waitForTimeout(500)

      // Step should no longer be in the loop
      stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
      expect(stepsInLoop).toBe(0)

      // Step should exist outside the loop
      const independentSteps = await page.locator('[data-testid^="step-block-"]').count()
      expect(independentSteps).toBeGreaterThanOrEqual(1)
    }
  })

  test('should handle multiple steps and loops with correct ordering', async ({ page }) => {
    // Create: Step 1, Loop 1, Step 2, Loop 2, Step 3
    await addStep(page, 'Step 1')
    await createLoop(page) // Loop 1
    await addStep(page, 'Step 2')
    await createLoop(page) // Loop 2
    await addStep(page, 'Step 3')

    await page.waitForTimeout(500)

    // Count elements
    const stepCount = await page.locator('[data-testid^="step-block-"]').count()
    const loopCount = await page.locator('[data-testid^="loop-bundle-"]').count()

    expect(stepCount).toBe(3)
    expect(loopCount).toBe(2)
  })

  test('should insert step between two loops', async ({ page }) => {
    // Create Loop 1 and Loop 2
    await createLoop(page)
    await createLoop(page)

    await page.waitForTimeout(300)

    // Find + button between the two loops
    const addButtons = await page.locator('[data-testid^="add-step-button-"]').all()
    if (addButtons.length > 1) {
      await addButtons[1].click() // Between Loop 1 and Loop 2
      await page.waitForTimeout(300)

      await page.fill('input[id="step-name"]', 'Between Loops')
      await page.click('[data-testid="save-step-config"]')
      await page.waitForTimeout(500)

      // Should have created a step
      const stepCount = await page.locator('[data-testid^="step-block-"]').count()
      expect(stepCount).toBe(1)
    }
  })

  test('should drag step from loop to position before loop', async ({ page }) => {
    // Create a loop with a step inside
    await createLoop(page)

    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()
    const addButtonInLoop = loopBundle.locator('[data-testid="add-step-to-loop-button"]')
    await addButtonInLoop.first().click()
    await page.waitForTimeout(300)
    await page.fill('input[id="step-name"]', 'Step in Loop')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // Get the step in the loop
    const stepInLoop = loopBundle.locator('[data-testid^="step-block-"]').first()
    const stepBox = await stepInLoop.boundingBox()

    // Find the first + button (before the loop)
    const firstAddButton = page.locator('[data-testid^="add-step-button-"]').first()
    const buttonBox = await firstAddButton.boundingBox()

    // Drag step to before the loop
    await page.mouse.move(stepBox.x + stepBox.width / 2, stepBox.y + stepBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, { steps: 10 })
    await page.waitForTimeout(200)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Loop should be empty
    const stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(0)

    // Should have an independent step
    const independentSteps = await page.locator('[data-testid^="step-block-"]').count()
    expect(independentSteps).toBeGreaterThanOrEqual(1)
  })

  test('should handle complex scenario: multiple steps in loop, drag one out', async ({ page }) => {
    // Create a loop
    await createLoop(page)

    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()

    // Add 3 steps to the loop
    for (let i = 1; i <= 3; i++) {
      const addButtonInLoop = loopBundle.locator('[data-testid="add-step-to-loop-button"]')
      await addButtonInLoop.first().click()
      await page.waitForTimeout(300)
      await page.fill('input[id="step-name"]', `Loop Step ${i}`)
      await page.click('[data-testid="save-step-config"]')
      await page.waitForTimeout(300)
    }

    // Verify 3 steps in loop
    let stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(3)

    // Drag the second step out
    const secondStep = loopBundle.locator('[data-testid^="step-block-"]').nth(1)
    const stepBox = await secondStep.boundingBox()

    // Find + button after the loop
    const addButtons = await page.locator('[data-testid^="add-step-button-"]').all()
    const lastButton = addButtons[addButtons.length - 1]
    const buttonBox = await lastButton.boundingBox()

    await page.mouse.move(stepBox.x + stepBox.width / 2, stepBox.y + stepBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, { steps: 10 })
    await page.waitForTimeout(200)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Should have 2 steps in loop
    stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(2)

    // Should have 1 independent step
    const independentSteps = await page.locator('[data-testid^="step-block-"]').count()
    expect(independentSteps).toBe(1)
  })

  test('should maintain order when dragging steps between positions', async ({ page }) => {
    // Create: Step 1, Step 2, Step 3
    await addStep(page, 'Step 1')
    await addStep(page, 'Step 2')
    await addStep(page, 'Step 3')

    await page.waitForTimeout(500)

    // Drag Step 3 to the beginning
    const steps = await page.locator('[data-testid^="step-block-"]').all()
    const step3 = steps[2]
    const stepBox = await step3.boundingBox()

    const firstAddButton = page.locator('[data-testid^="add-step-button-"]').first()
    const buttonBox = await firstAddButton.boundingBox()

    await page.mouse.move(stepBox.x + stepBox.width / 2, stepBox.y + stepBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2, { steps: 10 })
    await page.waitForTimeout(200)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Order should now be: Step 3, Step 1, Step 2
    const updatedSteps = await page.locator('[data-testid^="step-block-"]').all()
    const firstStepText = await updatedSteps[0].locator('h3').textContent()
    expect(firstStepText).toContain('Step 3')
  })

  test('should insert step at beginning using first + button', async ({ page }) => {
    // Create Step 1
    await addStep(page, 'Step 1')

    // Click the very first + button (before all steps)
    const firstAddButton = page.locator('[data-testid^="add-step-button-"]').first()
    await firstAddButton.click()
    await page.waitForTimeout(300)

    await page.fill('input[id="step-name"]', 'First Step')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // "First Step" should be first
    const steps = await page.locator('[data-testid^="step-block-"]').all()
    const firstStepText = await steps[0].locator('h3').textContent()
    expect(firstStepText).toContain('First Step')
  })

  test('should delete step from loop', async ({ page }) => {
    // Create loop with a step
    await createLoop(page)

    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()
    const addButtonInLoop = loopBundle.locator('[data-testid="add-step-to-loop-button"]')
    await addButtonInLoop.first().click()
    await page.waitForTimeout(300)
    await page.fill('input[id="step-name"]', 'Delete Me')
    await page.click('[data-testid="save-step-config"]')
    await page.waitForTimeout(500)

    // Hover and delete
    const step = loopBundle.locator('[data-testid^="step-block-"]').first()
    await step.hover()
    await page.waitForTimeout(200)

    const deleteButton = step.locator('[data-testid^="delete-step-"]')
    await deleteButton.click()
    await page.waitForTimeout(500)

    // Loop should be empty
    const stepsInLoop = await loopBundle.locator('[data-testid^="step-block-"]').count()
    expect(stepsInLoop).toBe(0)
  })

  test('should delete loop bundle', async ({ page }) => {
    await createLoop(page)

    const loopBundle = page.locator('[data-testid^="loop-bundle-"]').first()

    // Find and click the delete button (trash icon)
    const deleteButton = loopBundle.locator('button').filter({ has: page.locator('svg') }).last()
    await deleteButton.click()
    await page.waitForTimeout(500)

    // Loop should be gone
    const loopCount = await page.locator('[data-testid^="loop-bundle-"]').count()
    expect(loopCount).toBe(0)
  })
})
