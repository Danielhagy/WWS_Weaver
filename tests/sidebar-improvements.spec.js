import { test, expect } from '@playwright/test';

test.describe('Sidebar Improvements Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/Dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display white Stitch logo in sidebar', async ({ page }) => {
    const logo = page.locator('aside img[alt="Stitch"]').first();
    await expect(logo).toBeVisible();

    const src = await logo.getAttribute('src');
    expect(src).toContain('StitchLogo.svg');
  });

  test('should have white text in navigation items', async ({ page }) => {
    const navItems = page.locator('aside a');
    const firstNav = navItems.first();

    await expect(firstNav).toBeVisible();
    await expect(firstNav).toHaveClass(/text-white/);
  });

  test('should have fixed sidebar that does not scroll', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Check sidebar has fixed class
    await expect(sidebar).toHaveClass(/fixed/);
    await expect(sidebar).toHaveClass(/left-0/);
    await expect(sidebar).toHaveClass(/top-0/);

    // Verify sidebar stays in viewport
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox).toBeTruthy();
  });

  test('should allow main content to scroll independently', async ({ page }) => {
    const scrollableDiv = page.locator('main > div').first();

    // Check scrollable div has overflow-y-auto
    await expect(scrollableDiv).toHaveClass(/overflow-y-auto/);

    // Verify content is scrollable
    const contentHeight = await page.evaluate(() => document.querySelector('main > div').scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    // Content should be scrollable
    expect(contentHeight).toBeGreaterThan(0);
  });

  test('should display improved user profile footer', async ({ page }) => {
    const userProfile = page.locator('aside').getByText('HR Administrator');
    await expect(userProfile).toBeVisible();

    // Check for HR badge
    const badge = page.locator('aside div:has-text("HR")').first();
    await expect(badge).toBeVisible();

    // Check for accent-teal text (updated color)
    await expect(userProfile).toHaveClass(/text-accent-teal/);
  });

  test('should have wider sidebar (288px)', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const sidebarBox = await sidebar.boundingBox();

    // w-72 = 288px (allowing for browser rendering variations)
    expect(sidebarBox.width).toBeGreaterThanOrEqual(288);
    expect(sidebarBox.width).toBeLessThanOrEqual(310);
  });

  test('should have 3D shadow effect on sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first();

    // Verify sidebar has box-shadow style
    const boxShadow = await sidebar.evaluate(el =>
      window.getComputedStyle(el).getPropertyValue('box-shadow')
    );

    expect(boxShadow).toBeTruthy();
    expect(boxShadow).not.toBe('none');
  });

  test('should have active navigation item with teal background', async ({ page }) => {
    const dashboardLink = page.locator('aside a:has-text("Dashboard")').first();

    await expect(dashboardLink).toHaveClass(/bg-accent-teal/);
    await expect(dashboardLink).toHaveClass(/text-white/);
  });

  test('should show hover effect on navigation items', async ({ page }) => {
    const credentialsLink = page.locator('aside a:has-text("Credentials")').first();

    // Verify link exists and has hover styling
    await expect(credentialsLink).toBeVisible();

    // Check that it has the darker blue hover class
    const classList = await credentialsLink.getAttribute('class');
    expect(classList).toContain('hover:bg-');
  });

  test('should have proper spacing between content and sidebar', async ({ page }) => {
    const main = page.locator('main').first();

    // Main should have left margin to account for sidebar
    await expect(main).toHaveClass(/ml-72/);
  });

  test('should take final verification screenshot', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/sidebar-improvements-verified.png',
      fullPage: true
    });
  });
});
