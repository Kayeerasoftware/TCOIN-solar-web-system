import { test } from '@playwright/test';

test.describe('technician-offline-sync', () => {
  test.skip('a technician completes a job with no connection and the work syncs when back online', async ({ page }) => {
    await page.goto('/');
    // TODO: implement once the screens and API are connected
  });
});
