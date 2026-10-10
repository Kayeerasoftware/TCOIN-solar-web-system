import { test } from '@playwright/test';

test.describe('ticket-to-work-order', () => {
  test.skip('a customer raises a ticket and staff turn it into a work order', async ({ page }) => {
    await page.goto('/');
    // TODO: implement once the screens and API are connected
  });
});
