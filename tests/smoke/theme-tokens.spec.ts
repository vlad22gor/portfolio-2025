import { expect, test } from '@playwright/test';

const themeStorageKey = 'vh-theme';
const floatingThemeButtonSelector = '.floating-theme-button[data-floating-theme-button]';

const readThemeTokens = () => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim().toLowerCase();
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    textDefault: read('--color-text-default'),
    bgDefault: read('--color-bg-default'),
    ticketOrangeCritical: read('--color-ticket-bg-orange-critical'),
    buttonFloatingBg: read('--color-button-floating-bg'),
    footerBg: read('--color-footer-bg'),
  };
};

const readFooterBackgrounds = () => {
  const footer = document.querySelector('.site-footer');
  const scallopFrame = document.querySelector('.site-footer .quantized-scallop .scallop-frame');
  if (!(footer instanceof HTMLElement) || !(scallopFrame instanceof SVGElement)) {
    return null;
  }

  return {
    before: getComputedStyle(footer, '::before').backgroundColor,
    scallopFrame: getComputedStyle(scallopFrame).color,
  };
};

const readFloatingButtonState = () => {
  const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
  if (!(button instanceof HTMLButtonElement)) {
    return null;
  }

  const parseTranslateX = (transform: string) => {
    if (!transform || transform === 'none') {
      return 0;
    }
    const matrix2d = transform.match(/^matrix\((.+)\)$/);
    if (matrix2d) {
      const values = matrix2d[1].split(',').map((token) => Number.parseFloat(token.trim()));
      return Number.isFinite(values[4]) ? values[4] : Number.NaN;
    }
    const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
    if (matrix3d) {
      const values = matrix3d[1].split(',').map((token) => Number.parseFloat(token.trim()));
      return Number.isFinite(values[12]) ? values[12] : Number.NaN;
    }
    return Number.NaN;
  };

  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const motifTokenExpression = rootStyles.getPropertyValue('--color-button-floating-motif').trim();
  const accentExpression = rootStyles.getPropertyValue('--color-accent-blue').trim();
  const accentColorResolved = resolveColor(accentExpression);
  const sunIcon = button.querySelector('.floating-theme-button__icon--sun');
  const moonIcon = button.querySelector('.floating-theme-button__icon--moon');
  const activeIcon =
    button.dataset.themeState === 'dark'
      ? moonIcon instanceof HTMLElement
        ? moonIcon
        : null
      : sunIcon instanceof HTMLElement
        ? sunIcon
        : null;
  const activeMotif = activeIcon?.querySelector('.floating-theme-button__motif');
  const activeMotifColor =
    activeMotif instanceof HTMLElement
      ? getComputedStyle(activeMotif).backgroundColor
      : null;
  const activeTransform =
    activeIcon instanceof HTMLElement
      ? getComputedStyle(activeIcon).transform
      : null;
  const activeTranslateX = activeTransform ? parseTranslateX(activeTransform) : Number.NaN;
  const sunOpacity =
    sunIcon instanceof HTMLElement
      ? Number.parseFloat(getComputedStyle(sunIcon).opacity)
      : Number.NaN;
  const moonOpacity =
    moonIcon instanceof HTMLElement
      ? Number.parseFloat(getComputedStyle(moonIcon).opacity)
      : Number.NaN;
  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem('vh-theme');
  } catch {
    storedTheme = null;
  }

  return {
    themeState: button.dataset.themeState ?? null,
    pressed: button.getAttribute('aria-pressed'),
    label: button.getAttribute('aria-label'),
    sunOpacity,
    moonOpacity,
    motifTokenExpression,
    activeMotifColor,
    accentColorResolved,
    iconOffsetX: getComputedStyle(button).getPropertyValue('--floating-theme-icon-offset-x').trim(),
    activeTranslateX,
    buttonScale: Number.parseFloat(getComputedStyle(button).getPropertyValue('--floating-theme-button-scale').trim()),
    storedTheme,
  };
};

const readThemedGlyphSnapshot = (selectors: string[]) => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const iconTokenExpression = rootStyles.getPropertyValue('--color-icon-accent').trim();
  const expectedColor = resolveColor(iconTokenExpression);

  return {
    iconTokenExpression,
    expectedColor,
    entries: selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return {
          selector,
          present: false,
          color: null,
          motionInview: null,
          motionStageSide: null,
          motionStaggerIndex: null,
        };
      }

      return {
        selector,
        present: true,
        color: getComputedStyle(element).backgroundColor,
        motionInview: element.getAttribute('data-motion-inview'),
        motionStageSide: element.getAttribute('data-motion-stage-side'),
        motionStaggerIndex: element.getAttribute('data-motion-stagger-index'),
      };
    }),
  };
};

test.describe('Theme tokens smoke', () => {
  test.use({ viewport: { width: 1440, height: 1100 } });

  test('bootstrap respects system preference and localStorage override without runtime errors', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    const darkBySystem = await page.evaluate(readThemeTokens);
    expect(darkBySystem).toEqual({
      theme: 'dark',
      textDefault: '#efe2d2',
      bgDefault: '#173a66',
      ticketOrangeCritical: '#bd4554',
      buttonFloatingBg: '#224b7d',
      footerBg: '#224b7d',
    });
    const darkFooterBySystem = await page.evaluate(readFooterBackgrounds);
    expect(darkFooterBySystem).toEqual({
      before: 'rgb(34, 75, 125)',
      scallopFrame: 'rgb(34, 75, 125)',
    });

    await page.evaluate(() => {
      window.localStorage.setItem('vh-theme', 'light');
    });
    await page.reload();

    const lightByStorage = await page.evaluate(readThemeTokens);
    expect(lightByStorage).toEqual({
      theme: 'light',
      textDefault: '#000000d9',
      bgDefault: '#dbdad1',
      ticketOrangeCritical: '#cda476',
      buttonFloatingBg: '#dbdad1',
      footerBg: '#dbdad1',
    });
    const lightFooterByStorage = await page.evaluate(readFooterBackgrounds);
    expect(lightFooterByStorage).toEqual({
      before: 'rgb(219, 218, 209)',
      scallopFrame: 'rgb(219, 218, 209)',
    });

    await page.evaluate(() => {
      window.localStorage.setItem('vh-theme', 'dark');
    });
    await page.reload();

    const darkByStorage = await page.evaluate(readThemeTokens);
    expect(darkByStorage).toEqual({
      theme: 'dark',
      textDefault: '#efe2d2',
      bgDefault: '#173a66',
      ticketOrangeCritical: '#bd4554',
      buttonFloatingBg: '#224b7d',
      footerBg: '#224b7d',
    });
    const darkFooterByStorage = await page.evaluate(readFooterBackgrounds);
    expect(darkFooterByStorage).toEqual({
      before: 'rgb(34, 75, 125)',
      scallopFrame: 'rgb(34, 75, 125)',
    });

    const darkHasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(darkHasHorizontalOverflow).toBe(false);
  });

  test('floating theme button toggles theme and keeps state across soft/hard navigation', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    await page.goto('/');
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();
    await page.evaluate((storageKey) => {
      document.documentElement.dataset.theme = 'light';
      try {
        window.localStorage.setItem(storageKey, 'light');
      } catch {
        // Ignore storage access failures in restricted contexts.
      }
    }, themeStorageKey);

    const initialState = await page.evaluate(readFloatingButtonState);
    expect(initialState).not.toBeNull();
    expect(initialState!.themeState).toBe('light');
    expect(initialState!.pressed).toBe('false');
    expect(initialState!.label).toBe('Switch to dark theme');
    expect(initialState!.storedTheme).toBe('light');
    expect(initialState!.sunOpacity).toBeGreaterThan(0.9);
    expect(initialState!.moonOpacity).toBeLessThan(0.1);
    expect(initialState!.motifTokenExpression.length).toBeGreaterThan(0);
    expect(initialState!.activeMotifColor).toBe(initialState!.accentColorResolved);
    expect(initialState!.iconOffsetX).toBe('0px');
    expect(Math.abs(initialState!.activeTranslateX)).toBeLessThanOrEqual(0.01);

    await page.dispatchEvent(floatingThemeButtonSelector, 'pointerdown', { button: 0 });
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
            if (!(button instanceof HTMLButtonElement)) {
              return null;
            }
            const value = Number.parseFloat(getComputedStyle(button).getPropertyValue('--floating-theme-button-scale').trim());
            return Number.isFinite(value) ? value : null;
          }),
        { timeout: 2000 },
      )
      .toBeLessThanOrEqual(0.905);
    await page.dispatchEvent(floatingThemeButtonSelector, 'pointerup', { button: 0 });
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
            if (!(button instanceof HTMLButtonElement)) {
              return null;
            }
            const value = Number.parseFloat(getComputedStyle(button).getPropertyValue('--floating-theme-button-scale').trim());
            return Number.isFinite(value) ? value : null;
          }),
        { timeout: 2000 },
      )
      .toBeGreaterThanOrEqual(0.995);

    await page.click(floatingThemeButtonSelector);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
            if (!(button instanceof HTMLButtonElement)) {
              return null;
            }
            const sunIcon = button.querySelector('.floating-theme-button__icon--sun');
            const moonIcon = button.querySelector('.floating-theme-button__icon--moon');
            const sunOpacity =
              sunIcon instanceof HTMLElement
                ? Number.parseFloat(getComputedStyle(sunIcon).opacity)
                : Number.NaN;
            const moonOpacity =
              moonIcon instanceof HTMLElement
                ? Number.parseFloat(getComputedStyle(moonIcon).opacity)
                : Number.NaN;
            return {
              sunOpacity,
              moonOpacity,
            };
          }),
        { timeout: 2000 },
      )
      .toEqual({
        sunOpacity: 0,
        moonOpacity: 1,
      });

    const toggledState = await page.evaluate(readFloatingButtonState);
    expect(toggledState).not.toBeNull();
    expect(toggledState!.themeState).toBe('dark');
    expect(toggledState!.pressed).toBe('true');
    expect(toggledState!.label).toBe('Switch to light theme');
    expect(toggledState!.storedTheme).toBe('dark');
    expect(toggledState!.sunOpacity).toBe(0);
    expect(toggledState!.moonOpacity).toBe(1);
    expect(toggledState!.activeMotifColor).toBe(toggledState!.accentColorResolved);
    expect(toggledState!.iconOffsetX).toBe('-1.5px');
    expect(Math.abs(toggledState!.activeTranslateX - -1.5)).toBeLessThanOrEqual(0.05);

    const homeGlyphSelectors = ['.quotes-mark--main-open', '.quotes-mark--main-close', '.cases-cards-description-arrow--left'];
    const homeGlyphSnapshot = await page.evaluate(readThemedGlyphSnapshot, homeGlyphSelectors);
    expect(homeGlyphSnapshot.iconTokenExpression.length).toBeGreaterThan(0);
    homeGlyphSnapshot.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(homeGlyphSnapshot.expectedColor);
    });
    const homeCasesArrow = homeGlyphSnapshot.entries.find((entry) => entry.selector === '.cases-cards-description-arrow--left');
    expect(homeCasesArrow?.motionInview).toBe('cases-arrow-left-v1');
    const homeQuoteClose = homeGlyphSnapshot.entries.find((entry) => entry.selector === '.quotes-mark--main-close');
    expect(homeQuoteClose?.motionInview).toBe('quotes-main-close-after-v1');

    await page.goto('/fora');
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    const foraGlyphSelectors = [
      '.case-challenge-arrow',
      '.case-process-step__arrow',
      '.fora-design-system-arrow--top',
      '.fora-team-photo-heart--left',
    ];
    const foraGlyphSnapshot = await page.evaluate(readThemedGlyphSnapshot, foraGlyphSelectors);
    foraGlyphSnapshot.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(foraGlyphSnapshot.expectedColor);
    });

    await page.goto('/kissa');
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    const kissaGlyphSelectors = ['.kissa-artifact-photos-arrow--left', '.case-challenge-arrow', '.case-process-step__arrow'];
    const kissaGlyphSnapshot = await page.evaluate(readThemedGlyphSnapshot, kissaGlyphSelectors);
    kissaGlyphSnapshot.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(kissaGlyphSnapshot.expectedColor);
    });
    const kissaArtifactArrow = kissaGlyphSnapshot.entries.find(
      (entry) => entry.selector === '.kissa-artifact-photos-arrow--left',
    );
    expect(kissaArtifactArrow?.motionStageSide).toBe('left');
    expect(kissaArtifactArrow?.motionStaggerIndex).toBe('3');

    await page.click('a[data-nav-id="gallery"]');
    await expect(page).toHaveURL(/\/gallery\/?$/);
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    await page.reload();
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();

    const stateAfterReload = await page.evaluate(readFloatingButtonState);
    expect(stateAfterReload).not.toBeNull();
    expect(stateAfterReload!.themeState).toBe('dark');
    expect(stateAfterReload!.storedTheme).toBe('dark');
    expect(stateAfterReload!.label).toBe('Switch to light theme');
  });

  test('floating theme button is hidden in temporary adaptive mode on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');

    await expect(page.locator('.temporary-adaptive-notice')).toBeVisible();
    await expect(page.locator('.site-desktop-shell')).toBeHidden();
    await expect(page.locator(floatingThemeButtonSelector)).toBeHidden();
  });
});
