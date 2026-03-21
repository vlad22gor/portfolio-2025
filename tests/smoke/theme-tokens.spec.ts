import { expect, test } from '@playwright/test';

const themeStorageKey = 'vh-theme';
const floatingThemeButtonSelector = '.floating-theme-button[data-floating-theme-button]';

const readHomeThemedMockups = () => {
  const mockupRed = document.querySelector('.home-hero-asset--mockup-red img');
  const mockupPath = document.querySelector('.home-hero-asset--mockup-path img');
  if (!(mockupRed instanceof HTMLImageElement) || !(mockupPath instanceof HTMLImageElement)) {
    return null;
  }

  return {
    mockupRedSrc: mockupRed.getAttribute('src'),
    mockupPathSrc: mockupPath.getAttribute('src'),
  };
};

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
    buttonBg: read('--color-button-bg'),
    buttonText: read('--color-button-text'),
    buttonTextOutlined: read('--color-button-text-outlined'),
    buttonArrow: read('--color-button-arrow'),
    buttonBorder: read('--color-button-border'),
    inkBg: read('--color-ink-bg'),
    dividerBg: read('--color-divider-bg'),
  };
};

const readIconAliasSnapshot = () => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const styles = getComputedStyle(document.documentElement);
  const inkExpression = styles.getPropertyValue('--color-ink-bg').trim();
  const iconExpression = styles.getPropertyValue('--color-icon-accent').trim();

  return {
    inkExpression,
    iconExpression,
    inkResolved: resolveColor(inkExpression),
    iconResolved: resolveColor(iconExpression),
  };
};

const readWaveColorSnapshot = (selectors: string[]) => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const dividerTokenExpression = rootStyles.getPropertyValue('--color-divider-bg').trim();
  const expectedColor = resolveColor(dividerTokenExpression);

  return {
    dividerTokenExpression,
    expectedColor,
    entries: selectors.map((selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return {
          selector,
          present: false,
          color: null,
        };
      }

      return {
        selector,
        present: true,
        color: getComputedStyle(element).color,
      };
    }),
  };
};

const readButtonTokenSnapshot = (input: string | [string, string, string?]) => {
  const selector = Array.isArray(input) ? input[0] : input;
  const textTokenName = Array.isArray(input) ? input[1] : '--color-button-text';
  const iconTokenName = Array.isArray(input) ? (input[2] ?? '--color-button-arrow') : '--color-button-arrow';
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const expected = {
    bg: resolveColor(rootStyles.getPropertyValue('--color-button-bg').trim()),
    text: resolveColor(rootStyles.getPropertyValue(textTokenName).trim()),
    border: resolveColor(rootStyles.getPropertyValue('--color-button-border').trim()),
    arrow: resolveColor(rootStyles.getPropertyValue(iconTokenName).trim()),
  };

  const button = document.querySelector(selector);
  if (!(button instanceof HTMLElement)) {
    return {
      selector,
      present: false,
      expected,
      actual: null,
    };
  }

  const buttonStyles = getComputedStyle(button);
  const icon = button.querySelector('.ui-button__icon');

  return {
    selector,
    present: true,
    expected,
    actual: {
      backgroundColor: buttonStyles.backgroundColor,
      textColor: buttonStyles.color,
      borderTopColor: buttonStyles.borderTopColor,
      borderTopWidth: buttonStyles.borderTopWidth,
      iconColor: icon instanceof HTMLElement ? getComputedStyle(icon).backgroundColor : null,
    },
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

const readFooterMotifSnapshot = () => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const expectedAccentWhite = resolveColor(rootStyles.getPropertyValue('--color-accent-white').trim());
  const motifs = Array.from(document.querySelectorAll('.site-footer-motif'));

  return {
    expectedAccentWhite,
    entries: motifs.map((motif) =>
      motif instanceof HTMLElement
        ? {
            present: true,
            color: getComputedStyle(motif).backgroundColor,
          }
        : {
            present: false,
            color: null,
          },
    ),
  };
};

const readFinalCtaOrbSnapshot = () => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const expectedAccentBlue = resolveColor(rootStyles.getPropertyValue('--color-accent-blue').trim());
  const orb = document.querySelector('.final-cta-orb');
  if (!(orb instanceof HTMLElement)) {
    return null;
  }

  const orbStyles = getComputedStyle(orb);
  return {
    expectedAccentBlue,
    actualColor: orbStyles.backgroundColor,
    hasThemedClass: orb.classList.contains('themed-svg-icon'),
    maskImage: orbStyles.maskImage,
    webkitMaskImage: orbStyles.webkitMaskImage,
  };
};

const readAboutArchSnapshot = () => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const expectedAccentOrange = resolveColor(rootStyles.getPropertyValue('--color-accent-orange').trim());
  const arch = document.querySelector('.about-me-arch');
  const archPath = document.querySelector('.about-me-arch [data-motion-trim-path]');

  if (!(arch instanceof SVGElement) || !(archPath instanceof SVGElement)) {
    return null;
  }

  return {
    expectedAccentOrange,
    archColor: getComputedStyle(arch).color,
    archPathStroke: getComputedStyle(archPath).stroke,
  };
};

const readBadgeThemeSnapshot = () => {
  const resolveColor = (value: string) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const expectedAccentBlue = resolveColor(rootStyles.getPropertyValue('--color-accent-blue').trim());
  const expectedTextSecondary = resolveColor(rootStyles.getPropertyValue('--color-text-secondary').trim());
  const defaultBadge = document.querySelector('.case-badge-row .case-badge');
  if (!(defaultBadge instanceof HTMLElement)) {
    return null;
  }

  const defaultBadgeStyles = getComputedStyle(defaultBadge);

  const explicitOutlined = document.createElement('span');
  explicitOutlined.className = 'case-badge case-badge--outlined';
  explicitOutlined.dataset.badgeType = 'outlined';
  explicitOutlined.textContent = 'Outlined';
  document.body.appendChild(explicitOutlined);
  const explicitOutlinedStyles = getComputedStyle(explicitOutlined);

  const snapshot = {
    expectedAccentBlue,
    expectedTextSecondary,
    defaultBadge: {
      dataBadgeType: defaultBadge.dataset.badgeType ?? null,
      backgroundColor: defaultBadgeStyles.backgroundColor,
      borderTopWidth: defaultBadgeStyles.borderTopWidth,
      borderTopColor: defaultBadgeStyles.borderTopColor,
    },
    explicitOutlined: {
      dataBadgeType: explicitOutlined.dataset.badgeType ?? null,
      backgroundColor: explicitOutlinedStyles.backgroundColor,
      borderTopWidth: explicitOutlinedStyles.borderTopWidth,
      borderTopColor: explicitOutlinedStyles.borderTopColor,
    },
  };

  explicitOutlined.remove();
  return snapshot;
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

const installVibrateMockInitScript = () => {
  const calls: Array<number | number[]> = [];
  const normalizePattern = (input: unknown): number | number[] => {
    if (typeof input === 'number') {
      return input;
    }
    if (Array.isArray(input)) {
      return input.filter((value): value is number => Number.isFinite(value));
    }
    return [];
  };

  const mockVibrate = (input?: number | number[]) => {
    calls.push(normalizePattern(input));
    return true;
  };

  let installed = false;
  try {
    Object.defineProperty(window.navigator, 'vibrate', {
      configurable: true,
      writable: true,
      value: mockVibrate,
    });
    installed = window.navigator.vibrate === mockVibrate;
  } catch {
    installed = false;
  }

  if (!installed) {
    try {
      Object.defineProperty(Navigator.prototype, 'vibrate', {
        configurable: true,
        writable: true,
        value: mockVibrate,
      });
      installed = window.navigator.vibrate === mockVibrate;
    } catch {
      installed = false;
    }
  }

  (window as typeof window & { __vibrateMockInstalled?: boolean; __vibrateMockCalls?: Array<number | number[]> })
    .__vibrateMockInstalled = installed;
  (window as typeof window & { __vibrateMockCalls?: Array<number | number[]> }).__vibrateMockCalls = calls;
};

const readVibrateMockSnapshot = () => {
  const state = window as typeof window & { __vibrateMockInstalled?: boolean; __vibrateMockCalls?: Array<number | number[]> };
  return {
    installed: Boolean(state.__vibrateMockInstalled),
    calls: Array.isArray(state.__vibrateMockCalls) ? state.__vibrateMockCalls : [],
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
      ticketOrangeCritical: '#6a9ecf',
      buttonFloatingBg: '#234978',
      footerBg: '#234978',
      buttonBg: '#79b0e2',
      buttonText: '#173a66',
      buttonTextOutlined: '#efe2d2',
      buttonArrow: '#173a66',
      buttonBorder: '#79b0e2',
      inkBg: '#79b0e2',
      dividerBg: '#79b0e2',
    });
    const darkAliasSnapshot = await page.evaluate(readIconAliasSnapshot);
    expect(darkAliasSnapshot.iconExpression.length).toBeGreaterThan(0);
    expect(darkAliasSnapshot.iconResolved).toBe(darkAliasSnapshot.inkResolved);

    const darkFooterBySystem = await page.evaluate(readFooterBackgrounds);
    expect(darkFooterBySystem).toEqual({
      before: 'rgb(35, 73, 120)',
      scallopFrame: 'rgb(35, 73, 120)',
    });
    const darkFooterMotifBySystem = await page.evaluate(readFooterMotifSnapshot);
    darkFooterMotifBySystem.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(darkFooterMotifBySystem.expectedAccentWhite);
    });
    const darkArchBySystem = await page.evaluate(readAboutArchSnapshot);
    expect(darkArchBySystem).not.toBeNull();
    expect(darkArchBySystem!.archColor).toBe(darkArchBySystem!.expectedAccentOrange);
    expect(darkArchBySystem!.archPathStroke).toBe(darkArchBySystem!.expectedAccentOrange);

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
      footerBg: '#8cbfdb',
      buttonBg: '#c0bd6d',
      buttonText: '#000',
      buttonTextOutlined: '#000',
      buttonArrow: '#000000d9',
      buttonBorder: '#c0bd6d',
      inkBg: '#c0bd6d',
      dividerBg: '#c0bd6d',
    });
    const lightAliasSnapshot = await page.evaluate(readIconAliasSnapshot);
    expect(lightAliasSnapshot.iconExpression.length).toBeGreaterThan(0);
    expect(lightAliasSnapshot.iconResolved).toBe(lightAliasSnapshot.inkResolved);

    const lightFooterByStorage = await page.evaluate(readFooterBackgrounds);
    expect(lightFooterByStorage).toEqual({
      before: 'rgb(140, 191, 219)',
      scallopFrame: 'rgb(140, 191, 219)',
    });
    const lightFooterMotifByStorage = await page.evaluate(readFooterMotifSnapshot);
    lightFooterMotifByStorage.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(lightFooterMotifByStorage.expectedAccentWhite);
    });
    const lightArchByStorage = await page.evaluate(readAboutArchSnapshot);
    expect(lightArchByStorage).not.toBeNull();
    expect(lightArchByStorage!.archColor).toBe(lightArchByStorage!.expectedAccentOrange);
    expect(lightArchByStorage!.archPathStroke).toBe(lightArchByStorage!.expectedAccentOrange);

    await page.evaluate(() => {
      window.localStorage.setItem('vh-theme', 'dark');
    });
    await page.reload();

    const darkByStorage = await page.evaluate(readThemeTokens);
    expect(darkByStorage).toEqual({
      theme: 'dark',
      textDefault: '#efe2d2',
      bgDefault: '#173a66',
      ticketOrangeCritical: '#6a9ecf',
      buttonFloatingBg: '#234978',
      footerBg: '#234978',
      buttonBg: '#79b0e2',
      buttonText: '#173a66',
      buttonTextOutlined: '#efe2d2',
      buttonArrow: '#173a66',
      buttonBorder: '#79b0e2',
      inkBg: '#79b0e2',
      dividerBg: '#79b0e2',
    });
    const darkFooterByStorage = await page.evaluate(readFooterBackgrounds);
    expect(darkFooterByStorage).toEqual({
      before: 'rgb(35, 73, 120)',
      scallopFrame: 'rgb(35, 73, 120)',
    });
    const darkFooterMotifByStorage = await page.evaluate(readFooterMotifSnapshot);
    darkFooterMotifByStorage.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(darkFooterMotifByStorage.expectedAccentWhite);
    });

    const darkHasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(darkHasHorizontalOverflow).toBe(false);
  });

  test('badge uses outlined in dark for default type and restores tone in light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
      window.localStorage.setItem('vh-theme', 'light');
    });

    const lightSnapshot = await page.evaluate(readBadgeThemeSnapshot);
    expect(lightSnapshot).not.toBeNull();
    expect(lightSnapshot!.defaultBadge.dataBadgeType).toBe('default');
    expect(lightSnapshot!.defaultBadge.backgroundColor).toBe(lightSnapshot!.expectedAccentBlue);
    expect(Number.parseFloat(lightSnapshot!.defaultBadge.borderTopWidth)).toBe(0);
    expect(lightSnapshot!.explicitOutlined.dataBadgeType).toBe('outlined');
    expect(lightSnapshot!.explicitOutlined.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(Number.parseFloat(lightSnapshot!.explicitOutlined.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(lightSnapshot!.explicitOutlined.borderTopColor).toBe(lightSnapshot!.expectedTextSecondary);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      window.localStorage.setItem('vh-theme', 'dark');
    });

    const darkSnapshot = await page.evaluate(readBadgeThemeSnapshot);
    expect(darkSnapshot).not.toBeNull();
    expect(darkSnapshot!.defaultBadge.dataBadgeType).toBe('default');
    expect(darkSnapshot!.defaultBadge.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(Number.parseFloat(darkSnapshot!.defaultBadge.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(darkSnapshot!.defaultBadge.borderTopColor).toBe(darkSnapshot!.expectedTextSecondary);
    expect(darkSnapshot!.explicitOutlined.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(Number.parseFloat(darkSnapshot!.explicitOutlined.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(darkSnapshot!.explicitOutlined.borderTopColor).toBe(darkSnapshot!.expectedTextSecondary);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
      window.localStorage.setItem('vh-theme', 'light');
    });

    const lightAgainSnapshot = await page.evaluate(readBadgeThemeSnapshot);
    expect(lightAgainSnapshot).not.toBeNull();
    expect(lightAgainSnapshot!.defaultBadge.backgroundColor).toBe(lightAgainSnapshot!.expectedAccentBlue);
    expect(Number.parseFloat(lightAgainSnapshot!.defaultBadge.borderTopWidth)).toBe(0);
    expect(lightAgainSnapshot!.explicitOutlined.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(Number.parseFloat(lightAgainSnapshot!.explicitOutlined.borderTopWidth)).toBeGreaterThanOrEqual(1);
    expect(lightAgainSnapshot!.explicitOutlined.borderTopColor).toBe(lightAgainSnapshot!.expectedTextSecondary);
  });

  test('home hero mockups switch themed sources in both directions', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();

    await page.evaluate((storageKey) => {
      document.documentElement.dataset.theme = 'light';
      try {
        window.localStorage.setItem(storageKey, 'light');
      } catch {
        // Ignore storage access failures in restricted contexts.
      }
    }, themeStorageKey);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('light');

    const lightSnapshot = await page.evaluate(readHomeThemedMockups);
    expect(lightSnapshot).not.toBeNull();
    expect(lightSnapshot!.mockupRedSrc).toBe('/media/home/mockup-red.webp');
    expect(lightSnapshot!.mockupPathSrc).toBe('/media/home/mockup-path.webp');

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
            const target = document.querySelector('.home-hero-asset--mockup-red img');
            return target instanceof HTMLImageElement ? target.getAttribute('src') : null;
          }),
        { timeout: 2000 },
      )
      .toBe('/media/home/mockup-clouds.webp');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const target = document.querySelector('.home-hero-asset--mockup-path img');
            return target instanceof HTMLImageElement ? target.getAttribute('src') : null;
          }),
        { timeout: 2000 },
      )
      .toBe('/media/home/mockup-evening.webp');

    await page.click(floatingThemeButtonSelector);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('light');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const target = document.querySelector('.home-hero-asset--mockup-red img');
            return target instanceof HTMLImageElement ? target.getAttribute('src') : null;
          }),
        { timeout: 2000 },
      )
      .toBe('/media/home/mockup-red.webp');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const target = document.querySelector('.home-hero-asset--mockup-path img');
            return target instanceof HTMLImageElement ? target.getAttribute('src') : null;
          }),
        { timeout: 2000 },
      )
      .toBe('/media/home/mockup-path.webp');
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

  test('floating theme button triggers haptic vibration on tap when supported', async ({ page }) => {
    await page.addInitScript(installVibrateMockInitScript);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();

    const preClickSnapshot = await page.evaluate(readVibrateMockSnapshot);
    expect(preClickSnapshot.installed).toBe(true);
    expect(preClickSnapshot.calls).toHaveLength(0);

    await page.click(floatingThemeButtonSelector);

    await expect
      .poll(() => page.evaluate(readVibrateMockSnapshot), { timeout: 2000 })
      .toMatchObject({
        installed: true,
      });

    const postClickSnapshot = await page.evaluate(readVibrateMockSnapshot);
    expect(postClickSnapshot.calls.length).toBeGreaterThan(0);
    const latestPattern = postClickSnapshot.calls.at(-1);
    expect(Array.isArray(latestPattern)).toBe(true);
    expect((latestPattern as number[]).length).toBeGreaterThan(0);
  });

  test('dark soft navigation keeps html theme and floating button state stable', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();

    await page.evaluate((storageKey) => {
      document.documentElement.dataset.theme = 'dark';
      try {
        window.localStorage.setItem(storageKey, 'dark');
      } catch {
        // Ignore storage access failures in restricted contexts.
      }
    }, themeStorageKey);

    await expect
      .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')), {
        timeout: 2000,
      })
      .toBe('dark');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
            return button instanceof HTMLButtonElement ? button.dataset.themeState ?? null : null;
          }),
        { timeout: 2000 },
      )
      .toBe('dark');

    const samplesPromise = page.evaluate(() => {
      return new Promise<
        Array<{ t: number; path: string; htmlTheme: string | null; floatingState: string | null }>
      >((resolve) => {
        const start = performance.now();
        const samples: Array<{ t: number; path: string; htmlTheme: string | null; floatingState: string | null }> = [];

        const sample = () => {
          const button = document.querySelector('.floating-theme-button[data-floating-theme-button]');
          samples.push({
            t: Math.round(performance.now() - start),
            path: window.location.pathname,
            htmlTheme: document.documentElement.getAttribute('data-theme'),
            floatingState: button instanceof HTMLButtonElement ? button.dataset.themeState ?? null : null,
          });

          if (performance.now() - start < 1200) {
            window.requestAnimationFrame(sample);
            return;
          }

          resolve(samples);
        };

        sample();
      });
    });

    await page.click('a[data-nav-id="gallery"]');
    await expect(page).toHaveURL(/\/gallery\/?$/);

    const samples = await samplesPromise;
    expect(samples.some((sample) => sample.path === '/gallery')).toBe(true);
    expect(samples.filter((sample) => sample.htmlTheme !== 'dark')).toEqual([]);
    expect(samples.filter((sample) => sample.floatingState !== 'dark')).toEqual([]);
  });

  test('button and divider tokens are applied to variants and waves', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    await page.evaluate((storageKey) => {
      document.documentElement.dataset.theme = 'light';
      try {
        window.localStorage.setItem(storageKey, 'light');
      } catch {
        // Ignore storage access failures in restricted contexts.
      }
    }, themeStorageKey);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('light');

    const homeWaveLight = await page.evaluate(readWaveColorSnapshot, [
      '.site-nav-wave-rail .quantized-wave',
      '.design-tools-divider.design-tools-wave-span-1',
      '.final-cta-divider-bleed .quantized-wave',
    ]);
    homeWaveLight.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(homeWaveLight.expectedColor);
    });
    const finalCtaOrbLight = await page.evaluate(readFinalCtaOrbSnapshot);
    expect(finalCtaOrbLight).not.toBeNull();
    expect(finalCtaOrbLight!.hasThemedClass).toBe(true);
    expect(finalCtaOrbLight!.actualColor).toBe(finalCtaOrbLight!.expectedAccentBlue);
    expect(finalCtaOrbLight!.maskImage === 'none' && finalCtaOrbLight!.webkitMaskImage === 'none').toBe(false);

    const homeDefaultLight = await page.evaluate(readButtonTokenSnapshot, '.home-hero-cta .ui-button--default');
    expect(homeDefaultLight.present).toBe(true);
    expect(homeDefaultLight.actual?.backgroundColor).toBe(homeDefaultLight.expected.bg);
    expect(homeDefaultLight.actual?.textColor).toBe(homeDefaultLight.expected.text);
    expect(homeDefaultLight.actual?.borderTopColor).toBe(homeDefaultLight.expected.border);
    expect(Number.parseFloat(homeDefaultLight.actual?.borderTopWidth ?? '0')).toBeGreaterThanOrEqual(1);

    const homeBorderedLight = await page.evaluate(readButtonTokenSnapshot, [
      '.quotes-section .ui-button--bordered',
      '--color-button-text-outlined',
    ]);
    expect(homeBorderedLight.present).toBe(true);
    expect(homeBorderedLight.actual?.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(homeBorderedLight.actual?.textColor).toBe(homeBorderedLight.expected.text);
    expect(homeBorderedLight.actual?.borderTopColor).toBe(homeBorderedLight.expected.border);
    expect(Number.parseFloat(homeBorderedLight.actual?.borderTopWidth ?? '0')).toBeGreaterThanOrEqual(2);
    await page.hover('.quotes-section .ui-button--bordered');
    const homeBorderedLightHover = await page.evaluate(readButtonTokenSnapshot, [
      '.quotes-section .ui-button--bordered',
      '--color-button-text',
    ]);
    expect(homeBorderedLightHover.present).toBe(true);
    expect(homeBorderedLightHover.actual?.textColor).toBe(homeBorderedLightHover.expected.text);

    await page.evaluate((storageKey) => {
      document.documentElement.dataset.theme = 'dark';
      try {
        window.localStorage.setItem(storageKey, 'dark');
      } catch {
        // Ignore storage access failures in restricted contexts.
      }
    }, themeStorageKey);
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    const homeWaveDark = await page.evaluate(readWaveColorSnapshot, [
      '.site-nav-wave-rail .quantized-wave',
      '.design-tools-divider.design-tools-wave-span-1',
      '.final-cta-divider-bleed .quantized-wave',
    ]);
    homeWaveDark.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(homeWaveDark.expectedColor);
    });
    const finalCtaOrbDark = await page.evaluate(readFinalCtaOrbSnapshot);
    expect(finalCtaOrbDark).not.toBeNull();
    expect(finalCtaOrbDark!.hasThemedClass).toBe(true);
    expect(finalCtaOrbDark!.actualColor).toBe(finalCtaOrbDark!.expectedAccentBlue);
    expect(finalCtaOrbDark!.maskImage === 'none' && finalCtaOrbDark!.webkitMaskImage === 'none').toBe(false);

    const homeDefaultDark = await page.evaluate(readButtonTokenSnapshot, '.home-hero-cta .ui-button--default');
    expect(homeDefaultDark.present).toBe(true);
    expect(homeDefaultDark.actual?.backgroundColor).toBe(homeDefaultDark.expected.bg);
    expect(homeDefaultDark.actual?.textColor).toBe(homeDefaultDark.expected.text);
    expect(homeDefaultDark.actual?.borderTopColor).toBe(homeDefaultDark.expected.border);
    expect(Number.parseFloat(homeDefaultDark.actual?.borderTopWidth ?? '0')).toBeGreaterThanOrEqual(1);

    await page.goto('/fora');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    const foraBorderedIconDark = await page.evaluate(
      readButtonTokenSnapshot,
      ['.case-switcher-button--next.ui-button--bordered-icon', '--color-button-text-outlined', '--color-button-bg'],
    );
    expect(foraBorderedIconDark.present).toBe(true);
    expect(foraBorderedIconDark.actual?.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(foraBorderedIconDark.actual?.textColor).toBe(foraBorderedIconDark.expected.text);
    expect(foraBorderedIconDark.actual?.borderTopColor).toBe(foraBorderedIconDark.expected.border);
    expect(Number.parseFloat(foraBorderedIconDark.actual?.borderTopWidth ?? '0')).toBeGreaterThanOrEqual(2);
    expect(foraBorderedIconDark.actual?.iconColor).toBe(foraBorderedIconDark.expected.arrow);
    const nextCaseButton = page.locator('.case-switcher-button--next.ui-button--bordered-icon');
    await nextCaseButton.scrollIntoViewIfNeeded();
    const nextCaseButtonBox = await nextCaseButton.boundingBox();
    expect(nextCaseButtonBox).not.toBeNull();
    await page.mouse.move(
      nextCaseButtonBox!.x + nextCaseButtonBox!.width / 2,
      nextCaseButtonBox!.y + nextCaseButtonBox!.height / 2,
    );
    const foraBorderedIconDarkHover = await page.evaluate(readButtonTokenSnapshot, [
      '.case-switcher-button--next.ui-button--bordered-icon',
      '--color-button-text',
      '--color-button-arrow',
    ]);
    expect(foraBorderedIconDarkHover.present).toBe(true);
    await expect
      .poll(
        () =>
          page.evaluate(readButtonTokenSnapshot, [
            '.case-switcher-button--next.ui-button--bordered-icon',
            '--color-button-text',
            '--color-button-arrow',
          ]),
        { timeout: 2000 },
      )
      .toMatchObject({
        present: true,
        actual: {
          textColor: foraBorderedIconDarkHover.expected.text,
          iconColor: foraBorderedIconDarkHover.expected.arrow,
        },
      });

    const foraWaveDark = await page.evaluate(readWaveColorSnapshot, [
      '.site-nav-wave-rail .quantized-wave',
      '.fora-intro-divider',
    ]);
    foraWaveDark.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(foraWaveDark.expectedColor);
    });

    await page.goto('/gallery');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('dark');

    const galleryWaveDark = await page.evaluate(readWaveColorSnapshot, [
      '.site-nav-wave-rail .quantized-wave',
      '.final-cta-divider-bleed .quantized-wave',
    ]);
    galleryWaveDark.entries.forEach((entry) => {
      expect(entry.present).toBe(true);
      expect(entry.color).toBe(galleryWaveDark.expectedColor);
    });
  });

  test('floating theme button is hidden in temporary adaptive mode on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/temp-adaptive');

    await expect(page.locator('.temporary-adaptive-notice')).toBeVisible();
    await expect(page.locator('.site-desktop-shell')).toBeHidden();
    await expect(page.locator(floatingThemeButtonSelector)).toBeHidden();
  });
});
