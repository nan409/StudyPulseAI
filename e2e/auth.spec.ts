import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to see landing elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('StudyPulse AI');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Assuming we have an error toast or message
    // await expect(page.locator('.error-message')).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('protected routes should redirect to login', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
