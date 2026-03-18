import { expect, test } from '@playwright/test';

const readThemeTokens = () => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim().toLowerCase();
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    textDefault: read('--color-text-default'),
    bgDefault: read('--color-bg-default'),
    ticketOrangeCritical: read('--color-ticket-bg-orange-critical'),
    buttonFloatingBg: read('--color-button-floating-bg'),
  };
};

test.describe('Theme tokens smoke', () => {
  test.use({ viewport: { width: 1440, height: 1100 } });

  test('light/dark collections switch through data-theme without runtime errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    const lightTokens = await page.evaluate(readThemeTokens);
    expect(lightTokens).toEqual({
      theme: 'light',
      textDefault: '#000000d9',
      bgDefault: '#dbdad1',
      ticketOrangeCritical: '#cda476',
      buttonFloatingBg: '#dbdad1',
    });

    const baselineConsoleErrors = consoleErrors.length;
    const baselinePageErrors = pageErrors.length;

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    await page.waitForTimeout(100);

    const darkTokens = await page.evaluate(readThemeTokens);
    expect(darkTokens).toEqual({
      theme: 'dark',
      textDefault: '#efe2d2',
      bgDefault: '#173a66',
      ticketOrangeCritical: '#bd4554',
      buttonFloatingBg: '#224b7d',
    });

    const darkHasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(darkHasHorizontalOverflow).toBe(false);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
    });
    await page.waitForTimeout(100);

    const lightTokensAfterReset = await page.evaluate(readThemeTokens);
    expect(lightTokensAfterReset).toEqual(lightTokens);

    expect(consoleErrors.length).toBe(baselineConsoleErrors);
    expect(pageErrors.length).toBe(baselinePageErrors);
  });
});
