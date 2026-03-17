import { expect, test } from '@playwright/test';

test.describe('Case details smoke', () => {
  test('/fora renders detail config with key sections and active cases nav', async ({ page }) => {
    await page.goto('/fora');

    await expect(page).toHaveTitle(/Fora supermarket app redesign/i);
    await expect(page.locator('a[data-nav-id="cases"][aria-current="page"]')).toBeVisible();

    await expect(page.locator('.fora-intro-section')).toBeVisible();
    await expect(page.locator('.case-challenge-section')).toBeVisible();
    await expect(page.locator('.case-process-section')).toBeVisible();
    await expect(page.locator('.fora-feature-cards-section')).toBeVisible();
    await expect(page.locator('.fora-design-system-section')).toBeVisible();
    await expect(page.locator('.fora-team-photo-section')).toBeVisible();
    await expect(page.locator('.case-switcher-section')).toBeVisible();
  });

  test('/kissa keeps fallback layout, nav, and case switcher', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page).toHaveTitle(/Kissa\.AI self-checkout terminal redesign/i);
    await expect(page.locator('a[data-nav-id="cases"][aria-current="page"]')).toBeVisible();

    await expect(page.locator('.section-stack h1')).toContainText('Kissa.AI self-checkout terminal redesign');
    await expect(page.locator('.metrics-grid')).toBeVisible();
    await expect(page.locator('nav.case-pager')).toBeVisible();
    await expect(page.locator('.case-switcher-section')).toBeVisible();
  });
});
