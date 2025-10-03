import { test, expect } from '@playwright/test';

test.describe('SOAP XML Generation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('Contract Contingent Worker - SOAP XML structure and field mapping', async ({ page }) => {
    // Navigate to Create Integration
    await page.click('button:has-text("New Integration")');
    await page.waitForLoadState('networkidle');

    // Step 1: Configuration
    await page.fill('input[placeholder*="integration name" i]', 'CCW SOAP Test');
    await page.click('text=Contract Contingent Worker');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 2: Mapping - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1000);

    // Map Contract Start Date to dynamic function
    const availabilitySection = page.locator('text=Contract Start Date').locator('..');
    await availabilitySection.click();
    await page.waitForTimeout(300);

    // Select Dynamic tab and choose "Today's Date"
    const dynamicTab = availabilitySection.locator('button:has-text("Dynamic")');
    if (await dynamicTab.isVisible()) {
      await dynamicTab.click();
      await page.waitForTimeout(200);
      await availabilitySection.locator('text=Today\'s Date').click();
    }

    // Map Organization to file column
    const orgSection = page.locator('text=Organization ID').locator('..');
    await orgSection.click();
    await page.waitForTimeout(300);
    const fileTab = orgSection.locator('button:has-text("File")');
    if (await fileTab.isVisible()) {
      await fileTab.click();
      await page.waitForTimeout(200);
      const selectTrigger = orgSection.locator('[role="combobox"]');
      await selectTrigger.click();
      await page.waitForTimeout(200);
      await page.click('text=org');
    }

    // Expand and configure Create New Applicant
    const createApplicantSection = page.locator('text=Create New Applicant').first();
    await createApplicantSection.click();
    await page.waitForTimeout(500);

    // Map First Name
    const firstNameField = page.locator('text=First Name').first();
    await firstNameField.click();
    await page.waitForTimeout(300);
    const firstNameFileTab = page.locator('button:has-text("File")').first();
    await firstNameFileTab.click();
    await page.waitForTimeout(200);
    const firstNameSelect = page.locator('[role="combobox"]').first();
    await firstNameSelect.click();
    await page.waitForTimeout(200);
    await page.click('text=first');

    // Map Last Name
    const lastNameField = page.locator('text=Last Name').first();
    await lastNameField.click();
    await page.waitForTimeout(300);
    const lastNameFileTab = page.locator('button:has-text("File")').nth(1);
    await lastNameFileTab.click();
    await page.waitForTimeout(200);
    const lastNameSelect = page.locator('[role="combobox"]').nth(1);
    await lastNameSelect.click();
    await page.waitForTimeout(200);
    await page.click('text=last');

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 3: Transformations - Skip
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 4: Validation - Check SOAP XML
    await page.waitForSelector('pre', { timeout: 5000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('=== Contract Contingent Worker SOAP XML ===');
    console.log(soapXml);

    // Verify SOAP structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<soapenv:Envelope');
    expect(soapXml).toContain('xmlns:bsvc="urn:com.workday/bsvc/Staffing/');
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Request');

    // Verify Business Process Parameters
    expect(soapXml).toContain('<bsvc:Business_Process_Parameters>');
    expect(soapXml).toContain('<bsvc:Auto_Complete>');
    expect(soapXml).toContain('<bsvc:Run_Now>');

    // Verify Contract_Contingent_Worker_Data wrapper
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Data>');

    // Verify Applicant_Data (Create New Applicant)
    expect(soapXml).toContain('<bsvc:Applicant_Data>');
    expect(soapXml).toContain('<bsvc:First_Name>dan</bsvc:First_Name>');
    expect(soapXml).toContain('<bsvc:Last_Name>winner</bsvc:Last_Name>');

    // Verify Organization_Reference is present and mapped
    expect(soapXml).toContain('<bsvc:Organization_Reference>');
    expect(soapXml).toContain('org1');

    // CRITICAL: Verify Contract_Start_Date is OUTSIDE Event_Data wrapper
    const contractStartDateIndex = soapXml.indexOf('<bsvc:Contract_Start_Date>');
    const eventDataIndex = soapXml.indexOf('<bsvc:Contract_Contingent_Worker_Event_Data>');
    expect(contractStartDateIndex).toBeGreaterThan(0);
    expect(eventDataIndex).toBeGreaterThan(0);
    expect(contractStartDateIndex).toBeLessThan(eventDataIndex);

    // Verify Contract_Start_Date has today's date (YYYY-MM-DD format)
    const dateMatch = soapXml.match(/<bsvc:Contract_Start_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Contract_Start_Date>/);
    expect(dateMatch).toBeTruthy();
    expect(dateMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify Contract_Contingent_Worker_Event_Data wrapper exists
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Event_Data>');
    expect(soapXml).toContain('</bsvc:Contract_Contingent_Worker_Event_Data>');

    // Verify no placeholder comments for mapped fields
    expect(soapXml).not.toContain('<!-- Contract_Start_Date REQUIRED but not mapped -->');
    expect(soapXml).not.toContain('<!-- Organization_Reference');
  });

  test('Create Position - SOAP XML structure and field mapping', async ({ page }) => {
    // Navigate to Create Integration
    await page.click('button:has-text("New Integration")');
    await page.waitForLoadState('networkidle');

    // Step 1: Configuration
    await page.fill('input[placeholder*="integration name" i]', 'Create Position SOAP Test');
    await page.click('text=Create Position');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 2: Mapping - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1000);

    // Expand Basic Information section
    const basicInfoSection = page.locator('text=Basic Information').first();
    await basicInfoSection.click();
    await page.waitForTimeout(500);

    // Map Supervisory Organization ID to file column
    const orgField = page.locator('text=Supervisory Organization ID').first();
    await orgField.click();
    await page.waitForTimeout(300);

    const fileTab = page.locator('button:has-text("File")').first();
    await fileTab.click();
    await page.waitForTimeout(200);

    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.waitForTimeout(200);
    await page.click('text=org');

    // Expand Position Restrictions section
    const restrictionsSection = page.locator('text=Position Restrictions').first();
    await restrictionsSection.click();
    await page.waitForTimeout(500);

    // Map Availability Date to dynamic function
    const availabilityField = page.locator('text=Availability Date').first();
    await availabilityField.click();
    await page.waitForTimeout(300);

    const dynamicTab = page.locator('button:has-text("Dynamic")').first();
    await dynamicTab.click();
    await page.waitForTimeout(200);
    await page.click('text=Today\'s Date');

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 3: Transformations - Skip
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 4: Validation - Check SOAP XML
    await page.waitForSelector('pre', { timeout: 5000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('=== Create Position SOAP XML ===');
    console.log(soapXml);

    // Verify SOAP structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<bsvc:Create_Position_Request');
    expect(soapXml).toContain('xmlns:bsvc="urn:com.workday/bsvc/Staffing/');

    // Verify Business Process Parameters
    expect(soapXml).toContain('<bsvc:Business_Process_Parameters>');

    // Verify Create_Position_Data wrapper
    expect(soapXml).toContain('<bsvc:Create_Position_Data>');

    // Verify Supervisory_Organization_Reference with mapped value
    expect(soapXml).toContain('<bsvc:Supervisory_Organization_Reference>');
    expect(soapXml).toContain('org1');

    // Verify Position_Group_Restrictions_Data
    expect(soapXml).toContain('<bsvc:Position_Group_Restrictions_Data>');

    // Verify Availability_Date has today's date
    const dateMatch = soapXml.match(/<bsvc:Availability_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Availability_Date>/);
    expect(dateMatch).toBeTruthy();
    expect(dateMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify no placeholder comments for mapped fields
    expect(soapXml).not.toContain('<!-- Supervisory_Organization_Reference REQUIRED but not mapped -->');
  });

  test('End Contingent Worker Contract - SOAP XML structure and field mapping', async ({ page }) => {
    // Navigate to Create Integration
    await page.click('button:has-text("New Integration")');
    await page.waitForLoadState('networkidle');

    // Step 1: Configuration
    await page.fill('input[placeholder*="integration name" i]', 'End Contract SOAP Test');
    await page.click('text=End Contingent Worker Contract');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 2: Mapping - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1000);

    // Expand Basic Information section
    const basicInfoSection = page.locator('text=Basic Information').first();
    await basicInfoSection.click();
    await page.waitForTimeout(500);

    // Map Contingent Worker ID to file column
    const workerField = page.locator('text=Contingent Worker ID').first();
    await workerField.click();
    await page.waitForTimeout(300);

    const fileTab = page.locator('button:has-text("File")').first();
    await fileTab.click();
    await page.waitForTimeout(200);

    const workerSelect = page.locator('[role="combobox"]').first();
    await workerSelect.click();
    await page.waitForTimeout(200);
    await page.click('text=first');

    // Map Contract End Date to dynamic function
    const endDateField = page.locator('text=Contract End Date').first();
    await endDateField.click();
    await page.waitForTimeout(300);

    const dynamicTab1 = page.locator('button:has-text("Dynamic")').first();
    await dynamicTab1.click();
    await page.waitForTimeout(200);
    await page.click('text=Today\'s Date');

    // Expand Termination Details section
    const terminationSection = page.locator('text=Termination Details').first();
    await terminationSection.click();
    await page.waitForTimeout(500);

    // Map Primary Reason ID to static value
    const reasonField = page.locator('text=Primary Reason ID').first();
    await reasonField.click();
    await page.waitForTimeout(300);

    const staticTab = page.locator('button:has-text("Static")').first();
    await staticTab.click();
    await page.waitForTimeout(200);

    const staticInput = page.locator('input[placeholder*="static value" i]').first();
    await staticInput.fill('CONTRACT_END');

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 3: Transformations - Skip
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 4: Validation - Check SOAP XML
    await page.waitForSelector('pre', { timeout: 5000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('=== End Contingent Worker Contract SOAP XML ===');
    console.log(soapXml);

    // Verify SOAP structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Request');
    expect(soapXml).toContain('xmlns:bsvc="urn:com.workday/bsvc/Staffing/');

    // Verify Business Process Parameters
    expect(soapXml).toContain('<bsvc:Business_Process_Parameters>');

    // Verify End_Contingent_Worker_Contract_Data wrapper
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Data>');

    // Verify Contingent_Worker_Reference with mapped value
    expect(soapXml).toContain('<bsvc:Contingent_Worker_Reference>');
    expect(soapXml).toContain('dan');

    // CRITICAL: Verify Contract_End_Date is at correct position (after Contingent_Worker_Reference, before Event_Data)
    const workerRefIndex = soapXml.indexOf('</bsvc:Contingent_Worker_Reference>');
    const contractEndDateIndex = soapXml.indexOf('<bsvc:Contract_End_Date>');
    const eventDataIndex = soapXml.indexOf('<bsvc:End_Contingent_Worker_Contract_Event_Data>');

    expect(workerRefIndex).toBeGreaterThan(0);
    expect(contractEndDateIndex).toBeGreaterThan(workerRefIndex);
    expect(eventDataIndex).toBeGreaterThan(contractEndDateIndex);

    // Verify Contract_End_Date has today's date
    const dateMatch = soapXml.match(/<bsvc:Contract_End_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Contract_End_Date>/);
    expect(dateMatch).toBeTruthy();
    expect(dateMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify End_Contingent_Worker_Contract_Event_Data wrapper
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Event_Data>');

    // Verify Primary_Reason_Reference with mapped value
    expect(soapXml).toContain('<bsvc:Primary_Reason_Reference>');
    expect(soapXml).toContain('CONTRACT_END');

    // Verify no placeholder comments for mapped fields
    expect(soapXml).not.toContain('<!-- Contingent_Worker_Reference REQUIRED but not mapped -->');
    expect(soapXml).not.toContain('<!-- Contract_End_Date REQUIRED but not mapped -->');
    expect(soapXml).not.toContain('<!-- Primary_Reason_Reference REQUIRED but not mapped -->');
  });

  test('Contract Contingent Worker - Verify all mapping types work in SOAP', async ({ page }) => {
    // Navigate to Create Integration
    await page.click('button:has-text("New Integration")');
    await page.waitForLoadState('networkidle');

    // Step 1: Configuration
    await page.fill('input[placeholder*="integration name" i]', 'CCW Mapping Types Test');
    await page.click('text=Contract Contingent Worker');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 2: Mapping - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1000);

    // Test 1: Dynamic function - Contract Start Date
    const startDateSection = page.locator('text=Contract Start Date').first();
    await startDateSection.click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Dynamic")').first().click();
    await page.waitForTimeout(200);
    await page.click('text=Today\'s Date');

    // Test 2: File column - Organization ID
    const orgSection = page.locator('text=Organization ID').first();
    await orgSection.click();
    await page.waitForTimeout(300);
    const orgFileTab = page.locator('button:has-text("File")').first();
    await orgFileTab.click();
    await page.waitForTimeout(200);
    const orgSelect = page.locator('[role="combobox"]').first();
    await orgSelect.click();
    await page.waitForTimeout(200);
    await page.click('text=org');

    // Test 3: Static/Hardcoded - Contract End Date in Event Data
    const eventDataSection = page.locator('text=Contract Details').first();
    await eventDataSection.click();
    await page.waitForTimeout(500);

    const endDateField = page.locator('text=Contract End Date').first();
    await endDateField.click();
    await page.waitForTimeout(300);
    const staticTab = page.locator('button:has-text("Static")').first();
    await staticTab.click();
    await page.waitForTimeout(200);
    const staticInput = page.locator('input[placeholder*="static value" i]').first();
    await staticInput.fill('2025-12-31');

    // Create New Applicant with file mapping
    const createApplicantSection = page.locator('text=Create New Applicant').first();
    await createApplicantSection.click();
    await page.waitForTimeout(500);

    const firstNameField = page.locator('text=First Name').first();
    await firstNameField.click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("File")').first().click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(200);
    await page.click('text=first');

    const lastNameField = page.locator('text=Last Name').first();
    await lastNameField.click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("File")').nth(1).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.waitForTimeout(200);
    await page.click('text=last');

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 3: Transformations - Skip
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Step 4: Validation - Verify all mapping types populated correctly
    await page.waitForSelector('pre', { timeout: 5000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('=== All Mapping Types SOAP XML ===');
    console.log(soapXml);

    // Verify dynamic function (Contract_Start_Date)
    const startDateMatch = soapXml.match(/<bsvc:Contract_Start_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Contract_Start_Date>/);
    expect(startDateMatch).toBeTruthy();

    // Verify file column (Organization_Reference)
    expect(soapXml).toContain('<bsvc:Organization_Reference>');
    expect(soapXml).toContain('org1');

    // Verify static/hardcoded (Contract_End_Date)
    expect(soapXml).toContain('<bsvc:Contract_End_Date>2025-12-31</bsvc:Contract_End_Date>');

    // Verify file column in nested structure (First_Name, Last_Name)
    expect(soapXml).toContain('<bsvc:First_Name>dan</bsvc:First_Name>');
    expect(soapXml).toContain('<bsvc:Last_Name>winner</bsvc:Last_Name>');
  });
});
