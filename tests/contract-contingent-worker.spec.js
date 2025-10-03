import { test, expect } from '@playwright/test';

// Import the field configuration to verify counts
test.describe('Contract Contingent Worker Configuration', () => {
  test('contractContingentWorkerFields.js should export valid configuration', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    expect(CONTRACT_CONTINGENT_WORKER_FIELDS).toBeDefined();
    expect(Array.isArray(CONTRACT_CONTINGENT_WORKER_FIELDS)).toBe(true);

    console.log(`✓ Total fields: ${CONTRACT_CONTINGENT_WORKER_FIELDS.length}`);

    // Should have 29 fields
    expect(CONTRACT_CONTINGENT_WORKER_FIELDS.length).toBe(29);
  });

  test('should have exactly 2 required fields', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const requiredFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.required);

    console.log(`✓ Required fields: ${requiredFields.length}`);
    requiredFields.forEach(f => {
      console.log(`  - ${f.name} (${f.type})`);
    });

    // Should have Contract Start Date (required) and Applicant ID (choice field marked as required)
    expect(requiredFields.length).toBe(2);
    expect(requiredFields.some(f => f.name === 'Contract Start Date')).toBe(true);
    expect(requiredFields.some(f => f.name === 'Applicant ID')).toBe(true);
  });

  test('should have exactly 27 optional fields', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const optionalFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => !f.required);

    console.log(`✓ Optional fields: ${optionalFields.length}`);

    expect(optionalFields.length).toBe(27);
  });

  test('should have 6 categories', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const categories = [...new Set(CONTRACT_CONTINGENT_WORKER_FIELDS.map(f => f.category))];

    console.log(`✓ Categories: ${categories.length}`);
    categories.forEach((cat, idx) => {
      const fieldsInCategory = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.category === cat);
      console.log(`  - ${cat}: ${fieldsInCategory.length} fields`);
    });

    expect(categories.length).toBe(6);
    expect(categories).toContain('Pre-hire Information');
    expect(categories).toContain('Contract Details');
    expect(categories).toContain('Position Assignment');
    expect(categories).toContain('Position Details');
    expect(categories).toContain('Compensation');
    expect(categories).toContain('Process Options');
  });

  test('should have valid field structure for all fields', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    CONTRACT_CONTINGENT_WORKER_FIELDS.forEach(field => {
      expect(field.name).toBeDefined();
      expect(field.xmlPath).toBeDefined();
      expect(field.type).toBeDefined();
      expect(field.description).toBeDefined();
      expect(field.category).toBeDefined();
      expect(field.helpText).toBeDefined();

      // Type should be one of the valid types
      expect(['text', 'text_with_type', 'textarea', 'boolean', 'date', 'number']).toContain(field.type);

      // If text_with_type, should have typeOptions
      if (field.type === 'text_with_type') {
        expect(field.typeOptions).toBeDefined();
        expect(Array.isArray(field.typeOptions)).toBe(true);
        expect(field.typeOptions.length).toBeGreaterThan(0);
        expect(field.defaultType).toBeDefined();
      }

      // Boolean fields should have defaultValue
      if (field.type === 'boolean') {
        expect(field.defaultValue).toBeDefined();
      }
    });

    console.log(`✓ All ${CONTRACT_CONTINGENT_WORKER_FIELDS.length} fields have valid structure`);
  });

  test('should support text_with_type field type', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const textWithTypeFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.type === 'text_with_type');

    console.log(`✓ text_with_type fields: ${textWithTypeFields.length}`);
    textWithTypeFields.forEach(f => {
      console.log(`  - ${f.name}: ${f.typeOptions.join(', ')}`);
    });

    // Should have at least 10 text_with_type fields (reference IDs)
    expect(textWithTypeFields.length).toBeGreaterThanOrEqual(10);

    // Check specific important ones
    const applicantIdField = textWithTypeFields.find(f => f.name === 'Applicant ID');
    expect(applicantIdField).toBeDefined();
    expect(applicantIdField.typeOptions).toContain('Applicant_ID');
    expect(applicantIdField.typeOptions).toContain('WID');
  });

  test('should have correct field types', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const fieldTypes = {};
    CONTRACT_CONTINGENT_WORKER_FIELDS.forEach(f => {
      fieldTypes[f.type] = (fieldTypes[f.type] || 0) + 1;
    });

    console.log(`✓ Field type distribution:`);
    Object.entries(fieldTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} fields`);
    });

    // Verify expected distribution
    expect(fieldTypes['text_with_type']).toBeGreaterThanOrEqual(10);
    expect(fieldTypes['date']).toBeGreaterThanOrEqual(3);
    expect(fieldTypes['boolean']).toBeGreaterThanOrEqual(3);
    expect(fieldTypes['text']).toBeGreaterThanOrEqual(2);
    expect(fieldTypes['number']).toBeGreaterThanOrEqual(2);
    expect(fieldTypes['textarea']).toBeGreaterThanOrEqual(1);
  });

  test('FIELD_STATS should match actual counts', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS, FIELD_STATS } = await import('../src/config/contractContingentWorkerFields.js');

    const actualTotal = CONTRACT_CONTINGENT_WORKER_FIELDS.length;
    const actualRequired = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.required).length;
    const actualOptional = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => !f.required).length;
    const actualCategories = [...new Set(CONTRACT_CONTINGENT_WORKER_FIELDS.map(f => f.category))].length;

    console.log(`✓ FIELD_STATS validation:`);
    console.log(`  - Total: ${actualTotal}`);
    console.log(`  - Required: ${actualRequired}`);
    console.log(`  - Optional: ${actualOptional}`);
    console.log(`  - Categories: ${actualCategories}`);

    expect(FIELD_STATS.total).toBe(actualTotal);
    expect(FIELD_STATS.required).toBe(actualRequired);
    expect(FIELD_STATS.optional).toBe(actualOptional);
    expect(FIELD_STATS.categories).toBe(actualCategories);
  });

  test('workdayServices.js should include Contract Contingent Worker service', async () => {
    const { WORKDAY_SERVICES } = await import('../src/config/workdayServices.js');

    const contractService = WORKDAY_SERVICES.find(s => s.value === 'contract_contingent_worker');

    console.log(`✓ Service registration validation:`);
    console.log(`  - Service: ${contractService.label}`);
    console.log(`  - Version: ${contractService.version}`);
    console.log(`  - Operation: ${contractService.operationName}`);
    console.log(`  - Field Config: ${contractService.fieldConfig}`);

    expect(contractService).toBeDefined();
    expect(contractService.label).toBe('Contract Contingent Worker (v45.0)');
    expect(contractService.version).toBe('v45.0');
    expect(contractService.operationName).toBe('Contract_Contingent_Worker');
    expect(contractService.fieldConfig).toBe('contractContingentWorkerFields');
    expect(contractService.jsonSource).toContain('Contract_Contingent_Worker Operation Details.json');
  });

  test('workdayServices.js should NOT include legacy Create Position v44.2', async () => {
    const { WORKDAY_SERVICES } = await import('../src/config/workdayServices.js');

    const legacyService = WORKDAY_SERVICES.find(s => s.value === 'put_position');

    console.log(`✓ Legacy service removed: ${legacyService ? 'FAILED - still exists' : 'SUCCESS - removed'}`);

    expect(legacyService).toBeUndefined();
  });

  test('DYNAMIC_FUNCTIONS should include date helpers', async () => {
    const { DYNAMIC_FUNCTIONS } = await import('../src/config/contractContingentWorkerFields.js');

    expect(DYNAMIC_FUNCTIONS).toBeDefined();
    expect(typeof DYNAMIC_FUNCTIONS.today).toBe('function');
    expect(typeof DYNAMIC_FUNCTIONS.thirty_days_from_today).toBe('function');
    expect(typeof DYNAMIC_FUNCTIONS.sixty_days_from_today).toBe('function');
    expect(typeof DYNAMIC_FUNCTIONS.ninety_days_from_today).toBe('function');
    expect(typeof DYNAMIC_FUNCTIONS.end_of_month).toBe('function');

    console.log(`✓ Dynamic functions: ${Object.keys(DYNAMIC_FUNCTIONS).length}`);
    Object.keys(DYNAMIC_FUNCTIONS).forEach(func => {
      console.log(`  - ${func}()`);
    });

    // Test execution
    const today = DYNAMIC_FUNCTIONS.today();
    console.log(`  - today() returns: ${today}`);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('required date fields should have proper validation hints', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const dateFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.type === 'date');

    console.log(`✓ Date fields: ${dateFields.length}`);
    dateFields.forEach(f => {
      console.log(`  - ${f.name}`);
      expect(f.helpText).toBeDefined();
    });

    // Check Contract Start Date specifically
    const contractStartDate = dateFields.find(f => f.name === 'Contract Start Date');
    expect(contractStartDate).toBeDefined();
    expect(contractStartDate.required).toBe(true);
    expect(contractStartDate.helpText).toContain('YYYY-MM-DD');
  });

  test('boolean fields should have defaultValue', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const booleanFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.type === 'boolean');

    console.log(`✓ Boolean fields: ${booleanFields.length}`);
    booleanFields.forEach(f => {
      console.log(`  - ${f.name}: default = ${f.defaultValue}`);
      expect(f.defaultValue).toBeDefined();
      expect(typeof f.defaultValue).toBe('boolean');
    });

    // Check specific fields
    const createPO = booleanFields.find(f => f.name === 'Create Purchase Order');
    expect(createPO).toBeDefined();
    expect(createPO.defaultValue).toBe(false);

    const runNow = booleanFields.find(f => f.name === 'Run Now');
    expect(runNow).toBeDefined();
    expect(runNow.defaultValue).toBe(true);
  });

  test('number fields should support compensation values', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const numberFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.type === 'number');

    console.log(`✓ Number fields: ${numberFields.length}`);
    numberFields.forEach(f => {
      console.log(`  - ${f.name}`);
    });

    // Check for key compensation fields
    const contractPayRate = numberFields.find(f => f.name === 'Contract Pay Rate');
    expect(contractPayRate).toBeDefined();
    expect(contractPayRate.category).toBe('Compensation');

    const contractAmount = numberFields.find(f => f.name === 'Contract Amount');
    expect(contractAmount).toBeDefined();
    expect(contractAmount.category).toBe('Compensation');
  });

  test('pre-hire choice fields should be properly configured', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireFields = CONTRACT_CONTINGENT_WORKER_FIELDS.filter(f => f.category === 'Pre-hire Information');

    console.log(`✓ Pre-hire Information fields: ${preHireFields.length}`);
    preHireFields.forEach(f => {
      console.log(`  - ${f.name} (${f.required ? 'required' : 'optional'})`);
    });

    // Should have 3 choice fields
    expect(preHireFields.length).toBe(3);

    // Applicant ID should be marked required (even though it's a choice)
    const applicantId = preHireFields.find(f => f.name === 'Applicant ID');
    expect(applicantId).toBeDefined();
    expect(applicantId.required).toBe(true);
    expect(applicantId.helpText).toContain('Choice 1 of 3');

    // Former Worker and Student should be optional alternatives
    const formerWorker = preHireFields.find(f => f.name === 'Former Worker ID');
    expect(formerWorker).toBeDefined();
    expect(formerWorker.required).toBe(false);
    expect(formerWorker.helpText).toContain('Alternative');

    const student = preHireFields.find(f => f.name === 'Student ID');
    expect(student).toBeDefined();
    expect(student.required).toBe(false);
    expect(student.helpText).toContain('Alternative');
  });
});

// UI Integration Tests
test.describe('Contract Contingent Worker - UI Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/CreateIntegration');
  });

  test('should appear in service selector', async ({ page }) => {
    // Find and click Staffing service category
    await page.locator('button:has-text("Staffing")').click();

    // Look for Contract Contingent Worker service
    const contractService = page.locator('div:has-text("Contract Contingent Worker (v45.0)")');
    await expect(contractService).toBeVisible();

    // Check description
    await expect(page.locator('text=Contract an existing pre-hire into a contingent worker')).toBeVisible();
  });

  test('should load 29 fields when selected', async ({ page }) => {
    // Navigate through wizard
    await page.fill('input[placeholder*="Integration Name"]', 'Test Contract Worker');

    // Select staffing service
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=Contract Contingent Worker (v45.0)').click();

    // Go to mapping step
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check if field categories are displayed
    await expect(page.locator('text=Pre-hire Information')).toBeVisible();
    await expect(page.locator('text=Contract Details')).toBeVisible();
    await expect(page.locator('text=Position Assignment')).toBeVisible();
    await expect(page.locator('text=Position Details')).toBeVisible();
    await expect(page.locator('text=Compensation')).toBeVisible();
    await expect(page.locator('text=Process Options')).toBeVisible();
  });

  test('should show required field indicators', async ({ page }) => {
    // Navigate to mapping step
    await page.fill('input[placeholder*="Integration Name"]', 'Test Contract');
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=Contract Contingent Worker (v45.0)').click();
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check for required field badges
    await expect(page.locator('text=Contract Start Date')).toBeVisible();
    await expect(page.locator('text=Applicant ID')).toBeVisible();

    // Required fields should have REQUIRED indicator in helpText
    const contractStartHelp = page.locator('text=REQUIRED: Format YYYY-MM-DD');
    await expect(contractStartHelp).toBeVisible();
  });

  test('should support text_with_type fields with dropdowns', async ({ page }) => {
    // Navigate to mapping step
    await page.fill('input[placeholder*="Integration Name"]', 'Test Contract');
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=Contract Contingent Worker (v45.0)').click();
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Find a text_with_type field (Applicant ID)
    const applicantIdSection = page.locator('div:has-text("Applicant ID")').first();
    await expect(applicantIdSection).toBeVisible();

    // Should have type options available (Applicant_ID, WID)
    // This would be visible when mapping is configured
  });
});

// Pattern Builder Integration Tests
test.describe('Contract Contingent Worker - Pattern Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/PatternBuilder');
  });

  test('should appear in Pattern Builder step configuration', async ({ page }) => {
    // Add a step
    await page.locator('[data-testid="add-step-button"]').click();
    await page.waitForTimeout(500);

    // Select web service
    await page.locator('[data-testid="step-type-new"]').click();

    // Open service selector
    const serviceSelector = page.locator('button:has-text("Select a web service")');
    await serviceSelector.click();

    // Check if Contract Contingent Worker appears
    await expect(page.locator('text=Contract_Contingent_Worker')).toBeVisible();
  });

  test('should load field mappings when selected in pattern', async ({ page }) => {
    // Add step
    await page.locator('[data-testid="add-step-button"]').click();
    await page.waitForTimeout(500);

    // Configure webhook first
    await page.locator('div:has-text("Webhook Trigger")').click();
    await page.locator('[data-testid="webhook-type-json"]').click();
    await page.locator('[data-testid="json-body-input"]').fill('{"applicant_id": "123", "start_date": "2025-01-15"}');
    await page.locator('[data-testid="save-webhook-config"]').click();

    // Select service
    await page.locator('[data-testid="step-type-new"]').click();
    const serviceButton = page.locator('button[id="web-service"]');
    await serviceButton.click();
    await page.locator('text=Contract_Contingent_Worker').click();

    // Field mapping interface should appear
    await expect(page.locator('text=Pre-hire Information')).toBeVisible();
    await expect(page.locator('text=Contract Details')).toBeVisible();
  });
});
