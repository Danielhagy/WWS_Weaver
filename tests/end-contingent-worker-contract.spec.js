import { test, expect } from '@playwright/test';

test.describe('End Contingent Worker Contract Configuration', () => {

  test('endContingentWorkerContractFields.js should export valid configuration', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS, getRequiredFields, getFieldsByCategory, FIELD_STATS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    // Test: Array should exist and have elements
    expect(END_CONTINGENT_WORKER_CONTRACT_FIELDS).toBeDefined();
    expect(Array.isArray(END_CONTINGENT_WORKER_CONTRACT_FIELDS)).toBe(true);
    expect(END_CONTINGENT_WORKER_CONTRACT_FIELDS.length).toBe(14);

    console.log(`✓ Total fields: ${END_CONTINGENT_WORKER_CONTRACT_FIELDS.length}`);
  });

  test('should have exactly 3 required fields', async () => {
    const { getRequiredFields } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const requiredFields = getRequiredFields();

    expect(requiredFields.length).toBe(3);

    console.log(`✓ Required fields: ${requiredFields.length}`);
    requiredFields.forEach(f => {
      console.log(`  - ${f.name} (${f.type})`);
    });

    // Test: Required fields should be correct
    const requiredNames = requiredFields.map(f => f.name);
    expect(requiredNames).toContain('Contingent Worker ID');
    expect(requiredNames).toContain('Contract End Date');
    expect(requiredNames).toContain('Primary Reason ID');
  });

  test('should have exactly 11 optional fields', async () => {
    const { getOptionalFields } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const optionalFields = getOptionalFields();

    expect(optionalFields.length).toBe(11);

    console.log(`✓ Optional fields: ${optionalFields.length}`);
  });

  test('should have 3 categories', async () => {
    const { getFieldsByCategory } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const categories = getFieldsByCategory();
    const categoryNames = Object.keys(categories);

    expect(categoryNames.length).toBe(3);

    console.log(`✓ Categories: ${categoryNames.length}`);
    categoryNames.forEach(cat => {
      console.log(`  - ${cat}: ${categories[cat].length} fields`);
    });

    // Test: Should have expected categories
    expect(categoryNames).toContain('Basic Information');
    expect(categoryNames).toContain('Termination Details');
    expect(categoryNames).toContain('Process Options');
  });

  test('should have valid field structure for all fields', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    END_CONTINGENT_WORKER_CONTRACT_FIELDS.forEach((field) => {
      // Required properties
      expect(field.name).toBeDefined();
      expect(field.xmlPath).toBeDefined();
      expect(field.required).toBeDefined();
      expect(field.type).toBeDefined();
      expect(field.category).toBeDefined();
      expect(field.description).toBeDefined();
      expect(field.helpText).toBeDefined();
    });

    console.log(`✓ All ${END_CONTINGENT_WORKER_CONTRACT_FIELDS.length} fields have valid structure`);
  });

  test('should support text_with_type field type', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const textWithTypeFields = END_CONTINGENT_WORKER_CONTRACT_FIELDS.filter(f => f.type === 'text_with_type');

    expect(textWithTypeFields.length).toBeGreaterThan(0);

    console.log(`✓ text_with_type fields: ${textWithTypeFields.length}`);

    // Test: text_with_type fields should have typeOptions
    textWithTypeFields.forEach(field => {
      expect(field.typeOptions).toBeDefined();
      expect(Array.isArray(field.typeOptions)).toBe(true);
      expect(field.typeOptions.length).toBeGreaterThan(0);

      console.log(`  - ${field.name}: ${field.typeOptions.join(', ')}`);
    });
  });

  test('should have correct field types', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const fieldTypes = {};
    END_CONTINGENT_WORKER_CONTRACT_FIELDS.forEach(field => {
      fieldTypes[field.type] = (fieldTypes[field.type] || 0) + 1;
    });

    console.log('✓ Field type distribution:');
    Object.keys(fieldTypes).forEach(type => {
      console.log(`  - ${type}: ${fieldTypes[type]} fields`);
    });

    // Test: Should have expected field types
    expect(fieldTypes.text_with_type).toBeDefined();
    expect(fieldTypes.date).toBeDefined();
    expect(fieldTypes.boolean).toBeDefined();
    expect(fieldTypes.textarea).toBeDefined();
  });

  test('FIELD_STATS should match actual counts', async () => {
    const { FIELD_STATS, END_CONTINGENT_WORKER_CONTRACT_FIELDS, getRequiredFields, getOptionalFields, getFieldsByCategory } =
      await import('../src/config/endContingentWorkerContractFields.js');

    expect(FIELD_STATS.total).toBe(END_CONTINGENT_WORKER_CONTRACT_FIELDS.length);
    expect(FIELD_STATS.required).toBe(getRequiredFields().length);
    expect(FIELD_STATS.optional).toBe(getOptionalFields().length);
    expect(FIELD_STATS.categories).toBe(Object.keys(getFieldsByCategory()).length);

    console.log('✓ FIELD_STATS validation:');
    console.log(`  - Total: ${FIELD_STATS.total}`);
    console.log(`  - Required: ${FIELD_STATS.required}`);
    console.log(`  - Optional: ${FIELD_STATS.optional}`);
    console.log(`  - Categories: ${FIELD_STATS.categories}`);
  });

  test('workdayServices.js should include End Contingent Worker Contract service', async () => {
    const { WORKDAY_SERVICES } =
      await import('../src/config/workdayServices.js');

    // Test: Should have End Contingent Worker Contract service
    const endContractService = WORKDAY_SERVICES.find(s => s.value === 'end_contingent_worker_contract');
    expect(endContractService).toBeDefined();
    expect(endContractService.version).toBe('v45.0');
    expect(endContractService.fieldConfig).toBe('endContingentWorkerContractFields');
    expect(endContractService.operationName).toBe('End_Contingent_Worker_Contract');

    console.log('✓ Service registration validation:');
    console.log(`  - Service: ${endContractService.label}`);
    console.log(`  - Version: ${endContractService.version}`);
    console.log(`  - Operation: ${endContractService.operationName}`);
  });

  test('DYNAMIC_FUNCTIONS should include date helpers', async () => {
    const { DYNAMIC_FUNCTIONS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    expect(DYNAMIC_FUNCTIONS).toBeDefined();
    expect(Array.isArray(DYNAMIC_FUNCTIONS)).toBe(true);
    expect(DYNAMIC_FUNCTIONS.length).toBeGreaterThan(0);

    console.log(`✓ Dynamic functions: ${DYNAMIC_FUNCTIONS.length}`);

    // Test: Should have today function
    const todayFunc = DYNAMIC_FUNCTIONS.find(f => f.id === 'today');
    expect(todayFunc).toBeDefined();
    expect(typeof todayFunc.execute).toBe('function');

    // Test: Should have contract end date helpers
    const thirtyDays = DYNAMIC_FUNCTIONS.find(f => f.id === 'thirty_days_from_today');
    expect(thirtyDays).toBeDefined();

    const sixtyDays = DYNAMIC_FUNCTIONS.find(f => f.id === 'sixty_days_from_today');
    expect(sixtyDays).toBeDefined();

    const endOfMonth = DYNAMIC_FUNCTIONS.find(f => f.id === 'end_of_month');
    expect(endOfMonth).toBeDefined();

    console.log('  - today()');
    console.log('  - thirty_days_from_today()');
    console.log('  - sixty_days_from_today()');
    console.log('  - end_of_month()');
  });

  test('required fields should have proper XML paths', async () => {
    const { getRequiredFields } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const requiredFields = getRequiredFields();

    // Test: Contingent Worker ID
    const workerField = requiredFields.find(f => f.name === 'Contingent Worker ID');
    expect(workerField.xmlPath).toBe('End_Contingent_Worker_Contract_Data.Contingent_Worker_Reference.ID');

    // Test: Contract End Date
    const dateField = requiredFields.find(f => f.name === 'Contract End Date');
    expect(dateField.xmlPath).toBe('End_Contingent_Worker_Contract_Data.Contract_End_Date');

    // Test: Primary Reason
    const reasonField = requiredFields.find(f => f.name === 'Primary Reason ID');
    expect(reasonField.xmlPath).toBe('End_Contingent_Worker_Contract_Data.End_Contract_Event_Data.Primary_Reason_Reference.ID');

    console.log('✓ Required fields have correct XML paths');
  });

  test('boolean fields should have defaultValue', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const booleanFields = END_CONTINGENT_WORKER_CONTRACT_FIELDS.filter(f => f.type === 'boolean');

    expect(booleanFields.length).toBeGreaterThan(0);

    console.log(`✓ Boolean fields: ${booleanFields.length}`);

    // Test: All boolean fields should have defaultValue
    booleanFields.forEach(field => {
      expect(field.defaultValue).toBeDefined();
      expect(typeof field.defaultValue).toBe('boolean');

      console.log(`  - ${field.name}: default = ${field.defaultValue}`);
    });
  });

  test('date fields should have proper validation hints', async () => {
    const { END_CONTINGENT_WORKER_CONTRACT_FIELDS } =
      await import('../src/config/endContingentWorkerContractFields.js');

    const dateFields = END_CONTINGENT_WORKER_CONTRACT_FIELDS.filter(f => f.type === 'date');

    expect(dateFields.length).toBeGreaterThan(0);

    console.log(`✓ Date fields: ${dateFields.length}`);

    // Test: Date fields should mention format in helpText
    dateFields.forEach(field => {
      expect(field.helpText.toLowerCase()).toContain('yyyy-mm-dd');

      console.log(`  - ${field.name}`);
    });
  });
});
