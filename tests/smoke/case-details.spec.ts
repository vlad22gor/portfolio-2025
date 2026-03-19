import { expect, test, type Page } from '@playwright/test';

test.describe('Case details smoke', () => {
  test.use({ viewport: { width: 1440, height: 1100 } });

  const assertIntroScreensMockupDimensions = async (
    page: Page,
    variant: 'phone' | 'tablet',
    expected: {
      left: { width: number; height: number };
      center: { width: number; height: number };
      right: { width: number; height: number };
    },
  ) => {
    const measured = await page.evaluate((currentVariant) => {
      const section = document.querySelector(`.fora-intro-screens-section--${currentVariant}`);
      if (!(section instanceof HTMLElement)) {
        return null;
      }

      const read = (position: 'left' | 'center' | 'right') => {
        const node = section.querySelector(`.fora-intro-screens-${currentVariant}-item--${position} .device-mockup`);
        if (!(node instanceof HTMLElement)) {
          return null;
        }
        const rect = node.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
        };
      };

      return {
        left: read('left'),
        center: read('center'),
        right: read('right'),
      };
    }, variant);

    expect(measured).not.toBeNull();
    expect(measured?.left).not.toBeNull();
    expect(measured?.center).not.toBeNull();
    expect(measured?.right).not.toBeNull();

    const tolerancePx = 1;
    const assertNear = (actual: number, target: number, metricName: string) => {
      expect(
        Math.abs(actual - target),
        `${variant} intro screens ${metricName}: expected ~${target}px, got ${actual}px`,
      ).toBeLessThanOrEqual(tolerancePx);
    };

    assertNear(measured!.left!.width, expected.left.width, 'left width');
    assertNear(measured!.left!.height, expected.left.height, 'left height');
    assertNear(measured!.center!.width, expected.center.width, 'center width');
    assertNear(measured!.center!.height, expected.center.height, 'center height');
    assertNear(measured!.right!.width, expected.right.width, 'right width');
    assertNear(measured!.right!.height, expected.right.height, 'right height');

    expect(measured!.center!.width).toBeGreaterThan(measured!.left!.width);
    expect(measured!.center!.width).toBeGreaterThan(measured!.right!.width);
  };

  const assertCriticalMockupsAreStable = async (page: Page, expectedCount: number) => {
    const criticalMockups = page.locator('.site-desktop-shell .device-mockup[data-device-priority="critical"]');
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
          document.querySelectorAll('.site-desktop-shell .device-mockup[data-device-priority="critical"]'),
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

  const assertIntroScreensPerimeterIntegrity = async (
    page: Page,
    variant: 'phone' | 'tablet',
  ) => {
    const measured = await page.evaluate((currentVariant) => {
      const section = document.querySelector(`.fora-intro-screens-section--${currentVariant}`);
      if (!(section instanceof HTMLElement)) {
        return null;
      }

      const surface = section.querySelector('.fora-intro-screens-surface.quantized-perimeter');
      if (!(surface instanceof HTMLElement)) {
        return null;
      }

      const frame = surface.querySelector('.scallop-frame');
      const rect = surface.getBoundingClientRect();
      const viewBox = frame instanceof SVGSVGElement ? frame.getAttribute('viewBox') : null;
      if (!viewBox) {
        return null;
      }

      const viewBoxParts = viewBox
        .trim()
        .split(/\s+/)
        .map((part) => Number.parseFloat(part));
      const viewBoxHeight =
        viewBoxParts.length === 4 && Number.isFinite(viewBoxParts[3]) ? viewBoxParts[3] : null;

      return {
        rows: surface.dataset.perimeterRows ?? null,
        snapMismatch: surface.dataset.perimeterSnapMismatch ?? null,
        rectHeight: rect.height,
        viewBoxHeight,
      };
    }, variant);

    expect(measured).not.toBeNull();
    expect(measured?.rows).toBe('9');
    expect(measured?.snapMismatch).not.toBe('true');
    expect(measured?.viewBoxHeight).not.toBeNull();

    const delta = Math.abs((measured?.rectHeight ?? 0) - (measured?.viewBoxHeight ?? 0));
    expect(
      delta,
      `${variant} intro perimeter is stretched: rectHeight=${measured?.rectHeight}, viewBoxHeight=${measured?.viewBoxHeight}`,
    ).toBeLessThanOrEqual(1);
  };

  const assertProcessTicketsRowsRevealSequentially = async (page: Page, sectionSelector: string) => {
    const measured = await page.evaluate(async (selector) => {
      const section = document.querySelector(selector);
      if (!(section instanceof HTMLElement)) {
        return null;
      }

      const rows = Array.from(section.querySelectorAll('.case-process-section__tickets-row')).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );
      if (rows.length < 2) {
        return {
          rowCount: rows.length,
          row1StartMs: null,
          row2StartMs: null,
          deltaMs: null,
        };
      }

      const rowsContainer = section.querySelector('.case-process-section__tickets-rows');
      if (rowsContainer instanceof HTMLElement) {
        rowsContainer.scrollIntoView({ block: 'center', behavior: 'instant' });
      } else {
        rows[0].scrollIntoView({ block: 'center', behavior: 'instant' });
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const timeline: Array<{ t: number; firstOpacities: Array<number | null> }> = [];
      const startedAt = performance.now();
      const sampleCount = 24;
      const sampleIntervalMs = 50;

      const readFirstOpacity = (row: HTMLElement): number | null => {
        const firstTicket = row.querySelector('.case-process-ticket-stagger-item');
        if (!(firstTicket instanceof HTMLElement)) {
          return null;
        }
        return Number.parseFloat(getComputedStyle(firstTicket).opacity);
      };

      for (let index = 0; index < sampleCount; index += 1) {
        timeline.push({
          t: performance.now() - startedAt,
          firstOpacities: [readFirstOpacity(rows[0]), readFirstOpacity(rows[1])],
        });
        await new Promise((resolve) => setTimeout(resolve, sampleIntervalMs));
      }

      const startThreshold = 0.05;
      const resolveStartMs = (rowIndex: number) => {
        const firstVisibleSample = timeline.find((sample) => {
          const value = sample.firstOpacities[rowIndex];
          return typeof value === 'number' && Number.isFinite(value) && value > startThreshold;
        });
        return firstVisibleSample ? Number(firstVisibleSample.t.toFixed(1)) : null;
      };

      const row1StartMs = resolveStartMs(0);
      const row2StartMs = resolveStartMs(1);
      const deltaMs =
        row1StartMs !== null && row2StartMs !== null ? Number((row2StartMs - row1StartMs).toFixed(1)) : null;

      return {
        rowCount: rows.length,
        row1StartMs,
        row2StartMs,
        deltaMs,
      };
    }, sectionSelector);

    expect(measured).not.toBeNull();
    expect(measured?.rowCount).toBeGreaterThanOrEqual(2);
    expect(measured?.row1StartMs).not.toBeNull();
    expect(measured?.row2StartMs).not.toBeNull();
    expect(measured?.deltaMs).not.toBeNull();
    expect(measured?.deltaMs ?? 0).toBeGreaterThanOrEqual(250);
  };

  test('/fora renders detail config with key sections and active cases nav', async ({ page }) => {
    await page.goto('/fora');

    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);
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
    const foraTicketRows = foraProcessSection.locator('.case-process-section__tickets-row');
    await expect(foraProcessSection).toHaveAttribute('data-case-process-ticket-variant', 'square-36');
    await expect(foraFirstTicket).toHaveAttribute('data-perimeter-shape', 'rectangle');
    await expect(foraFirstTicket).toHaveAttribute('data-perimeter-step', '36');
    await expect(foraTicketRows).toHaveCount(2);
    await expect(foraTicketRows.nth(0)).toHaveAttribute('data-motion-inview', 'process-tickets-row-stagger-dynamic-v1');
    await expect(foraTicketRows.nth(0)).toHaveAttribute(
      'data-motion-sequence-source',
      'case-process-fora-tickets-row-0-stagger-complete-v1',
    );
    await expect(foraTicketRows.nth(1)).toHaveAttribute('data-motion-inview', 'process-tickets-row-stagger-dynamic-v1');
    await expect(foraTicketRows.nth(1)).toHaveAttribute(
      'data-motion-sequence-after',
      'case-process-fora-tickets-row-0-stagger-complete-v1',
    );
    await expect(foraTicketRows.nth(1)).toHaveAttribute(
      'data-motion-sequence-source',
      'case-process-fora-tickets-row-1-stagger-complete-v1',
    );
    await assertProcessTicketsRowsRevealSequentially(page, '.case-process-section--fora');

    await assertCriticalMockupsAreStable(page, 4);
    await assertIntroScreensMockupDimensions(page, 'phone', {
      left: { width: 174, height: 357 },
      center: { width: 244, height: 501 },
      right: { width: 174, height: 357 },
    });
    await assertIntroScreensPerimeterIntegrity(page, 'phone');
    await expect(page.locator('.fora-feature-cards-section .device-mockup').first()).toHaveAttribute(
      'data-device-priority',
      'lazy',
    );
  });

  test('/kissa renders detail config with artifact photos section and no fallback blocks', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);
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
    const kissaTicketRows = kissaProcessSection.locator('.case-process-section__tickets-row');
    await expect(kissaProcessSection).toHaveAttribute('data-case-process-ticket-variant', 'circle-24');
    await expect(kissaFirstTicket).toHaveAttribute('data-perimeter-shape', 'circle');
    await expect(kissaFirstTicket).toHaveAttribute('data-perimeter-step', '24');
    await expect(kissaTicketRows).toHaveCount(1);
    await expect(kissaTicketRows.first()).toHaveAttribute('data-motion-inview', 'process-tickets-row-stagger-dynamic-v1');
    await expect(kissaTicketRows.first()).toHaveAttribute(
      'data-motion-sequence-source',
      'case-process-kissa-tickets-row-0-stagger-complete-v1',
    );
    expect(await kissaTicketRows.first().getAttribute('data-motion-sequence-after')).toBeNull();

    await expect(page.locator('.section-stack')).toHaveCount(0);
    await expect(page.locator('.metrics-grid')).toHaveCount(0);
    await expect(page.locator('nav.case-pager')).toHaveCount(0);

    await assertCriticalMockupsAreStable(page, 4);
    await assertIntroScreensMockupDimensions(page, 'tablet', {
      left: { width: 211, height: 362 },
      center: { width: 296, height: 508 },
      right: { width: 211, height: 362 },
    });
    await assertIntroScreensPerimeterIntegrity(page, 'tablet');
    await expect(page.locator('.kissa-feature-cards .device-mockup').first()).toHaveAttribute(
      'data-device-priority',
      'lazy',
    );
  });

  test('/fora case switcher next waits for fade-end and starts intro after route transition', async ({ page }) => {
    await page.goto('/fora');

    const switcher = page.locator('.case-switcher-section');
    await switcher.scrollIntoViewIfNeeded();
    await expect(page.locator('.case-switcher-button--next')).toBeVisible();

    const scrollBeforeClick = await page.evaluate(() => window.scrollY);
    expect(scrollBeforeClick).toBeGreaterThan(0);

    await page.evaluate(() => {
      const runtimeWindow = window as Window & {
        __introTransitionAudit?: {
          startedAt: number;
          sawTransitionWindow: boolean;
          animatedDuringTransition: boolean;
          screensAnimatedDuringTransition: boolean;
        };
      };

      runtimeWindow.__introTransitionAudit = {
        startedAt: performance.now(),
        sawTransitionWindow: false,
        animatedDuringTransition: false,
        screensAnimatedDuringTransition: false,
      };
      const maxAuditDurationMs = 2200;
      const tick = () => {
        const audit = runtimeWindow.__introTransitionAudit;
        if (!audit) {
          return;
        }
        const elapsed = performance.now() - audit.startedAt;
        const transitionActive =
          document.documentElement.hasAttribute('data-astro-transition') && window.location.pathname === '/kissa';
        const intro = document.querySelector('.kissa-intro-section');
        const introAnimated = intro instanceof HTMLElement && intro.getAttribute('data-motion-inview-animated') === 'true';
        const introScreens = document.querySelector('.kissa-intro-screens');
        const screensAnimated =
          introScreens instanceof HTMLElement && introScreens.getAttribute('data-motion-inview-animated') === 'true';
        if (transitionActive) {
          audit.sawTransitionWindow = true;
          if (introAnimated) {
            audit.animatedDuringTransition = true;
          }
          if (screensAnimated) {
            audit.screensAnimatedDuringTransition = true;
          }
        }
        if (elapsed < maxAuditDurationMs) {
          window.requestAnimationFrame(tick);
        }
      };
      window.requestAnimationFrame(tick);
    });

    await page.locator('.case-switcher-button--next').click({ noWaitAfter: true });
    await page.waitForTimeout(80);

    const preNavigationState = await page.evaluate(() => ({
      path: window.location.pathname,
      leavingState: document.querySelector('main#content')?.getAttribute('data-case-switcher-leaving') ?? null,
      mainOpacity: Number.parseFloat(getComputedStyle(document.querySelector('main#content')).opacity),
      scrollY: window.scrollY,
    }));

    expect(preNavigationState.path).toBe('/fora');
    expect(preNavigationState.leavingState).toBe('true');
    expect(preNavigationState.mainOpacity).toBeLessThan(1);
    expect(preNavigationState.scrollY).toBeGreaterThan(0);

    await expect(page).toHaveURL(/\/kissa\/?$/);
    await expect(page.locator('.kissa-intro-section')).toBeVisible();

    const transitionWindowCheck = await page.evaluate(() => {
      const runtimeWindow = window as Window & {
        __introTransitionAudit?: {
          startedAt: number;
          sawTransitionWindow: boolean;
          animatedDuringTransition: boolean;
          screensAnimatedDuringTransition: boolean;
        };
      };
      return runtimeWindow.__introTransitionAudit ?? null;
    });
    if (transitionWindowCheck?.sawTransitionWindow) {
      expect(transitionWindowCheck.animatedDuringTransition).toBe(false);
      expect(transitionWindowCheck.screensAnimatedDuringTransition).toBe(false);
    }

    await expect
      .poll(
        async () =>
          page.evaluate(() => document.querySelector('.kissa-intro-section')?.getAttribute('data-motion-inview-animated')),
        {
          timeout: 2500,
          message: 'Intro stagger should start after route transition settles',
        },
      )
      .toBe('true');

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => document.querySelector('.kissa-intro-screens')?.getAttribute('data-motion-inview-animated'),
          ),
        {
          timeout: 2500,
          message: 'Intro screens should start only after route transition settles',
        },
      )
      .toBe('true');

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const intro = document.querySelector('.kissa-intro-section');
            const firstStage = intro?.querySelector('[data-motion-stage-item][data-motion-stagger-index="0"]');
            if (!(firstStage instanceof HTMLElement)) {
              return null;
            }
            return Number.parseFloat(Number.parseFloat(getComputedStyle(firstStage).opacity).toFixed(3));
          }),
        {
          timeout: 2500,
          message: 'First intro stage item should finish opacity animation',
        },
      )
      .toBe(1);

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const introScreens = document.querySelector('.kissa-intro-screens');
            if (!(introScreens instanceof HTMLElement)) {
              return null;
            }
            return Number.parseFloat(Number.parseFloat(getComputedStyle(introScreens).opacity).toFixed(3));
          }),
        {
          timeout: 2500,
          message: 'Intro screens should finish element opacity animation',
        },
      )
      .toBe(1);

    await expect
      .poll(async () => page.evaluate(() => window.scrollY), {
        timeout: 2500,
        message: 'After navigation the new case page should reset scroll to top',
      })
      .toBe(0);
    await expect
      .poll(async () => page.evaluate(() => window.sessionStorage.getItem('__case-switcher-intro-sync')))
      .toBeNull();
  });

  test('/fora video mockup covers screen bounds without seams', async ({ page }) => {
    await page.goto('/fora');

    const coverage = await page.evaluate(() => {
      const video = document.querySelector('.fora-feature-cards-section video.device-mockup__media');
      const screen = video?.closest('.device-mockup')?.querySelector('.device-mockup__screen');
      if (!(video instanceof HTMLVideoElement) || !(screen instanceof HTMLElement)) {
        return null;
      }
      const screenRect = screen.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();
      const epsilon = 0.02;
      return {
        covers:
          videoRect.left <= screenRect.left + epsilon &&
          videoRect.top <= screenRect.top + epsilon &&
          videoRect.right >= screenRect.right - epsilon &&
          videoRect.bottom >= screenRect.bottom - epsilon,
      };
    });

    expect(coverage).not.toBeNull();
    expect(coverage!.covers).toBe(true);
  });
});
