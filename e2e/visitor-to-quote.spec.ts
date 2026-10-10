import { test } from '@playwright/test';

test.describe('visitor-to-quote', () => {
  test.skip('a visitor uses the calculator, submits contact details, and a lead is created', async ({ page }) => {
    await page.goto('/');
    // TODO: implement once the screens and API are connected
  });
});
