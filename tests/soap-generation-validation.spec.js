import { test, expect } from '@playwright/test';

test.describe('SOAP XML Generation Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/create-stitch');
    await page.waitForLoadState('networkidle');
  });

  test('Contract Contingent Worker - SOAP structure with field mappings', async ({ page }) => {
    // Configuration step
    await page.fill('input[placeholder*="Integration Name"]', 'CCW SOAP Test');
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=Contract Contingent Worker (v45.0)').click();
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Mapping step - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1500);

    // Map Contract Start Date (outside Event_Data wrapper)
    await page.locator('text=Contract Start Date').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Dynamic")').first().click();
    await page.waitForTimeout(200);
    await page.locator('text=Today\'s Date').click();
    await page.waitForTimeout(300);

    // Expand and configure Create New Applicant
    await page.locator('text=Create New Applicant').first().click();
    await page.waitForTimeout(500);

    // Map First Name
    await page.locator('text=First Name').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("File")').first().click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]:has-text("first")').click();
    await page.waitForTimeout(300);

    // Map Last Name
    await page.locator('text=Last Name').first().click();
    await page.waitForTimeout(300);
    const lastNameFileBtn = page.locator('button:has-text("File")').nth(1);
    await lastNameFileBtn.click();
    await page.waitForTimeout(200);
    const lastNameSelect = page.locator('[role="combobox"]').nth(1);
    await lastNameSelect.click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]:has-text("last")').click();
    await page.waitForTimeout(300);

    // Proceed to validation
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Get SOAP XML
    await page.waitForSelector('pre', { timeout: 10000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('\n=== Contract Contingent Worker SOAP XML ===');
    console.log(soapXml);
    console.log('===========================================\n');

    // Verify basic structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Request');
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Data>');

    // Verify Applicant_Data
    expect(soapXml).toContain('<bsvc:Applicant_Data>');
    expect(soapXml).toContain('<bsvc:First_Name>dan</bsvc:First_Name>');
    expect(soapXml).toContain('<bsvc:Last_Name>winner</bsvc:Last_Name>');

    // CRITICAL: Contract_Start_Date must be OUTSIDE Event_Data wrapper
    const contractStartDateIndex = soapXml.indexOf('<bsvc:Contract_Start_Date>');
    const eventDataStartIndex = soapXml.indexOf('<bsvc:Contract_Contingent_Worker_Event_Data>');
    expect(contractStartDateIndex).toBeGreaterThan(0);
    expect(eventDataStartIndex).toBeGreaterThan(0);
    expect(contractStartDateIndex).toBeLessThan(eventDataStartIndex);

    // Verify dynamic function executed (today's date in YYYY-MM-DD format)
    const dateMatch = soapXml.match(/<bsvc:Contract_Start_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Contract_Start_Date>/);
    expect(dateMatch).toBeTruthy();
    expect(dateMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Verify Event_Data wrapper exists
    expect(soapXml).toContain('<bsvc:Contract_Contingent_Worker_Event_Data>');
    expect(soapXml).toContain('</bsvc:Contract_Contingent_Worker_Event_Data>');
  });

  test('Create Position - SOAP structure with field mappings', async ({ page }) => {
    // Configuration step
    await page.fill('input[placeholder*="Integration Name"]', 'Create Position Test');
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=Create Position (v45.0)').click();
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Mapping step - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1500);

    // Expand Basic Information and map Supervisory Organization ID
    await page.locator('text=Basic Information').first().click();
    await page.waitForTimeout(500);

    await page.locator('text=Supervisory Organization ID').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("File")').first().click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]:has-text("org")').click();
    await page.waitForTimeout(300);

    // Expand Position Restrictions and map Availability Date
    await page.locator('text=Position Restrictions').first().click();
    await page.waitForTimeout(500);

    await page.locator('text=Availability Date').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Dynamic")').first().click();
    await page.waitForTimeout(200);
    await page.locator('text=Today\'s Date').click();
    await page.waitForTimeout(300);

    // Proceed to validation
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Get SOAP XML
    await page.waitForSelector('pre', { timeout: 10000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('\n=== Create Position SOAP XML ===');
    console.log(soapXml);
    console.log('================================\n');

    // Verify basic structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<bsvc:Create_Position_Request');
    expect(soapXml).toContain('<bsvc:Create_Position_Data>');

    // Verify Supervisory_Organization_Reference mapped correctly with xmlPath
    expect(soapXml).toContain('<bsvc:Supervisory_Organization_Reference>');
    expect(soapXml).toContain('org1');

    // Verify Position_Group_Restrictions_Data
    expect(soapXml).toContain('<bsvc:Position_Group_Restrictions_Data>');

    // Verify Availability_Date with dynamic function
    const dateMatch = soapXml.match(/<bsvc:Availability_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Availability_Date>/);
    expect(dateMatch).toBeTruthy();
    expect(dateMatch[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // No placeholder comments for mapped fields
    expect(soapXml).not.toContain('<!-- Supervisory_Organization_Reference REQUIRED but not mapped -->');
  });

  test('End Contingent Worker Contract - SOAP structure with field mappings', async ({ page }) => {
    // Configuration step
    await page.fill('input[placeholder*="Integration Name"]', 'End Contract Test');
    await page.locator('button:has-text("Staffing")').click();
    await page.locator('text=End Contingent Worker Contract (v45.0)').click();
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Mapping step - Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-data.csv');
    await page.waitForTimeout(1500);

    // Expand Basic Information
    await page.locator('text=Basic Information').first().click();
    await page.waitForTimeout(500);

    // Map Contingent Worker ID
    await page.locator('text=Contingent Worker ID').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("File")').first().click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]:has-text("first")').click();
    await page.waitForTimeout(300);

    // Map Contract End Date
    await page.locator('text=Contract End Date').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Dynamic")').first().click();
    await page.waitForTimeout(200);
    await page.locator('text=Today\'s Date').click();
    await page.waitForTimeout(300);

    // Expand Termination Details and map Primary Reason
    await page.locator('text=Termination Details').first().click();
    await page.waitForTimeout(500);

    await page.locator('text=Primary Reason ID').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Static")').first().click();
    await page.waitForTimeout(200);
    const staticInput = page.locator('input[placeholder*="static value" i]').first();
    await staticInput.fill('CONTRACT_END');
    await page.waitForTimeout(300);

    // Proceed to validation
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Get SOAP XML
    await page.waitForSelector('pre', { timeout: 10000 });
    const soapXml = await page.locator('pre').textContent();

    console.log('\n=== End Contingent Worker Contract SOAP XML ===');
    console.log(soapXml);
    console.log('==============================================\n');

    // Verify basic structure
    expect(soapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Request');
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Data>');

    // Verify Contingent_Worker_Reference with xmlPath
    expect(soapXml).toContain('<bsvc:Contingent_Worker_Reference>');
    expect(soapXml).toContain('dan');

    // CRITICAL: Contract_End_Date must be after Worker_Reference, before Event_Data
    const workerRefIndex = soapXml.indexOf('</bsvc:Contingent_Worker_Reference>');
    const contractEndDateIndex = soapXml.indexOf('<bsvc:Contract_End_Date>');
    const eventDataIndex = soapXml.indexOf('<bsvc:End_Contingent_Worker_Contract_Event_Data>');

    expect(workerRefIndex).toBeGreaterThan(0);
    expect(contractEndDateIndex).toBeGreaterThan(workerRefIndex);
    expect(eventDataIndex).toBeGreaterThan(contractEndDateIndex);

    // Verify dynamic function for Contract_End_Date
    const dateMatch = soapXml.match(/<bsvc:Contract_End_Date>(\d{4}-\d{2}-\d{2})<\/bsvc:Contract_End_Date>/);
    expect(dateMatch).toBeTruthy();

    // Verify Event_Data with Primary_Reason
    expect(soapXml).toContain('<bsvc:End_Contingent_Worker_Contract_Event_Data>');
    expect(soapXml).toContain('<bsvc:Primary_Reason_Reference>');
    expect(soapXml).toContain('CONTRACT_END');

    // No placeholder comments for mapped fields
    expect(soapXml).not.toContain('<!-- Contingent_Worker_Reference REQUIRED but not mapped -->');
    expect(soapXml).not.toContain('<!-- Contract_End_Date REQUIRED but not mapped -->');
  });
});
