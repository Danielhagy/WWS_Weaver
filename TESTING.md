# Playwright Testing Guide

## Overview

This project uses Playwright for end-to-end testing. Playwright automates real browser interactions to test the application as users would experience it.

## Installation

Playwright is already installed. If you need to reinstall:

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI Mode (Recommended)
```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests
- Run individual tests
- Watch test execution in real-time
- Debug failed tests
- View screenshots and traces

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug a Specific Test
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test tests/dashboard.spec.js
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
```

## Test Structure

### Test Files Location
All tests are in the `/tests` directory:

- `dashboard.spec.js` - Tests for the Dashboard page
- `create-integration.spec.js` - Tests for the Integration Wizard
- `credentials.spec.js` - Tests for Credentials management
- `run-history.spec.js` - Tests for Run History page
- `navigation.spec.js` - Tests for navigation and sidebar

### Test Coverage

#### Dashboard Tests
- ✅ Loads with sample integrations
- ✅ Navigation to create integration
- ✅ Status badges display
- ✅ Recent runs section
- ✅ Stats cards

#### Create Integration Tests
- ✅ Configuration form display
- ✅ Field validation
- ✅ Step-by-step wizard flow
- ✅ Service selection
- ✅ Navigation between steps

#### Credentials Tests
- ✅ Credentials page display
- ✅ Existing credentials view
- ✅ Add credentials form
- ✅ Form validation
- ✅ Cancel form action

#### Run History Tests
- ✅ History page display
- ✅ Filter controls
- ✅ Execution history display
- ✅ Filter by status
- ✅ Search functionality
- ✅ Run details display

#### Navigation Tests
- ✅ Sidebar display
- ✅ Navigation between pages
- ✅ Active item highlighting
- ✅ MVP mode badge
- ✅ User profile display
- ✅ Root path redirect

## Configuration

The Playwright configuration is in `playwright.config.js`:

```javascript
{
  testDir: './tests',
  baseURL: 'http://localhost:3000',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  }
}
```

## Key Features

### Automatic Server Management
Playwright automatically starts the dev server before running tests and stops it after.

### Screenshots on Failure
Failed tests automatically capture screenshots saved to `test-results/`

### Trace Files
Traces are captured on first retry, providing full debugging information.

### HTML Reporter
After tests run, view the HTML report:
```bash
npx playwright show-report
```

## Writing New Tests

### Basic Test Structure
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/Dashboard');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Common Assertions
```javascript
// Visibility
await expect(page.locator('text=Hello')).toBeVisible();

// Text content
await expect(page.locator('h1')).toContainText('Dashboard');

// URL
await expect(page).toHaveURL('/Dashboard');

// Element state
await expect(button).toBeEnabled();
await expect(button).toBeDisabled();

// Count
await expect(page.locator('.card')).toHaveCount(3);
```

### Best Practices

1. **Use data-testid for stable selectors**
   ```jsx
   <button data-testid="submit-btn">Submit</button>
   ```
   ```javascript
   await page.click('[data-testid="submit-btn"]');
   ```

2. **Wait for elements before interacting**
   ```javascript
   await page.waitForSelector('text=Loading...', { state: 'hidden' });
   ```

3. **Use page.goto() with waitUntil**
   ```javascript
   await page.goto('/Dashboard', { waitUntil: 'networkidle' });
   ```

4. **Group related tests with describe blocks**
   ```javascript
   test.describe('User Authentication', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/login');
     });
     
     test('should login successfully', async ({ page }) => {
       // test code
     });
   });
   ```

## Debugging Failed Tests

### View Screenshot
Failed tests save screenshots to `test-results/[test-name]/test-failed-1.png`

### Use Debug Mode
```bash
npm run test:debug tests/dashboard.spec.js
```

This opens Playwright Inspector where you can:
- Step through test execution
- See element highlights
- View console logs
- Inspect selectors

### Use Trace Viewer
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## Continuous Integration

To run tests in CI:

```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Issues

### Port Already in Use
If port 3000 is busy:
```bash
kill -9 $(lsof -t -i:3000)
```

### Tests Timeout
Increase timeout in test:
```javascript
test.setTimeout(60000); // 60 seconds
```

### Element Not Found
Use more specific selectors or add wait:
```javascript
await page.waitForSelector('text=Expected Text');
await page.locator('text=Expected Text').click();
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - Generate tests by recording actions

## Test Reports

View the latest test report:
```bash
npx playwright show-report
```

This opens an interactive HTML report showing:
- Test results
- Execution time
- Screenshots
- Traces
- Error messages

---

**Happy Testing! 🎭**
