import { test, expect } from '@playwright/test';

test.describe('Field Configuration Validation', () => {

  test('createPositionFields.js should export valid configuration', async () => {
    // Import the field configuration
    const { CREATE_POSITION_FIELDS, getRequiredFields, getFieldsByCategory, FIELD_STATS } =
      await import('../src/config/createPositionFields.js');

    // Test: Array should exist and have elements
    expect(CREATE_POSITION_FIELDS).toBeDefined();
    expect(Array.isArray(CREATE_POSITION_FIELDS)).toBe(true);
    expect(CREATE_POSITION_FIELDS.length).toBeGreaterThan(0);

    console.log(`✓ Total fields: ${CREATE_POSITION_FIELDS.length}`);

    // Test: Should have 23 curated fields (carefully selected from v45.0 schema)
    expect(CREATE_POSITION_FIELDS.length).toBe(23);
  });

  test('should have exactly 1 required field', async () => {
    const { getRequiredFields, CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const requiredFields = getRequiredFields();

    expect(requiredFields).toBeDefined();
    expect(Array.isArray(requiredFields)).toBe(true);
    expect(requiredFields.length).toBe(1);

    console.log(`✓ Required fields: ${requiredFields.length}`);
    console.log(`  - ${requiredFields[0].name}`);

    // Test: Required field should be Supervisory Organization ID
    expect(requiredFields[0].name).toBe('Supervisory Organization ID');
    expect(requiredFields[0].required).toBe(true);
    expect(requiredFields[0].xmlPath).toBe('Create_Position_Data.Supervisory_Organization_Reference.ID');
  });

  test('should have exactly 22 optional fields', async () => {
    const { getOptionalFields } =
      await import('../src/config/createPositionFields.js');

    const optionalFields = getOptionalFields();

    expect(optionalFields).toBeDefined();
    expect(Array.isArray(optionalFields)).toBe(true);
    expect(optionalFields.length).toBe(22);

    console.log(`✓ Optional fields: ${optionalFields.length}`);
  });

  test('should have 5 categories', async () => {
    const { getFieldsByCategory } =
      await import('../src/config/createPositionFields.js');

    const categories = getFieldsByCategory();

    expect(categories).toBeDefined();
    expect(typeof categories).toBe('object');

    const categoryNames = Object.keys(categories);
    expect(categoryNames.length).toBe(5);

    console.log(`✓ Categories: ${categoryNames.length}`);
    categoryNames.forEach(cat => {
      console.log(`  - ${cat}: ${categories[cat].length} fields`);
    });

    // Test: Should have expected categories
    expect(categoryNames).toContain('Basic Information');
    expect(categoryNames).toContain('Position Details');
    expect(categoryNames).toContain('Position Restrictions');
    expect(categoryNames).toContain('Request Information');
    expect(categoryNames).toContain('Process Options');
  });

  test('should have valid field structure for all fields', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    CREATE_POSITION_FIELDS.forEach((field, index) => {
      // Required properties
      expect(field.name).toBeDefined();
      expect(typeof field.name).toBe('string');
      expect(field.name.length).toBeGreaterThan(0);

      expect(field.xmlPath).toBeDefined();
      expect(typeof field.xmlPath).toBe('string');
      expect(field.xmlPath.length).toBeGreaterThan(0);

      expect(field.required).toBeDefined();
      expect(typeof field.required).toBe('boolean');

      expect(field.type).toBeDefined();
      expect(typeof field.type).toBe('string');

      expect(field.category).toBeDefined();
      expect(typeof field.category).toBe('string');

      expect(field.description).toBeDefined();
      expect(typeof field.description).toBe('string');

      expect(field.helpText).toBeDefined();
      expect(typeof field.helpText).toBe('string');
    });

    console.log(`✓ All ${CREATE_POSITION_FIELDS.length} fields have valid structure`);
  });

  test('should support text_with_type field type', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const textWithTypeFields = CREATE_POSITION_FIELDS.filter(f => f.type === 'text_with_type');

    expect(textWithTypeFields.length).toBeGreaterThan(0);

    console.log(`✓ text_with_type fields: ${textWithTypeFields.length}`);

    // Test: text_with_type fields should have typeOptions
    textWithTypeFields.forEach(field => {
      expect(field.typeOptions).toBeDefined();
      expect(Array.isArray(field.typeOptions)).toBe(true);
      expect(field.typeOptions.length).toBeGreaterThan(0);
      expect(field.defaultType).toBeDefined();

      console.log(`  - ${field.name}: ${field.typeOptions.join(', ')}`);
    });
  });

  test('should have correct field types', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const fieldTypes = {};
    CREATE_POSITION_FIELDS.forEach(field => {
      fieldTypes[field.type] = (fieldTypes[field.type] || 0) + 1;
    });

    console.log('✓ Field type distribution:');
    Object.keys(fieldTypes).forEach(type => {
      console.log(`  - ${type}: ${fieldTypes[type]} fields`);
    });

    // Test: Should have expected field types
    expect(fieldTypes.text_with_type).toBeDefined();
    expect(fieldTypes.text).toBeDefined();
    expect(fieldTypes.textarea).toBeDefined();
    expect(fieldTypes.boolean).toBeDefined();
    expect(fieldTypes.date).toBeDefined();
    expect(fieldTypes.number).toBeDefined();
  });

  test('FIELD_STATS should match actual counts', async () => {
    const { FIELD_STATS, CREATE_POSITION_FIELDS, getRequiredFields, getOptionalFields, getFieldsByCategory } =
      await import('../src/config/createPositionFields.js');

    expect(FIELD_STATS.total).toBe(CREATE_POSITION_FIELDS.length);
    expect(FIELD_STATS.required).toBe(getRequiredFields().length);
    expect(FIELD_STATS.optional).toBe(getOptionalFields().length);
    expect(FIELD_STATS.categories).toBe(Object.keys(getFieldsByCategory()).length);

    console.log('✓ FIELD_STATS validation:');
    console.log(`  - Total: ${FIELD_STATS.total}`);
    console.log(`  - Required: ${FIELD_STATS.required}`);
    console.log(`  - Optional: ${FIELD_STATS.optional}`);
    console.log(`  - Categories: ${FIELD_STATS.categories}`);
  });

  test('workdayServices.js should include both v44.2 and v45.0 services', async () => {
    const { WORKDAY_SERVICES } =
      await import('../src/config/workdayServices.js');

    expect(WORKDAY_SERVICES).toBeDefined();
    expect(Array.isArray(WORKDAY_SERVICES)).toBe(true);
    expect(WORKDAY_SERVICES.length).toBeGreaterThanOrEqual(2);

    // Test: Should have v44.2 legacy service
    const legacyService = WORKDAY_SERVICES.find(s => s.value === 'put_position');
    expect(legacyService).toBeDefined();
    expect(legacyService.version).toBe('v44.2');
    expect(legacyService.fieldConfig).toBe('putPositionFields');

    // Test: Should have v45.0 enhanced service
    const enhancedService = WORKDAY_SERVICES.find(s => s.value === 'create_position');
    expect(enhancedService).toBeDefined();
    expect(enhancedService.version).toBe('v45.0');
    expect(enhancedService.fieldConfig).toBe('createPositionFields');

    console.log('✓ Service registry validation:');
    console.log(`  - Total services: ${WORKDAY_SERVICES.length}`);
    console.log(`  - v44.2 (Legacy): ${legacyService.label}`);
    console.log(`  - v45.0 (Enhanced): ${enhancedService.label}`);
  });

  test('DYNAMIC_FUNCTIONS should be available', async () => {
    const { DYNAMIC_FUNCTIONS } =
      await import('../src/config/createPositionFields.js');

    expect(DYNAMIC_FUNCTIONS).toBeDefined();
    expect(Array.isArray(DYNAMIC_FUNCTIONS)).toBe(true);
    expect(DYNAMIC_FUNCTIONS.length).toBeGreaterThan(0);

    console.log(`✓ Dynamic functions: ${DYNAMIC_FUNCTIONS.length}`);

    // Test: Each function should have required properties
    DYNAMIC_FUNCTIONS.forEach(func => {
      expect(func.id).toBeDefined();
      expect(func.label).toBeDefined();
      expect(func.description).toBeDefined();
      expect(func.category).toBeDefined();
      expect(func.execute).toBeDefined();
      expect(typeof func.execute).toBe('function');
    });

    // Test: Functions should execute without errors
    const todayResult = DYNAMIC_FUNCTIONS.find(f => f.id === 'today').execute();
    expect(todayResult).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format

    console.log(`  - today() returns: ${todayResult}`);
  });

  test('getFieldByName should find fields correctly', async () => {
    const { getFieldByName } =
      await import('../src/config/createPositionFields.js');

    // Test: Should find Supervisory Organization ID
    const orgField = getFieldByName('Supervisory Organization ID');
    expect(orgField).toBeDefined();
    expect(orgField.required).toBe(true);

    // Test: Should find optional field
    const posIdField = getFieldByName('Position ID');
    expect(posIdField).toBeDefined();
    expect(posIdField.required).toBe(false);

    // Test: Should return undefined for non-existent field
    const nonExistent = getFieldByName('Non Existent Field');
    expect(nonExistent).toBeUndefined();

    console.log('✓ getFieldByName function works correctly');
  });

  test('getFieldByXmlPath should find fields correctly', async () => {
    const { getFieldByXmlPath } =
      await import('../src/config/createPositionFields.js');

    // Test: Should find by XML path
    const field = getFieldByXmlPath('Create_Position_Data.Supervisory_Organization_Reference.ID');
    expect(field).toBeDefined();
    expect(field.name).toBe('Supervisory Organization ID');

    // Test: Should return undefined for non-existent path
    const nonExistent = getFieldByXmlPath('Invalid.XML.Path');
    expect(nonExistent).toBeUndefined();

    console.log('✓ getFieldByXmlPath function works correctly');
  });

  test('should have boolean fields with defaultValue', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const booleanFields = CREATE_POSITION_FIELDS.filter(f => f.type === 'boolean');

    expect(booleanFields.length).toBeGreaterThan(0);

    console.log(`✓ Boolean fields: ${booleanFields.length}`);

    // Test: All boolean fields should have defaultValue
    booleanFields.forEach(field => {
      expect(field.defaultValue).toBeDefined();
      expect(typeof field.defaultValue).toBe('boolean');

      console.log(`  - ${field.name}: default = ${field.defaultValue}`);
    });
  });

  test('should have date fields with proper validation hints', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const dateFields = CREATE_POSITION_FIELDS.filter(f => f.type === 'date');

    expect(dateFields.length).toBeGreaterThan(0);

    console.log(`✓ Date fields: ${dateFields.length}`);

    // Test: Date fields should mention format in helpText
    dateFields.forEach(field => {
      expect(field.helpText.toLowerCase()).toContain('yyyy-mm-dd');

      console.log(`  - ${field.name}`);
    });
  });

  test('should have number fields for hours', async () => {
    const { CREATE_POSITION_FIELDS } =
      await import('../src/config/createPositionFields.js');

    const numberFields = CREATE_POSITION_FIELDS.filter(f => f.type === 'number');

    expect(numberFields.length).toBeGreaterThan(0);

    console.log(`✓ Number fields: ${numberFields.length}`);

    numberFields.forEach(field => {
      console.log(`  - ${field.name}`);
    });

    // Test: Should have Default Hours and Scheduled Hours
    const defaultHours = CREATE_POSITION_FIELDS.find(f => f.name === 'Default Hours');
    const scheduledHours = CREATE_POSITION_FIELDS.find(f => f.name === 'Scheduled Hours');

    expect(defaultHours).toBeDefined();
    expect(defaultHours.type).toBe('number');
    expect(scheduledHours).toBeDefined();
    expect(scheduledHours.type).toBe('number');
  });
});
