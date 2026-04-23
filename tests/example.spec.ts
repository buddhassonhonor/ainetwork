import { test, expect } from '@playwright/test';

test('basic page load', async ({ page }) => {
  // Update URL if your dev server runs on a different port
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/./);
});
