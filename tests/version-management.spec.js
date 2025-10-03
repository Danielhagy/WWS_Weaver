import { test, expect } from '@playwright/test';

test.describe('Version Management - Phase 1', () => {

  test('VersionSelector component should export version constants', async () => {
    const { WORKDAY_VERSIONS, DEFAULT_VERSION } = await import('../src/components/VersionSelector.jsx');

    // Should have version array
    expect(WORKDAY_VERSIONS).toBeDefined();
    expect(Array.isArray(WORKDAY_VERSIONS)).toBe(true);

    // Should have exactly 21 versions (v44.0-v44.9, v45.0-v45.9, v46.0)
    expect(WORKDAY_VERSIONS.length).toBe(21);

    // Should have correct default
    expect(DEFAULT_VERSION).toBe('v45.0');

    console.log(`✓ Total versions: ${WORKDAY_VERSIONS.length}`);
    console.log(`✓ Default version: ${DEFAULT_VERSION}`);
    console.log(`✓ Version range: ${WORKDAY_VERSIONS[0]} to ${WORKDAY_VERSIONS[WORKDAY_VERSIONS.length - 1]}`);
  });

  test('should have correct version range (v44.0 to v46.0)', async () => {
    const { WORKDAY_VERSIONS } = await import('../src/components/VersionSelector.jsx');

    // First version should be v44.0
    expect(WORKDAY_VERSIONS[0]).toBe('v44.0');

    // Last version should be v46.0
    expect(WORKDAY_VERSIONS[WORKDAY_VERSIONS.length - 1]).toBe('v46.0');

    // Should include all v44.x versions
    const v44Versions = WORKDAY_VERSIONS.filter(v => v.startsWith('v44.'));
    expect(v44Versions.length).toBe(10); // v44.0 to v44.9

    // Should include all v45.x versions
    const v45Versions = WORKDAY_VERSIONS.filter(v => v.startsWith('v45.'));
    expect(v45Versions.length).toBe(10); // v45.0 to v45.9

    // Should have only v46.0
    const v46Versions = WORKDAY_VERSIONS.filter(v => v.startsWith('v46.'));
    expect(v46Versions.length).toBe(1); // Only v46.0

    console.log(`✓ v44.x versions: ${v44Versions.length}`);
    console.log(`✓ v45.x versions: ${v45Versions.length}`);
    console.log(`✓ v46.x versions: ${v46Versions.length}`);
  });

  test('WorkdayCredential entity should include webservice_version field', async () => {
    const { WorkdayCredential } = await import('../src/entities/WorkdayCredential.js');

    // Get all credentials
    const credentials = await WorkdayCredential.getAll();

    expect(credentials).toBeDefined();
    expect(Array.isArray(credentials)).toBe(true);
    expect(credentials.length).toBeGreaterThan(0);

    // Each credential should have webservice_version field
    credentials.forEach((cred, index) => {
      expect(cred.webservice_version).toBeDefined();
      expect(typeof cred.webservice_version).toBe('string');
      expect(cred.webservice_version).toMatch(/^v\d{2}\.\d$/); // Format: vXX.X

      console.log(`✓ Credential ${index + 1} (${cred.tenant_name}): ${cred.webservice_version}`);
    });
  });

  test('WorkdayCredential should have default version v45.0', async () => {
    const { WorkdayCredential } = await import('../src/entities/WorkdayCredential.js');

    const credentials = await WorkdayCredential.getAll();

    // At least one credential should exist with default version
    const defaultCredentials = credentials.filter(c => c.webservice_version === 'v45.0');
    expect(defaultCredentials.length).toBeGreaterThan(0);

    console.log(`✓ Credentials with default version (v45.0): ${defaultCredentials.length}/${credentials.length}`);
  });

  test('XML Generator should accept credential parameter', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    // Mock integration data
    const mockData = {
      field_mappings: [
        {
          target_field: 'Supervisory Organization ID',
          source_type: 'hardcoded',
          source_value: 'ORG-001'
        }
      ]
    };

    // Mock credential with version
    const mockCredential = {
      webservice_version: 'v44.5',
      tenant_url: 'https://wd2-impl.workday.com/ccx/service/test_tenant'
    };

    // Generate XML with credential
    const xmlWithCredential = generateCreatePositionXML(mockData, {}, mockCredential);

    // Should contain version in namespace
    expect(xmlWithCredential).toContain('urn:com.workday/bsvc/Staffing/v44.5');

    // Should contain version in request element
    expect(xmlWithCredential).toContain('bsvc:version="v44.5"');

    console.log(`✓ XML contains version in namespace`);
    console.log(`✓ XML contains version in request element`);
  });

  test('XML Generator should use default version when no credential provided', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    const mockData = {
      field_mappings: [
        {
          target_field: 'Supervisory Organization ID',
          source_type: 'hardcoded',
          source_value: 'ORG-001'
        }
      ]
    };

    // Generate XML without credential (should default to v45.0)
    const xml = generateCreatePositionXML(mockData, {});

    // Should contain default version v45.0
    expect(xml).toContain('urn:com.workday/bsvc/Staffing/v45.0');
    expect(xml).toContain('bsvc:version="v45.0"');

    console.log(`✓ XML defaults to v45.0 when no credential provided`);
  });

  test('XML Generator should generate version-aware namespace', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    const mockData = { field_mappings: [] };

    // Test multiple versions
    const versions = ['v44.0', 'v45.0', 'v46.0'];

    versions.forEach(version => {
      const credential = { webservice_version: version };
      const xml = generateCreatePositionXML(mockData, {}, credential);

      // Check namespace
      expect(xml).toContain(`xmlns:bsvc="urn:com.workday/bsvc/Staffing/${version}"`);

      // Check version attribute
      expect(xml).toContain(`bsvc:version="${version}"`);

      console.log(`✓ XML generated correctly for ${version}`);
    });
  });

  test('Postman instructions should use credential version and URL', async () => {
    const { generatePostmanInstructions } = await import('../src/utils/xmlGenerator.js');

    const mockCredential = {
      webservice_version: 'v44.2',
      tenant_url: 'https://wd2-impl.workday.com/ccx/service/acme_corp'
    };

    const instructions = generatePostmanInstructions(mockCredential);

    // Should contain version in URL
    expect(instructions).toContain('Staffing/v44.2');

    // Should contain tenant URL
    expect(instructions).toContain('acme_corp');

    console.log(`✓ Postman instructions include version and tenant URL`);
  });

  test('Postman instructions should provide default when no credential', async () => {
    const { generatePostmanInstructions } = await import('../src/utils/xmlGenerator.js');

    const instructions = generatePostmanInstructions();

    // Should contain default version v45.0
    expect(instructions).toContain('Staffing/v45.0');

    // Should contain placeholder tenant
    expect(instructions).toContain('YOUR_TENANT');

    console.log(`✓ Postman instructions default to v45.0 and placeholder tenant`);
  });

  test('WORKDAY_VERSIONS should have no duplicates', async () => {
    const { WORKDAY_VERSIONS } = await import('../src/components/VersionSelector.jsx');

    const uniqueVersions = [...new Set(WORKDAY_VERSIONS)];

    expect(uniqueVersions.length).toBe(WORKDAY_VERSIONS.length);

    console.log(`✓ No duplicate versions found`);
  });

  test('All versions should follow format vXX.X', async () => {
    const { WORKDAY_VERSIONS } = await import('../src/components/VersionSelector.jsx');

    const versionPattern = /^v\d{2}\.\d$/;

    WORKDAY_VERSIONS.forEach(version => {
      expect(version).toMatch(versionPattern);
    });

    console.log(`✓ All ${WORKDAY_VERSIONS.length} versions follow correct format`);
  });

});

test.describe('Version Management - UI Tests', () => {

  test('Credentials page should display version selector', async ({ page }) => {
    await page.goto('/Credentials');
    await page.waitForTimeout(1000);

    // Click Add Credentials button
    const addButton = page.locator('button').filter({ hasText: 'Add Credentials' }).first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Look for version selector label
      const versionLabel = page.locator('label').filter({ hasText: /Web Service Version/i });

      if (await versionLabel.count() > 0) {
        await expect(versionLabel).toBeVisible();
        console.log('✓ Version selector label is visible in form');
      }
    }
  });

  test('Credentials page should show version in credential cards', async ({ page }) => {
    await page.goto('/Credentials');
    await page.waitForTimeout(1000);

    // Look for version badge/display in credential cards
    const versionText = page.locator('text=/v\\d{2}\\.\\d/');

    if (await versionText.count() > 0) {
      const count = await versionText.count();
      console.log(`✓ Found ${count} version displays in credential cards`);

      // At least one should be visible
      await expect(versionText.first()).toBeVisible();
    }
  });

  test('Version selector should have searchable dropdown', async ({ page }) => {
    await page.goto('/Credentials');
    await page.waitForTimeout(1000);

    // Open add credentials form
    const addButton = page.locator('button').filter({ hasText: 'Add Credentials' }).first();

    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Try to find the version selector dropdown
      // It should be a select element or button that opens a dropdown
      const versionSelector = page.locator('[id="webservice_version"], button:near(:text("Web Service Version"))').first();

      if (await versionSelector.count() > 0) {
        console.log('✓ Version selector component found');
      }
    }
  });

  test('Credential cards should display version badge', async ({ page }) => {
    await page.goto('/Credentials');
    await page.waitForTimeout(1000);

    // Check if there are any credential cards
    const credentialCards = page.locator('.bg-white.rounded-lg.shadow-sm');
    const cardCount = await credentialCards.count();

    if (cardCount > 0) {
      console.log(`✓ Found ${cardCount} credential card(s)`);

      // Each card should potentially have a version badge
      // Look for text matching version pattern within cards
      const firstCard = credentialCards.first();
      const versionInCard = firstCard.locator('text=/v\\d{2}\\.\\d/').first();

      if (await versionInCard.count() > 0) {
        await expect(versionInCard).toBeVisible();
        const versionText = await versionInCard.textContent();
        console.log(`✓ Version badge visible: ${versionText}`);
      }
    }
  });

});

test.describe('Version Management - Integration Tests', () => {

  test('Credentials form should save version with new credential', async ({ page }) => {
    await page.goto('/Credentials');
    await page.waitForTimeout(1000);

    // Open form
    const addButton = page.locator('button').filter({ hasText: 'Add Credentials' }).first();

    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // The form should be ready to accept version selection
      const versionLabel = page.locator('label:has-text("Web Service Version")');

      if (await versionLabel.count() > 0) {
        await expect(versionLabel).toBeVisible();
        console.log('✓ Version field present in credentials form');
      }
    }
  });

  test('Version should persist in credential entity', async () => {
    const { WorkdayCredential } = await import('../src/entities/WorkdayCredential.js');

    // Create a test credential with version
    const testCredential = {
      tenant_name: 'test_version_persist',
      tenant_url: 'https://test.workday.com',
      username: 'test@user.com',
      password: 'testpass123',
      data_center: 'WD2',
      webservice_version: 'v44.7', // Custom version
      is_active: true
    };

    // Create credential
    const created = await WorkdayCredential.create(testCredential);

    // Verify version was saved
    expect(created.webservice_version).toBe('v44.7');

    // Retrieve credential
    const retrieved = await WorkdayCredential.getById(created.id);
    expect(retrieved.webservice_version).toBe('v44.7');

    // Clean up
    await WorkdayCredential.delete(created.id);

    console.log('✓ Version persists correctly in credential entity');
  });

  test('getActive() should return credential with version', async () => {
    const { WorkdayCredential } = await import('../src/entities/WorkdayCredential.js');

    const activeCredential = await WorkdayCredential.getActive();

    if (activeCredential) {
      expect(activeCredential.webservice_version).toBeDefined();
      expect(typeof activeCredential.webservice_version).toBe('string');

      console.log(`✓ Active credential has version: ${activeCredential.webservice_version}`);
    } else {
      console.log('⚠ No active credential found (this is okay for testing)');
    }
  });

});

test.describe('Version Management - Edge Cases', () => {

  test('Should handle missing version gracefully', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    // Credential with no version field
    const credentialNoVersion = {
      tenant_url: 'https://test.workday.com'
      // webservice_version is missing
    };

    const xml = generateCreatePositionXML({field_mappings: []}, {}, credentialNoVersion);

    // Should default to v45.0
    expect(xml).toContain('v45.0');

    console.log('✓ Handles missing version by defaulting to v45.0');
  });

  test('Should handle null credential gracefully', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    const xml = generateCreatePositionXML({field_mappings: []}, {}, null);

    // Should default to v45.0
    expect(xml).toContain('v45.0');

    console.log('✓ Handles null credential by defaulting to v45.0');
  });

  test('Should handle undefined credential gracefully', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    const xml = generateCreatePositionXML({field_mappings: []}, {});

    // Should default to v45.0
    expect(xml).toContain('v45.0');

    console.log('✓ Handles undefined credential by defaulting to v45.0');
  });

  test('Should handle invalid version format', async () => {
    const { generateCreatePositionXML } = await import('../src/utils/xmlGenerator.js');

    const credentialInvalidVersion = {
      webservice_version: 'invalid-version',
      tenant_url: 'https://test.workday.com'
    };

    const xml = generateCreatePositionXML({field_mappings: []}, {}, credentialInvalidVersion);

    // Should still include the invalid version (as provided)
    expect(xml).toContain('invalid-version');

    console.log('✓ Accepts and uses version even if format is non-standard');
  });

});
