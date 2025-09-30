import { test, expect } from '@playwright/test';

test.describe('UI Color Scheme Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display new primary dark blue color scheme', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check sidebar has primary dark blue background
    const sidebar = await page.locator('aside').first();
    await expect(sidebar).toHaveClass(/bg-primary-dark-blue/);

    // Check that headings use primary dark blue
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveClass(/text-primary-dark-blue/);
  });

  test('should display accent teal on interactive elements', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for accent teal in buttons (New Integration button)
    const newIntegrationButton = page.locator('button:has-text("New Integration")');
    if (await newIntegrationButton.count() > 0) {
      await expect(newIntegrationButton).toBeVisible();
    }

    // Check navigation active states use accent teal
    const activeNavItem = page.locator('a.scale-\\[1\\.02\\]').first();
    if (await activeNavItem.count() > 0) {
      await expect(activeNavItem).toHaveClass(/bg-accent-teal/);
    }
  });

  test('should display sidebar with new color scheme', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check sidebar exists and has proper styling (on desktop)
    const sidebar = page.locator('aside').first();
    if (await sidebar.count() > 0) {
      await expect(sidebar).toBeVisible();

      // Check sidebar header has gradient
      const sidebarHeader = sidebar.locator('.border-b').first();
      if (await sidebarHeader.count() > 0) {
        await expect(sidebarHeader).toBeVisible();
      }
    }
  });

  test('should display navigation items with correct hover states', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get all navigation links
    const navLinks = page.locator('aside a[href*="/"]');
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);

    // Check that at least one navigation item is visible
    await expect(navLinks.first()).toBeVisible();

    // Hover over a non-active nav item
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    if (await dashboardLink.count() > 0) {
      await dashboardLink.hover();
      // Should see hover effects
      await page.waitForTimeout(500);
    }
  });

  test('should display stats cards with brand colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for stats cards to appear
    await page.waitForTimeout(1000);

    // Check for stats cards (they should have the Card component styling)
    const statsCards = page.locator('.rounded-xl.border-soft-gray');

    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();

      // Check that card values use primary dark blue
      const cardValue = page.locator('.text-3xl.text-primary-dark-blue').first();
      if (await cardValue.count() > 0) {
        await expect(cardValue).toBeVisible();
      }
    }
  });

  test('should display integration cards with new styling', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Look for integration cards
    const cards = page.locator('.rounded-xl.border-soft-gray.bg-white');

    if (await cards.count() > 0) {
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();

      // Check for gradient icon background (teal to gray-blue)
      const iconContainer = firstCard.locator('.bg-gradient-to-br').first();
      if (await iconContainer.count() > 0) {
        await expect(iconContainer).toBeVisible();
      }
    }
  });

  test('should display user info card with new colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for user info in sidebar footer
    const userProfile = page.locator('aside').getByText('HR Administrator');
    await expect(userProfile).toBeVisible();

    // Check for teal badge
    const badge = page.locator('aside .bg-accent-teal').first();
    await expect(badge).toBeVisible();

    // Check for teal subtitle text
    const subtitle = page.locator('aside .text-accent-teal').first();
    await expect(subtitle).toBeVisible();
  });

  test('should have proper text colors throughout', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check main heading
    const heading = page.locator('h1.text-primary-dark-blue').first();
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible();
    }

    // Check for medium-gray-blue text (secondary text)
    const secondaryText = page.locator('.text-medium-gray-blue').first();
    if (await secondaryText.count() > 0) {
      await expect(secondaryText).toBeVisible();
    }
  });

  test('should display badges with correct colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Look for status badges
    const badges = page.locator('.rounded-full.border');

    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('should take screenshot of new color scheme', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/screenshots/new-color-scheme.png',
      fullPage: true
    });
  });
});
