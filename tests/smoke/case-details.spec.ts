import { expect, test, type Page } from '@playwright/test';

test.describe('Case details smoke', () => {
  const assertCriticalMockupsAreStable = async (page: Page, expectedCount: number) => {
    const criticalMockups = page.locator('.device-mockup[data-device-priority="critical"]');
    await expect(criticalMockups).toHaveCount(expectedCount);

    await expect
      .poll(
        async () =>
          criticalMockups.evaluateAll((nodes) =>
            nodes.every((node) => node.getAttribute('data-ready') === 'true'),
          ),
        { timeout: 3000, message: 'Critical device mockups should be ready before first scroll' },
      )
      .toBe(true);

    const observedShellOnlyState = await page.evaluate(async () => {
      const pollIntervalMs = 80;
      const maxDurationMs = 1300;
      const startedAt = performance.now();
      while (performance.now() - startedAt < maxDurationMs) {
        const mockups = Array.from(
          document.querySelectorAll('.device-mockup[data-device-priority="critical"]'),
        );
        const hasShellOnlyState = mockups.some((mockup) => {
          if (!(mockup instanceof HTMLElement)) {
            return false;
          }
          if (mockup.dataset.ready !== 'false') {
            return false;
          }
          const shell = mockup.querySelector('.device-mockup__shell');
          return shell instanceof HTMLImageElement && shell.complete && shell.naturalWidth > 0;
        });

        if (hasShellOnlyState) {
          return true;
        }

        await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs));
      }
      return false;
    });

    expect(observedShellOnlyState).toBe(false);
  };

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

    const foraProcessSection = page.locator('.case-process-section--fora');
    const foraFirstTicket = foraProcessSection.locator('.case-process-ticket').first();
    await expect(foraProcessSection).toHaveAttribute('data-case-process-ticket-variant', 'square-36');
    await expect(foraFirstTicket).toHaveAttribute('data-perimeter-shape', 'rectangle');
    await expect(foraFirstTicket).toHaveAttribute('data-perimeter-step', '36');

    await assertCriticalMockupsAreStable(page, 4);
    await expect(page.locator('.fora-feature-cards-section .device-mockup').first()).toHaveAttribute(
      'data-device-priority',
      'lazy',
    );
  });

  test('/kissa renders detail config with artifact photos section and no fallback blocks', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page).toHaveTitle(/Kissa\.AI self-checkout terminal redesign/i);
    await expect(page.locator('a[data-nav-id="cases"][aria-current="page"]')).toBeVisible();

    await expect(page.locator('.kissa-intro-section')).toBeVisible();
    await expect(page.locator('.fora-intro-screens-section--tablet')).toBeVisible();
    await expect(page.locator('.kissa-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--kissa')).toBeVisible();
    await expect(page.locator('.kissa-artifact-photos-section')).toBeVisible();
    await expect(page.locator('.kissa-feature-cards')).toBeVisible();
    await expect(page.locator('.case-switcher-section')).toBeVisible();

    const kissaProcessSection = page.locator('.case-process-section--kissa');
    const kissaFirstTicket = kissaProcessSection.locator('.case-process-ticket').first();
    await expect(kissaProcessSection).toHaveAttribute('data-case-process-ticket-variant', 'circle-24');
    await expect(kissaFirstTicket).toHaveAttribute('data-perimeter-shape', 'circle');
    await expect(kissaFirstTicket).toHaveAttribute('data-perimeter-step', '24');

    await expect(page.locator('.section-stack')).toHaveCount(0);
    await expect(page.locator('.metrics-grid')).toHaveCount(0);
    await expect(page.locator('nav.case-pager')).toHaveCount(0);

    await assertCriticalMockupsAreStable(page, 4);
    await expect(page.locator('.kissa-feature-cards .device-mockup').first()).toHaveAttribute(
      'data-device-priority',
      'lazy',
    );
  });
});
