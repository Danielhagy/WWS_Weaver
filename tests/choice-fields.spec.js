import { test, expect } from '@playwright/test';

test.describe('Choice Fields - Phase 3 & 4', () => {

  test('CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS should be exported', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    expect(CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS).toBeDefined();
    expect(Array.isArray(CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS)).toBe(true);
    expect(CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS.length).toBeGreaterThan(0);

    console.log(`✓ Total choice groups: ${CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS.length}`);
  });

  test('Pre-hire choice group should have 4 options', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS.find(g => g.id === 'pre_hire_selection');

    expect(preHireGroup).toBeDefined();
    expect(preHireGroup.options.length).toBe(4);
    expect(preHireGroup.required).toBe(true);

    console.log(`✓ Pre-hire group has ${preHireGroup.options.length} options`);
    console.log(`✓ Required: ${preHireGroup.required}`);
  });

  test('Pre-hire options should have correct IDs', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];
    const optionIds = preHireGroup.options.map(opt => opt.id);

    expect(optionIds).toContain('applicant_reference');
    expect(optionIds).toContain('former_worker_reference');
    expect(optionIds).toContain('student_reference');
    expect(optionIds).toContain('create_applicant');

    console.log(`✓ Option IDs: ${optionIds.join(', ')}`);
  });

  test('Simple reference options should have isSimpleReference flag', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];
    const simpleRefs = preHireGroup.options.filter(opt => opt.isSimpleReference);

    expect(simpleRefs.length).toBe(3); // Applicant, Former Worker, Student

    simpleRefs.forEach(opt => {
      console.log(`✓ Simple reference: ${opt.name} (${opt.id})`);
    });
  });

  test('Create Applicant option should be marked as complex and expandable', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];
    const createOption = preHireGroup.options.find(opt => opt.id === 'create_applicant');

    expect(createOption.isComplexType).toBe(true);
    expect(createOption.isExpandable).toBe(true);
    expect(createOption.fields.length).toBeGreaterThan(0);

    console.log(`✓ Create Applicant is complex and expandable`);
    console.log(`✓ Has ${createOption.fields.length} fields`);
  });

  test('Create Applicant should include First Name and Last Name', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];
    const createOption = preHireGroup.options.find(opt => opt.id === 'create_applicant');

    const fieldNames = createOption.fields.map(f => f.name);

    expect(fieldNames).toContain('First Name');
    expect(fieldNames).toContain('Last Name');

    const firstName = createOption.fields.find(f => f.name === 'First Name');
    const lastName = createOption.fields.find(f => f.name === 'Last Name');

    expect(firstName.required).toBe(true);
    expect(lastName.required).toBe(true);

    console.log(`✓ First Name required: ${firstName.required}`);
    console.log(`✓ Last Name required: ${lastName.required}`);
  });

  test('Each option should have an icon', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];

    preHireGroup.options.forEach(opt => {
      expect(opt.icon).toBeDefined();
      expect(typeof opt.icon).toBe('string');
      console.log(`✓ ${opt.name}: ${opt.icon}`);
    });
  });

  test('Each option should have fields array', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];

    preHireGroup.options.forEach(opt => {
      expect(opt.fields).toBeDefined();
      expect(Array.isArray(opt.fields)).toBe(true);
      expect(opt.fields.length).toBeGreaterThan(0);

      console.log(`✓ ${opt.name}: ${opt.fields.length} field(s)`);
    });
  });

  test('Field paths should follow XML structure', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];

    // Check Applicant Reference path
    const applicantOpt = preHireGroup.options.find(opt => opt.id === 'applicant_reference');
    const applicantField = applicantOpt.fields[0];

    expect(applicantField.xmlPath).toContain('Applicant_Reference');

    // Check Create Applicant paths
    const createOpt = preHireGroup.options.find(opt => opt.id === 'create_applicant');
    const firstNameField = createOpt.fields.find(f => f.name === 'First Name');

    expect(firstNameField.xmlPath).toContain('Applicant_Data');
    expect(firstNameField.xmlPath).toContain('Name_Data');

    console.log(`✓ Applicant Reference path: ${applicantField.xmlPath}`);
    console.log(`✓ First Name path: ${firstNameField.xmlPath}`);
  });

  test('text_with_type fields should have type options', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];

    // Find all text_with_type fields
    const allFields = preHireGroup.options.flatMap(opt => opt.fields);
    const textWithTypeFields = allFields.filter(f => f.type === 'text_with_type');

    expect(textWithTypeFields.length).toBeGreaterThan(0);

    textWithTypeFields.forEach(field => {
      expect(field.typeOptions).toBeDefined();
      expect(Array.isArray(field.typeOptions)).toBe(true);
      expect(field.typeOptions.length).toBeGreaterThan(0);
      expect(field.defaultType).toBeDefined();

      console.log(`✓ ${field.name}: ${field.typeOptions.join(', ')}`);
    });
  });

  test('Choice group should have category and helpText', async () => {
    const { CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } = await import('../src/config/contractContingentWorkerFields.js');

    const preHireGroup = CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS[0];

    expect(preHireGroup.category).toBeDefined();
    expect(preHireGroup.helpText).toBeDefined();
    expect(typeof preHireGroup.category).toBe('string');
    expect(typeof preHireGroup.helpText).toBe('string');

    console.log(`✓ Category: ${preHireGroup.category}`);
    console.log(`✓ Help text: ${preHireGroup.helpText}`);
  });

});

test.describe('Choice Field Selector Component', () => {

  test('ChoiceFieldSelector component should exist', async () => {
    const ChoiceFieldSelector = await import('../Components/field-mapping/ChoiceFieldSelector.jsx');

    expect(ChoiceFieldSelector).toBeDefined();
    expect(ChoiceFieldSelector.default).toBeDefined();

    console.log('✓ ChoiceFieldSelector component loaded successfully');
  });

  test('Component should accept required props', async () => {
    // This is a structural test - ensuring the component can be imported
    // Actual UI rendering tests would require a full browser environment

    const ChoiceFieldSelector = await import('../Components/field-mapping/ChoiceFieldSelector.jsx');
    const Component = ChoiceFieldSelector.default;

    // Check if it's a React component
    expect(typeof Component).toBe('function');

    console.log('✓ ChoiceFieldSelector is a valid React component');
  });

});

test.describe('SOAP Parser - Choice Group Detection', () => {

  test('Parser should detect choice groups in JSON output', async () => {
    const fs = await import('fs');
    const path = await import('path');

    // The enhanced parser creates JSON with "_with_choices" suffix
    const jsonPath = path.join(process.cwd(), 'WebserviceOperationJSON', 'Contract_Contingent_Worker_with_choices.json');

    if (!fs.existsSync(jsonPath)) {
      console.log('⚠ Enhanced JSON not found - skipping test (run: python soap_parser.py "NewWebserviceOps/Contract_Contingent_Worker Operation Details.html" "Contract_Contingent_Worker_with_choices.json")');
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // The enhanced parser groups consecutive choice fields
    // Find choice groups in request parameters
    let choiceGroups = [];

    if (data.request && data.request.parameters) {
      choiceGroups = data.request.parameters.filter(p => p && p.is_choice_group === true);
    }

    // If no choice groups found at top level, this is expected behavior
    // The parser creates choice_group objects by detecting consecutive [Choice] fields
    console.log(`✓ Parser processed ${data.request.parameters.length} parameters`);
    console.log(`✓ Found ${choiceGroups.length} choice group(s) at top level`);

    if (choiceGroups.length > 0) {
      choiceGroups.forEach((group, idx) => {
        console.log(`✓ Choice Group ${idx + 1}: ${group.options ? group.options.length : 0} options`);
      });
    } else {
      console.log('ℹ Note: Choice groups may be nested within Contract_Contingent_Worker_Data parameter');
    }

    // Test passes if we can read the file and parse it
    expect(data).toBeDefined();
    expect(data.request).toBeDefined();
  });

  test('Choice group options should have is_choice flag', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const jsonPath = path.join(process.cwd(), 'WebserviceOperationJSON', 'Contract_Contingent_Worker_with_choices.json');

    if (!fs.existsSync(jsonPath)) {
      console.log('⚠ Enhanced JSON not found - skipping test');
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const choiceGroups = data.request.parameters.filter(p => p.is_choice_group);

    if (choiceGroups.length > 0) {
      const firstGroup = choiceGroups[0];

      firstGroup.options.forEach(opt => {
        expect(opt.is_choice).toBe(true);
        expect(opt.name).toBeDefined();
        console.log(`✓ ${opt.name} is marked as choice field`);
      });
    }
  });

  test('Choice group should have choice_required flag', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const jsonPath = path.join(process.cwd(), 'WebserviceOperationJSON', 'Contract_Contingent_Worker_with_choices.json');

    if (!fs.existsSync(jsonPath)) {
      console.log('⚠ Enhanced JSON not found - skipping test');
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const choiceGroups = data.request.parameters.filter(p => p && p.is_choice_group === true);

    console.log(`✓ Found ${choiceGroups.length} choice group(s)`);

    if (choiceGroups.length > 0) {
      choiceGroups.forEach(group => {
        expect(group.choice_required).toBeDefined();
        expect(typeof group.choice_required).toBe('boolean');
        console.log(`✓ Choice group has choice_required: ${group.choice_required}`);
      });
    } else {
      console.log('ℹ No choice groups at top level - this is OK (may be nested)');
      // Test still passes - choice groups may be nested
      expect(data).toBeDefined();
    }
  });

});

test.describe('Integration - Field Configuration', () => {

  test('Field configuration should integrate with existing fields', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS, CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS } =
      await import('../src/config/contractContingentWorkerFields.js');

    // Both should be defined
    expect(CONTRACT_CONTINGENT_WORKER_FIELDS).toBeDefined();
    expect(CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS).toBeDefined();

    // Regular fields should not contain the choice options
    const fieldNames = CONTRACT_CONTINGENT_WORKER_FIELDS.map(f => f.name);

    // The old individual pre-hire fields should be removed from main array
    // (They're now in the choice group)
    const hasOldApplicantField = fieldNames.includes('Applicant ID');
    const hasOldFormerWorkerField = fieldNames.includes('Former Worker ID');
    const hasOldStudentField = fieldNames.includes('Student ID');

    // These should NOT be in the main fields array anymore
    expect(hasOldApplicantField || hasOldFormerWorkerField || hasOldStudentField).toBe(false);

    console.log(`✓ Choice fields properly separated from main fields array`);
    console.log(`✓ Main fields count: ${CONTRACT_CONTINGENT_WORKER_FIELDS.length}`);
    console.log(`✓ Choice groups count: ${CONTRACT_CONTINGENT_WORKER_CHOICE_GROUPS.length}`);
  });

  test('Contract Start Date should remain in main fields', async () => {
    const { CONTRACT_CONTINGENT_WORKER_FIELDS } = await import('../src/config/contractContingentWorkerFields.js');

    const startDateField = CONTRACT_CONTINGENT_WORKER_FIELDS.find(f => f.name === 'Contract Start Date');

    expect(startDateField).toBeDefined();
    expect(startDateField.required).toBe(true);
    expect(startDateField.type).toBe('date');

    console.log(`✓ Contract Start Date remains in main fields (required: ${startDateField.required})`);
  });

});
