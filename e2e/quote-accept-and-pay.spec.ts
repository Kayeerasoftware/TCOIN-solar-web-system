import { test } from '@playwright/test';

test.describe('quote-accept-and-pay', () => {
  test.skip('a customer opens the quote link, signs, and pays the deposit by mobile money', async ({ page }) => {
    await page.goto('/');
    // TODO: implement once the screens and API are connected
  });
});
