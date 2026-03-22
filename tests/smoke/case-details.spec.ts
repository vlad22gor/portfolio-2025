import { expect, test, type Page } from '@playwright/test';

const resolveProcessTicketProximity = ({
  width,
  baseStep,
  defaultCols,
  minStep = 8,
  minCols = 2,
  maxCols = 12,
  maxStepDelta = 6,
}: {
  width: number;
  baseStep: number;
  defaultCols: number;
  minStep?: number;
  minCols?: number;
  maxCols?: number;
  maxStepDelta?: number;
}) => {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeBaseStep = Math.max(1, Math.floor(baseStep));
  const safeDefaultCols = Math.max(1, Math.floor(defaultCols));
  const safeMinStep = Math.max(1, Math.floor(minStep));
  const safeMinCols = Math.max(1, Math.floor(minCols));
  const safeMaxCols = Math.max(safeMinCols, Math.floor(maxCols));
  const safeMaxStepDelta = Math.max(0, Math.floor(maxStepDelta));
  const minCandidateStep = Math.max(safeMinStep, safeBaseStep - safeMaxStepDelta);
  const maxCandidateStep = Math.min(safeWidth, safeBaseStep + safeMaxStepDelta);

  let best: { step: number; cols: number; size: number } | null = null;
  let bestScore: [number, number, number, number] | null = null;

  for (let step = minCandidateStep; step <= maxCandidateStep; step += 1) {
    for (let cols = safeMinCols; cols <= safeMaxCols; cols += 1) {
      const size = step * cols;
      if (size > safeWidth) {
        continue;
      }
      const score: [number, number, number, number] = [
        Math.abs(step - safeBaseStep),
        safeWidth - size,
        Math.abs(cols - safeDefaultCols),
        -size,
      ];
      if (
        bestScore === null ||
        score[0] < bestScore[0] ||
        (score[0] === bestScore[0] &&
          (score[1] < bestScore[1] ||
            (score[1] === bestScore[1] &&
              (score[2] < bestScore[2] || (score[2] === bestScore[2] && score[3] < bestScore[3])))))
      ) {
        best = { step, cols, size };
        bestScore = score;
      }
    }
  }

  if (best) {
    return { step: best.step, cols: best.cols };
  }

  const fallbackCols = Math.max(safeMinCols, Math.min(safeMaxCols, Math.round(safeWidth / safeBaseStep)));
  const fallbackStep = Math.max(safeMinStep, Math.floor(safeWidth / fallbackCols));
  return { step: fallbackStep, cols: Math.max(1, Math.floor(safeWidth / fallbackStep)) };
};

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
          criticalMockups.evaluateAll((nodes) => {
            const hasShellOnlyState = nodes.some((node) => {
              if (!(node instanceof HTMLElement)) {
                return false;
              }
              if (node.dataset.ready !== 'false') {
                return false;
              }
              const shell = node.querySelector('.device-mockup__shell');
              return shell instanceof HTMLImageElement && shell.complete && shell.naturalWidth > 0;
            });

            const allReady = nodes.every((node) => node instanceof HTMLElement && node.dataset.ready === 'true');
            const allShellsLoaded = nodes.every((node) => {
              const shell = node.querySelector('.device-mockup__shell');
              return shell instanceof HTMLImageElement && shell.complete && shell.naturalWidth > 0;
            });

            return {
              count: nodes.length,
              allReady,
              allShellsLoaded,
              hasShellOnlyState,
            };
          }),
        { timeout: 7000, message: 'Critical device mockups should be ready before first scroll' },
      )
      .toEqual({
        count: expectedCount,
        allReady: true,
        allShellsLoaded: true,
        hasShellOnlyState: false,
      });
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

  const assertDesktopOverviewHasSingleWave = async (page: Page, introSelector: string) => {
    const measured = await page.evaluate((selector) => {
      const intro = document.querySelector(selector);
      if (!(intro instanceof HTMLElement)) {
        return null;
      }

      const waves = Array.from(
        intro.querySelectorAll('.fora-intro-column--overview .fora-intro-divider-wrap .quantized-wave'),
      ).filter((node): node is HTMLElement => node instanceof HTMLElement);
      const visibleWaves = waves.filter((wave) => {
        const style = getComputedStyle(wave);
        const rect = wave.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      const desktopWave = intro.querySelector('.fora-intro-column--overview .fora-intro-divider--desktop');
      const mobileWave = intro.querySelector('.fora-intro-column--overview .fora-intro-divider--mobile');

      return {
        totalWaves: waves.length,
        visibleWaves: visibleWaves.length,
        desktopDisplay: desktopWave instanceof HTMLElement ? getComputedStyle(desktopWave).display : null,
        mobileDisplay: mobileWave instanceof HTMLElement ? getComputedStyle(mobileWave).display : null,
      };
    }, introSelector);

    expect(measured).not.toBeNull();
    expect(measured?.totalWaves).toBe(2);
    expect(measured?.visibleWaves).toBe(1);
    expect(measured?.desktopDisplay).toBe('block');
    expect(measured?.mobileDisplay).toBe('none');
  };

  test('/fora renders detail config with key sections and active cases nav', async ({ page }) => {
    test.setTimeout(60_000);
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
    await assertDesktopOverviewHasSingleWave(page, '.fora-intro-section');

    const desktopIntroTypography = await page.evaluate(() => {
      const title = document.querySelector('.fora-intro-title');
      if (!(title instanceof HTMLElement)) {
        return null;
      }
      const styles = getComputedStyle(title);
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        expectedT2Size: rootStyles.getPropertyValue('--type-t2-size').trim(),
      };
    });
    expect(desktopIntroTypography).not.toBeNull();
    expect(desktopIntroTypography!.fontSize).toBe(desktopIntroTypography!.expectedT2Size);
    expect(desktopIntroTypography!.lineHeight).not.toBe('38px');

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
    await assertDesktopOverviewHasSingleWave(page, '.kissa-intro-section');

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
    test.setTimeout(60_000);
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
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const main = document.querySelector('main#content');
            const path = window.location.pathname;
            const scrollY = window.scrollY;
            if (path === '/kissa') {
              return true;
            }
            if (!(main instanceof HTMLElement)) {
              return false;
            }
            const leavingState = main.getAttribute('data-case-switcher-leaving');
            const opacity = Number.parseFloat(getComputedStyle(main).opacity);
            return (
              path === '/fora' &&
              leavingState === 'true' &&
              Number.isFinite(opacity) &&
              opacity < 1 &&
              scrollY > 0
            );
          }),
        {
          timeout: 2500,
          message: 'Case switcher click should enter transition window or land on next route',
        },
      )
      .toBe(true);

    const preNavigationState = await page.evaluate(() => ({
      path: window.location.pathname,
      leavingState: document.querySelector('main#content')?.getAttribute('data-case-switcher-leaving') ?? null,
      mainOpacity: Number.parseFloat(getComputedStyle(document.querySelector('main#content')).opacity),
      scrollY: window.scrollY,
    }));

    expect(['/fora', '/kissa']).toContain(preNavigationState.path);
    if (preNavigationState.path === '/fora') {
      expect(preNavigationState.leavingState).toBe('true');
      expect(preNavigationState.mainOpacity).toBeLessThan(1);
      expect(preNavigationState.scrollY).toBeGreaterThan(0);
    }

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

test.describe('Case details mobile intro smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const swipeSlider = async (page: Page, direction: 'left' | 'right') => {
    const viewport = page.locator('[data-fora-intro-slider-viewport]').first();
    await viewport.scrollIntoViewIfNeeded();
    const box = await viewport.boundingBox();
    expect(box).not.toBeNull();

    const y = (box?.y ?? 0) + (box?.height ?? 0) * 0.5;
    const startX = (box?.x ?? 0) + (box?.width ?? 0) * (direction === 'left' ? 0.9 : 0.1);
    const endX = (box?.x ?? 0) + (box?.width ?? 0) * (direction === 'left' ? -0.2 : 1.2);

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 12 });
    await page.mouse.up();
  };

  const readSliderActiveLogicalIndex = async (page: Page) => {
    return page.evaluate(() => {
      const root = document.querySelector('[data-fora-intro-slider-root]');
      if (!(root instanceof HTMLElement)) {
        return null;
      }
      const raw = Number.parseInt(root.dataset.introSliderActiveIndex ?? '', 10);
      return Number.isFinite(raw) ? raw : null;
    });
  };

  const swipeArtifactSlider = async (page: Page, direction: 'left' | 'right') => {
    const viewport = page.locator('[data-kissa-artifact-slider-viewport]').first();
    await viewport.scrollIntoViewIfNeeded();
    const triggered = await page.evaluate((dir) => {
      const viewportNode = document.querySelector('[data-kissa-artifact-slider-viewport]');
      if (!(viewportNode instanceof HTMLElement)) {
        return false;
      }
      const rect = viewportNode.getBoundingClientRect();
      const y = rect.top + rect.height * 0.5;
      const startX = rect.left + rect.width * (dir === 'left' ? 0.85 : 0.15);
      const endX = rect.left + rect.width * (dir === 'left' ? 0.15 : 0.85);
      const pointerId = 101;
      const baseInit = {
        pointerId,
        pointerType: 'touch',
        isPrimary: true,
        bubbles: true,
        cancelable: true,
      } satisfies PointerEventInit;

      const dispatch = (type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number, buttons: number) => {
        viewportNode.dispatchEvent(
          new PointerEvent(type, {
            ...baseInit,
            clientX,
            clientY: y,
            buttons,
          }),
        );
      };

      dispatch('pointerdown', startX, 1);
      dispatch('pointermove', (startX + endX) * 0.5, 1);
      dispatch('pointermove', endX, 1);
      dispatch('pointerup', endX, 0);
      return true;
    }, direction);
    expect(triggered).toBe(true);
  };

  const readArtifactSliderActiveIndex = async (page: Page) => {
    return page.evaluate(() => {
      const root = document.querySelector('[data-kissa-artifact-slider-root]');
      if (!(root instanceof HTMLElement)) {
        return null;
      }
      const raw = Number.parseInt(root.dataset.artifactSliderActiveIndex ?? '', 10);
      return Number.isFinite(raw) ? raw : null;
    });
  };

  const readVisibleSectionClasses = async (page: Page) => {
    return page.evaluate(() => {
      const main = document.querySelector('main.page-shell--case-detail');
      if (!(main instanceof HTMLElement)) {
        return null;
      }
      return Array.from(main.children)
        .filter((node): node is HTMLElement => node instanceof HTMLElement && getComputedStyle(node).display !== 'none')
        .map((node) => node.className);
    });
  };

  const assertTextWrapBalanceSelectors = async (page: Page, selectors: string[]) => {
    const snapshot = await page.evaluate((targetSelectors) => {
      const supports =
        typeof CSS !== 'undefined' &&
        typeof CSS.supports === 'function' &&
        CSS.supports('text-wrap', 'balance');
      if (!supports) {
        return { supports, items: [] as Array<{ selector: string; found: boolean; textWrap: string | null }> };
      }

      const items = targetSelectors.map((selector) => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) {
          return { selector, found: false, textWrap: null };
        }
        const styles = getComputedStyle(node);
        const textWrap = (styles.textWrap || styles.getPropertyValue('text-wrap') || '').trim();
        return { selector, found: true, textWrap };
      });

      return { supports, items };
    }, selectors);

    expect(snapshot).not.toBeNull();
    test.skip(!snapshot!.supports, 'Browser does not support text-wrap: balance');

    for (const item of snapshot!.items) {
      expect(item.found, `${item.selector} should exist`).toBe(true);
      expect(item.textWrap, `${item.selector} should use text-wrap: balance`).toBe('balance');
    }
  };

  const readProcessTicketSnapshot = async (page: Page, sectionSelector: string) => {
    return page.evaluate((selector) => {
      const section = document.querySelector(selector);
      if (!(section instanceof HTMLElement)) {
        return null;
      }

      const ticketsRoot = section.querySelector('.case-process-section__tickets');
      if (!(ticketsRoot instanceof HTMLElement)) {
        return null;
      }

      const allItems = Array.from(section.querySelectorAll('.case-process-ticket-stagger-item')).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );
      const visibleItems = allItems.filter((node) => {
        const styles = getComputedStyle(node);
        if (styles.display === 'none' || styles.visibility === 'hidden') {
          return false;
        }
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      const tops = visibleItems
        .map((node) => Number(node.getBoundingClientRect().top.toFixed(1)))
        .sort((a, b) => a - b);
      const uniqueTops = tops.reduce<number[]>((acc, top) => {
        if (acc.length === 0 || Math.abs(top - acc[acc.length - 1]) > 1) {
          acc.push(top);
        }
        return acc;
      }, []);

      const rowCounts = uniqueTops.map(
        (rowTop) => visibleItems.filter((node) => Math.abs(node.getBoundingClientRect().top - rowTop) <= 1).length,
      );

      const firstVisibleTicket = visibleItems[0]?.querySelector('.case-process-ticket[data-quantized-perimeter]');
      const firstTicketRect = firstVisibleTicket instanceof HTMLElement ? firstVisibleTicket.getBoundingClientRect() : null;

      return {
        viewportWidth: Math.floor(window.innerWidth),
        ticketsWidth: Number(ticketsRoot.getBoundingClientRect().width.toFixed(2)),
        visibleTicketCount: visibleItems.length,
        uniqueRowCount: uniqueTops.length,
        rowCounts,
        firstTicketStep:
          firstVisibleTicket instanceof HTMLElement ? Number.parseFloat(firstVisibleTicket.dataset.perimeterStep ?? '') : null,
        firstTicketWidth: firstTicketRect ? Number(firstTicketRect.width.toFixed(2)) : null,
      };
    }, sectionSelector);
  };

  const assertProcessTicketContract = async ({
    page,
    sectionSelector,
    baseStep,
    defaultCols,
  }: {
    page: Page;
    sectionSelector: string;
    baseStep: number;
    defaultCols: number;
  }) => {
    const snapshot = await readProcessTicketSnapshot(page, sectionSelector);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.ticketsWidth).toBeLessThanOrEqual(480);
    expect(snapshot!.visibleTicketCount).toBe(4);
    expect(snapshot!.uniqueRowCount).toBe(2);
    expect(snapshot!.rowCounts).toEqual([2, 2]);

    const available = Math.max(1, Math.min(snapshot!.viewportWidth - 40, 480));
    const ticketTarget = Math.max(8, Math.floor((available - 20) / 2));
    const expected = resolveProcessTicketProximity({
      width: ticketTarget,
      baseStep,
      defaultCols,
      minStep: 8,
      minCols: 2,
      maxCols: 12,
      maxStepDelta: 6,
    });

    expect(snapshot!.firstTicketStep).toBe(expected.step);
    expect(Math.abs((snapshot!.firstTicketStep ?? 0) - baseStep)).toBeLessThanOrEqual(6);
    expect(snapshot!.firstTicketWidth).not.toBeNull();
    expect(Math.abs((snapshot!.firstTicketWidth ?? 0) - expected.step * expected.cols)).toBeLessThanOrEqual(1);
  };

  test('breakpoint split keeps case-details mobile profile through 847 and desktop from 848', async ({ page }) => {
    test.setTimeout(60_000);
    const cases = [
      { width: 768, expectMobileProfile: true },
      { width: 847, expectMobileProfile: true },
      { width: 848, expectMobileProfile: false },
      { width: 1024, expectMobileProfile: false },
      { width: 1359, expectMobileProfile: false },
      { width: 1360, expectMobileProfile: false },
    ] as const;
    const routes = ['/fora', '/kissa'] as const;

    for (const viewport of cases) {
      await page.setViewportSize({ width: viewport.width, height: 900 });
      for (const pathname of routes) {
        await page.goto(pathname);

        await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
        await expect(page.locator('.site-desktop-shell')).toBeVisible();

        if (viewport.expectMobileProfile) {
          await expect(page.locator('.fora-intro-screens-section--mobile-slider .fora-intro-screens-slider')).toBeVisible();
          await expect(page.locator('.fora-intro-screens-section--mobile-slider .fora-intro-screens-surface')).toBeHidden();
          await expect(page.locator('.case-challenge-scene-wrap--mobile')).toBeVisible();
          await expect(page.locator('.case-challenge-scene-wrap--desktop')).toBeHidden();
          continue;
        }

        await expect(page.locator('.fora-intro-screens-section--mobile-slider .fora-intro-screens-slider')).toBeHidden();
        await expect(page.locator('.fora-intro-screens-section--mobile-slider .fora-intro-screens-surface')).toBeVisible();
        await expect(page.locator('.case-challenge-scene-wrap--mobile')).toBeHidden();
        await expect(page.locator('.case-challenge-scene-wrap--desktop')).toBeVisible();
      }
    }
  });

  test('/fora mobile intro slider keeps visual gap 16, scale contract and loop', async ({ page }) => {
    await page.goto('/fora');

    await expect(page.locator('.fora-intro-screens-section--mobile-slider')).toBeVisible();
    await expect(page.locator('[data-fora-intro-slider-item]')).toHaveCount(5);

    const initialSnapshot = await page.evaluate(() => {
      const root = document.querySelector('[data-fora-intro-slider-root]');
      if (!(root instanceof HTMLElement)) {
        return null;
      }
      const viewport = root.querySelector('[data-fora-intro-slider-viewport]');
      const track = root.querySelector('[data-fora-intro-slider-track]');
      const items = Array.from(root.querySelectorAll('[data-fora-intro-slider-item]')).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );
      if (!(viewport instanceof HTMLElement) || !(track instanceof HTMLElement) || items.length === 0) {
        return null;
      }

      const resolveScaleX = (transform: string) => {
        if (!transform || transform === 'none') {
          return 1;
        }
        const matrixMatch = transform.match(/^matrix\((.+)\)$/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map((value) => Number.parseFloat(value.trim()));
          if (values.length >= 2 && values.every((value) => Number.isFinite(value))) {
            return Number(Math.hypot(values[0], values[1]).toFixed(4));
          }
        }
        const matrix3dMatch = transform.match(/^matrix3d\((.+)\)$/);
        if (matrix3dMatch) {
          const values = matrix3dMatch[1].split(',').map((value) => Number.parseFloat(value.trim()));
          if (values.length >= 3 && values.every((value) => Number.isFinite(value))) {
            return Number(Math.hypot(values[0], values[1], values[2]).toFixed(4));
          }
        }
        return null;
      };

      const viewportRect = viewport.getBoundingClientRect();
      const trackGapRaw = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0');
      const activeLogicalIndex = Number.parseInt(root.dataset.introSliderActiveIndex ?? '', 10);
      const cardWidth = Number.parseFloat(root.dataset.introSliderCardWidth ?? '');
      const cardHeight = Number.parseFloat(root.dataset.introSliderCardHeight ?? '');
      const step = Number.parseFloat(root.dataset.introSliderStep ?? '');
      const gridWidth = Number.parseFloat(root.dataset.introSliderGridWidth ?? '');
      const perimeterWidth = Number.parseFloat(root.dataset.introSliderPerimeterWidth ?? '');

      const itemsStats = items.map((item, index) => {
        const rect = item.getBoundingClientRect();
        const styles = getComputedStyle(item);
        const surface = item.querySelector('.gallery-card__surface--mock[data-quantized-perimeter]');
        const surfaceRect = surface instanceof HTMLElement ? surface.getBoundingClientRect() : null;
        const frame = surface?.querySelector('.scallop-frame');
        const viewBox = frame instanceof SVGSVGElement ? frame.getAttribute('viewBox') : null;
        const viewBoxHeight = viewBox
          ? Number.parseFloat(viewBox.trim().split(/\s+/)[3] ?? '')
          : Number.NaN;

        return {
          index,
          isActive: item.dataset.introSliderActive === 'true',
          logicalIndex: Number.parseInt(item.dataset.introSliderLogicalIndex ?? '', 10),
          physicalIndex: Number.parseInt(item.dataset.introSliderPhysicalIndex ?? '', 10),
          scaleX: resolveScaleX(styles.transform),
          left: Number(rect.left.toFixed(2)),
          right: Number(rect.right.toFixed(2)),
          width: Number(rect.width.toFixed(2)),
          height: Number(rect.height.toFixed(2)),
          centerY: Number((rect.top + rect.height / 2).toFixed(2)),
          surfaceLeft: surfaceRect ? Number(surfaceRect.left.toFixed(2)) : null,
          surfaceRight: surfaceRect ? Number(surfaceRect.right.toFixed(2)) : null,
          surfaceHeight: surfaceRect ? Number(surfaceRect.height.toFixed(2)) : null,
          perimeterRows: surface instanceof HTMLElement ? Number.parseInt(surface.dataset.perimeterRows ?? '', 10) : null,
          perimeterSnapMismatch: surface instanceof HTMLElement ? surface.dataset.perimeterSnapMismatch ?? null : null,
          viewBoxHeight: Number.isFinite(viewBoxHeight) ? Number(viewBoxHeight.toFixed(2)) : null,
        };
      });

      const activeIndex = itemsStats.findIndex((item) => item.isActive);
      const activeItem = activeIndex >= 0 ? itemsStats[activeIndex] : null;
      const leftItem = activeIndex > 0 ? itemsStats[activeIndex - 1] : null;
      const rightItem = activeIndex >= 0 && activeIndex < itemsStats.length - 1 ? itemsStats[activeIndex + 1] : null;

      return {
        viewportWidth: Math.floor(window.innerWidth),
        trackGap: Number.isFinite(trackGapRaw) ? Number(trackGapRaw.toFixed(2)) : null,
        activeLogicalIndex: Number.isFinite(activeLogicalIndex) ? activeLogicalIndex : null,
        step: Number.isFinite(step) ? step : null,
        gridWidth: Number.isFinite(gridWidth) ? gridWidth : null,
        cardWidth: Number.isFinite(cardWidth) ? cardWidth : null,
        cardHeight: Number.isFinite(cardHeight) ? cardHeight : null,
        perimeterWidth: Number.isFinite(perimeterWidth) ? perimeterWidth : null,
        viewportLeft: Number(viewportRect.left.toFixed(2)),
        viewportRight: Number(viewportRect.right.toFixed(2)),
        activeItem,
        leftItem,
        rightItem,
        visualGapLeft:
          activeItem && leftItem && activeItem.surfaceLeft !== null && leftItem.surfaceRight !== null
            ? Number((activeItem.surfaceLeft - leftItem.surfaceRight).toFixed(2))
            : null,
        visualGapRight:
          activeItem && rightItem && rightItem.surfaceLeft !== null && activeItem.surfaceRight !== null
            ? Number((rightItem.surfaceLeft - activeItem.surfaceRight).toFixed(2))
            : null,
      };
    });

    expect(initialSnapshot).not.toBeNull();
    expect(initialSnapshot!.trackGap).not.toBeNull();
    expect(Math.abs((initialSnapshot!.trackGap ?? 0) - 16)).toBeLessThanOrEqual(0.1);
    expect(initialSnapshot!.activeLogicalIndex).toBe(1);
    expect(initialSnapshot!.step).not.toBeNull();
    expect(initialSnapshot!.gridWidth).not.toBeNull();
    expect(initialSnapshot!.cardWidth).not.toBeNull();
    expect(initialSnapshot!.cardHeight).not.toBeNull();
    expect(initialSnapshot!.perimeterWidth).not.toBeNull();
    expect(initialSnapshot!.activeItem).not.toBeNull();
    expect(initialSnapshot!.leftItem).not.toBeNull();
    expect(initialSnapshot!.rightItem).not.toBeNull();

    const availableWidth = Math.max(40, Math.floor(initialSnapshot!.viewportWidth) - 40);
    const expectedCols = Math.max(6, Math.min(18, Math.round(availableWidth / 40)));
    const expectedStep = Math.max(8, Math.floor(availableWidth / expectedCols));
    const expectedGridWidth = expectedStep * expectedCols;
    const expectedCardWidth = Math.max(expectedStep * 6, expectedGridWidth - 40);
    const expectedCardHeight = Math.max(expectedStep * 8, Math.round(384 / expectedStep) * expectedStep);
    const expectedPerimeterWidth = Math.max(expectedStep * 6, Math.round(expectedCardWidth / expectedStep) * expectedStep);

    expect(initialSnapshot!.step).toBe(expectedStep);
    expect(Math.abs((initialSnapshot!.gridWidth ?? 0) - expectedGridWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((initialSnapshot!.cardWidth ?? 0) - expectedCardWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((initialSnapshot!.cardHeight ?? 0) - expectedCardHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs((initialSnapshot!.perimeterWidth ?? 0) - expectedPerimeterWidth)).toBeLessThanOrEqual(1);

    expect(Math.abs((initialSnapshot!.activeItem?.scaleX ?? 0) - 1)).toBeLessThanOrEqual(0.02);
    expect(Math.abs((initialSnapshot!.leftItem?.scaleX ?? 0) - 0.9)).toBeLessThanOrEqual(0.03);
    expect(Math.abs((initialSnapshot!.rightItem?.scaleX ?? 0) - 0.9)).toBeLessThanOrEqual(0.03);
    expect(initialSnapshot!.visualGapLeft).not.toBeNull();
    expect(initialSnapshot!.visualGapRight).not.toBeNull();
    expect(Math.abs((initialSnapshot!.visualGapLeft ?? 0) - 16)).toBeLessThanOrEqual(1);
    expect(Math.abs((initialSnapshot!.visualGapRight ?? 0) - 16)).toBeLessThanOrEqual(1);
    expect((initialSnapshot!.leftItem?.right ?? 0) > (initialSnapshot!.viewportLeft ?? 0)).toBe(true);
    expect((initialSnapshot!.rightItem?.left ?? 0) < (initialSnapshot!.viewportRight ?? 0)).toBe(true);
    expect((initialSnapshot!.activeItem?.perimeterRows ?? 0) >= 8).toBe(true);
    expect(initialSnapshot!.activeItem?.perimeterSnapMismatch).not.toBe('true');
    expect(
      Math.abs((initialSnapshot!.activeItem?.surfaceHeight ?? 0) - (initialSnapshot!.activeItem?.viewBoxHeight ?? 0)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((initialSnapshot!.activeItem?.centerY ?? 0) - (initialSnapshot!.leftItem?.centerY ?? 0)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((initialSnapshot!.activeItem?.centerY ?? 0) - (initialSnapshot!.rightItem?.centerY ?? 0)),
    ).toBeLessThanOrEqual(1);

    const initialIndex = await readSliderActiveLogicalIndex(page);
    expect(initialIndex).toBe(1);

    await swipeSlider(page, 'left');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(2);

    await swipeSlider(page, 'left');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(0);
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const root = document.querySelector('[data-fora-intro-slider-root]');
          if (!(root instanceof HTMLElement)) {
            return null;
          }
          const activeItem = root.querySelector<HTMLElement>('[data-fora-intro-slider-item][data-intro-slider-active="true"]');
          if (!(activeItem instanceof HTMLElement)) {
            return null;
          }
          const raw = Number.parseInt(activeItem.dataset.introSliderPhysicalIndex ?? '', 10);
          return Number.isFinite(raw) ? raw : null;
        });
      })
      .toBe(1);

    const wrapTransientSamples: Array<{ activeScaleX: number; visualGapLeft: number | null; visualGapRight: number | null }> =
      [];
    for (let index = 0; index < 6; index += 1) {
      const sample = await page.evaluate(() => {
        const root = document.querySelector('[data-fora-intro-slider-root]');
        if (!(root instanceof HTMLElement)) {
          return null;
        }
        const items = Array.from(root.querySelectorAll('[data-fora-intro-slider-item]')).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        const resolveScaleX = (transform: string) => {
          if (!transform || transform === 'none') {
            return 1;
          }
          const matrixMatch = transform.match(/^matrix\((.+)\)$/);
          if (!matrixMatch) {
            return null;
          }
          const values = matrixMatch[1].split(',').map((value) => Number.parseFloat(value.trim()));
          if (values.length < 2 || values.some((value) => !Number.isFinite(value))) {
            return null;
          }
          return Number(Math.hypot(values[0], values[1]).toFixed(4));
        };

        const stats = items.map((item) => {
          const surface = item.querySelector('.gallery-card__surface--mock[data-quantized-perimeter]');
          const rect = surface instanceof HTMLElement ? surface.getBoundingClientRect() : null;
          return {
            active: item.dataset.introSliderActive === 'true',
            scaleX: resolveScaleX(getComputedStyle(item).transform),
            surfaceLeft: rect ? Number(rect.left.toFixed(2)) : null,
            surfaceRight: rect ? Number(rect.right.toFixed(2)) : null,
          };
        });
        const activeIndex = stats.findIndex((item) => item.active);
        if (activeIndex < 0) {
          return null;
        }
        const active = stats[activeIndex];
        const left = activeIndex > 0 ? stats[activeIndex - 1] : null;
        const right = activeIndex < stats.length - 1 ? stats[activeIndex + 1] : null;
        return {
          activeScaleX: active.scaleX,
          visualGapLeft:
            left && active.surfaceLeft !== null && left.surfaceRight !== null
              ? Number((active.surfaceLeft - left.surfaceRight).toFixed(2))
              : null,
          visualGapRight:
            right && right.surfaceLeft !== null && active.surfaceRight !== null
              ? Number((right.surfaceLeft - active.surfaceRight).toFixed(2))
              : null,
        };
      });
      expect(sample).not.toBeNull();
      wrapTransientSamples.push(sample!);
      await page.waitForTimeout(30);
    }

    const wrapScaleMin = Math.min(...wrapTransientSamples.map((sample) => sample.activeScaleX ?? 0));
    const wrapGapLeftMaxDeviation = Math.max(
      ...wrapTransientSamples.map((sample) => Math.abs((sample.visualGapLeft ?? 16) - 16)),
    );
    const wrapGapRightMaxDeviation = Math.max(
      ...wrapTransientSamples.map((sample) => Math.abs((sample.visualGapRight ?? 16) - 16)),
    );
    expect(wrapScaleMin).toBeGreaterThanOrEqual(0.95);
    expect(wrapGapLeftMaxDeviation).toBeLessThanOrEqual(2);
    expect(wrapGapRightMaxDeviation).toBeLessThanOrEqual(2);

    await swipeSlider(page, 'right');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(2);
  });

  test('/kissa mobile intro slider uses tablet compact cards and keeps loop behavior', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page.locator('.fora-intro-screens-section--mobile-slider')).toBeVisible();
    await expect(page.locator('[data-fora-intro-slider-item]')).toHaveCount(5);
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(1);

    const initialState = await page.evaluate(() => {
      const root = document.querySelector('[data-fora-intro-slider-root]');
      if (!(root instanceof HTMLElement)) {
        return null;
      }
      const activeItem = root.querySelector<HTMLElement>('[data-fora-intro-slider-item][data-intro-slider-active="true"]');
      if (!(activeItem instanceof HTMLElement)) {
        return null;
      }
      const card = activeItem.querySelector<HTMLElement>('.gallery-card');
      const mockup = activeItem.querySelector<HTMLElement>('.device-mockup');
      return {
        cardType: card?.dataset.galleryCardType ?? null,
        deviceKind: mockup?.dataset.deviceKind ?? null,
        deviceSize: mockup?.dataset.deviceSize ?? null,
      };
    });

    expect(initialState).not.toBeNull();
    expect(initialState!.cardType).toBe('tablet');
    expect(initialState!.deviceKind).toBe('tablet');
    expect(initialState!.deviceSize).toBe('compact');

    await swipeSlider(page, 'left');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(2);

    await swipeSlider(page, 'left');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(0);

    await swipeSlider(page, 'right');
    await expect.poll(() => readSliderActiveLogicalIndex(page)).toBe(2);
  });

  test('/kissa mobile artifact slider snaps between two slides without loop', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page.locator('[data-kissa-artifact-slider-root]')).toBeVisible();
    await expect(page.locator('[data-kissa-artifact-slider-item]')).toHaveCount(2);

    const order = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>('[data-kissa-artifact-slider-item]'));
      return items.map((item) => item.querySelector<HTMLElement>('.kissa-artifact-photos-slider__caption')?.textContent?.trim() ?? '');
    });
    expect(order[0]).toContain('new navigation');
    expect(order[1]).toContain('tested prototype');

    await expect.poll(() => readArtifactSliderActiveIndex(page)).toBe(0);

    await swipeArtifactSlider(page, 'left');
    await expect.poll(() => readArtifactSliderActiveIndex(page)).toBe(1);

    await swipeArtifactSlider(page, 'left');
    await expect.poll(() => readArtifactSliderActiveIndex(page)).toBe(1);

    await swipeArtifactSlider(page, 'right');
    await expect.poll(() => readArtifactSliderActiveIndex(page)).toBe(0);

    await swipeArtifactSlider(page, 'right');
    await expect.poll(() => readArtifactSliderActiveIndex(page)).toBe(0);
  });

  test('/fora mobile keeps full flow sections, spacing contract and tickets 2x2', async ({ page }) => {
    await page.goto('/fora');

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.fora-intro-section')).toBeVisible();
    await expect(page.locator('.fora-intro-screens-section--mobile-slider')).toBeVisible();
    await expect(page.locator('.fora-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--fora')).toBeVisible();
    await expect(page.locator('.fora-feature-cards-section')).toBeVisible();
    await expect(page.locator('.fora-team-photo-section')).toBeVisible();
    await expect(page.locator('.case-switcher-section')).toBeVisible();
    await expect(page.locator('.fora-design-system-section')).toBeHidden();

    const visibleSections = await readVisibleSectionClasses(page);
    expect(visibleSections).not.toBeNull();
    expect(visibleSections).toHaveLength(7);
    expect(visibleSections![0]).toContain('fora-intro-section');
    expect(visibleSections![1]).toContain('fora-intro-screens-section');
    expect(visibleSections![2]).toContain('fora-case-challenge');
    expect(visibleSections![3]).toContain('case-process-section--fora');
    expect(visibleSections![4]).toContain('fora-feature-cards-section');
    expect(visibleSections![5]).toContain('fora-team-photo-section');
    expect(visibleSections![6]).toContain('case-switcher-section');

    const introDividerGeometry = await page.evaluate(() => {
      const intro = document.querySelector('.fora-intro-section');
      const divider = document.querySelector('.fora-intro-divider--mobile');
      if (!(intro instanceof HTMLElement) || !(divider instanceof HTMLElement)) {
        return null;
      }
      const introRect = intro.getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      return {
        introRight: Number(introRect.right.toFixed(2)),
        dividerRight: Number(dividerRect.right.toFixed(2)),
        dividerCountResolved: Number.parseInt(
          divider.getAttribute('data-wave-count-resolved') ?? divider.getAttribute('data-wave-count') ?? '0',
          10,
        ),
      };
    });
    expect(introDividerGeometry).not.toBeNull();
    expect(introDividerGeometry!.dividerRight).toBeLessThanOrEqual(introDividerGeometry!.introRight + 1);
    expect(introDividerGeometry!.dividerCountResolved).toBeGreaterThan(0);

    const layoutSnapshot = await page.evaluate(() => {
      const main = document.querySelector('main.page-shell--case-detail');
      const footer = document.querySelector('.site-footer');
      if (!(main instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        return null;
      }
      const sections = Array.from(main.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement && getComputedStyle(node).display !== 'none',
      );
      const gaps = sections.slice(1).map((section, index) => {
        const prev = sections[index];
        return section.offsetTop - (prev.offsetTop + prev.offsetHeight);
      });
      const last = sections.at(-1);
      const footerGap = last ? footer.offsetTop - (last.offsetTop + last.offsetHeight) : null;
      return { gaps, footerGap };
    });

    expect(layoutSnapshot).not.toBeNull();
    expect(layoutSnapshot!.gaps).toEqual([96, 144, 144, 144, 120, 120]);
    expect(layoutSnapshot!.footerGap).toBe(144);

    await page.locator('.case-switcher-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const footerOverlap = await page.evaluate(() => {
      const footer = document.querySelector('.site-footer');
      const lastSection = document.querySelector('main.page-shell--case-detail > .case-switcher-section');
      if (!(footer instanceof HTMLElement) || !(lastSection instanceof HTMLElement)) {
        return null;
      }
      const footerRect = footer.getBoundingClientRect();
      const sectionRect = lastSection.getBoundingClientRect();
      return Math.max(0, Number((sectionRect.bottom - footerRect.top).toFixed(1)));
    });
    expect(footerOverlap).toBe(0);

    await assertProcessTicketContract({
      page,
      sectionSelector: '.case-process-section--fora',
      baseStep: 36,
      defaultCols: 4,
    });
  });

  test('/kissa mobile keeps full flow sections, spacing contract and tickets 2x2', async ({ page }) => {
    await page.goto('/kissa');

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.fora-intro-section.kissa-intro-section')).toBeVisible();
    await expect(page.locator('.fora-intro-screens-section--tablet.fora-intro-screens-section--mobile-slider')).toBeVisible();
    await expect(page.locator('.kissa-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--kissa')).toBeVisible();
    await expect(page.locator('.kissa-artifact-photos-section')).toBeVisible();
    await expect(page.locator('.kissa-feature-cards')).toBeVisible();
    await expect(page.locator('.case-switcher-section')).toBeVisible();

    const visibleSections = await readVisibleSectionClasses(page);
    expect(visibleSections).not.toBeNull();
    expect(visibleSections).toHaveLength(7);
    expect(visibleSections![0]).toContain('kissa-intro-section');
    expect(visibleSections![1]).toContain('fora-intro-screens-section');
    expect(visibleSections![2]).toContain('kissa-case-challenge');
    expect(visibleSections![3]).toContain('case-process-section--kissa');
    expect(visibleSections![4]).toContain('kissa-artifact-photos-section');
    expect(visibleSections![5]).toContain('kissa-feature-cards');
    expect(visibleSections![6]).toContain('case-switcher-section');

    const kissaMobileIntroTypography = await page.evaluate(() => {
      const title = document.querySelector('.kissa-intro-section .fora-intro-title');
      if (!(title instanceof HTMLElement)) {
        return null;
      }
      const styles = getComputedStyle(title);
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        expectedT3Size: rootStyles.getPropertyValue('--type-t3-size').trim(),
      };
    });
    expect(kissaMobileIntroTypography).not.toBeNull();
    expect(kissaMobileIntroTypography!.fontSize).toBe(kissaMobileIntroTypography!.expectedT3Size);
    expect(kissaMobileIntroTypography!.lineHeight).toBe('38px');

    const kissaIntroDividerGeometry = await page.evaluate(() => {
      const intro = document.querySelector('.kissa-intro-section.fora-intro-section');
      const divider = document.querySelector('.kissa-intro-section .fora-intro-divider--mobile');
      if (!(intro instanceof HTMLElement) || !(divider instanceof HTMLElement)) {
        return null;
      }
      const introRect = intro.getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      return {
        introRight: Number(introRect.right.toFixed(2)),
        dividerRight: Number(dividerRect.right.toFixed(2)),
        dividerCountResolved: Number.parseInt(
          divider.getAttribute('data-wave-count-resolved') ?? divider.getAttribute('data-wave-count') ?? '0',
          10,
        ),
      };
    });
    expect(kissaIntroDividerGeometry).not.toBeNull();
    expect(kissaIntroDividerGeometry!.dividerRight).toBeLessThanOrEqual(kissaIntroDividerGeometry!.introRight + 1);
    expect(kissaIntroDividerGeometry!.dividerCountResolved).toBeGreaterThan(0);

    const layoutSnapshot = await page.evaluate(() => {
      const main = document.querySelector('main.page-shell--case-detail');
      const footer = document.querySelector('.site-footer');
      if (!(main instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        return null;
      }
      const sections = Array.from(main.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement && getComputedStyle(node).display !== 'none',
      );
      const gaps = sections.slice(1).map((section, index) => {
        const prev = sections[index];
        return section.offsetTop - (prev.offsetTop + prev.offsetHeight);
      });
      const last = sections.at(-1);
      const footerGap = last ? footer.offsetTop - (last.offsetTop + last.offsetHeight) : null;
      return { gaps, footerGap };
    });

    expect(layoutSnapshot).not.toBeNull();
    expect(layoutSnapshot!.gaps).toEqual([96, 144, 144, 144, 144, 120]);
    expect(layoutSnapshot!.footerGap).toBe(144);

    await assertProcessTicketContract({
      page,
      sectionSelector: '.case-process-section--kissa',
      baseStep: 24,
      defaultCols: 6,
    });
  });

  test('mobile case-detail text-wrap balance is applied to key texts on /fora and /kissa', async ({ page }) => {
    await page.goto('/fora');

    await expect(page.locator('.fora-intro-section')).toBeVisible();
    await expect(page.locator('.fora-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--fora')).toBeVisible();
    await expect(page.locator('.fora-feature-card').first()).toBeVisible();

    await assertTextWrapBalanceSelectors(page, [
      '.fora-intro-section .fora-intro-title',
      '.fora-intro-section .fora-intro-subtitle',
      '.fora-intro-section .fora-intro-script',
      '.fora-intro-section .fora-intro-row-label',
      '.fora-intro-section .fora-intro-row-value',
      '.fora-intro-section .fora-intro-line',
      '.fora-case-challenge .case-challenge-top .case-challenge-title',
      '.fora-case-challenge .case-challenge-top .case-challenge-column',
      '.case-process-section--fora .case-process-step__text',
      '.fora-feature-card .fora-feature-card__title',
      '.fora-feature-card .fora-feature-card__description',
    ]);

    await page.goto('/kissa');

    await expect(page.locator('.kissa-intro-section')).toBeVisible();
    await expect(page.locator('.kissa-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--kissa')).toBeVisible();
    await expect(page.locator('.kissa-feature-cards .fora-feature-card').first()).toBeVisible();

    await assertTextWrapBalanceSelectors(page, [
      '.kissa-intro-section .fora-intro-title',
      '.kissa-intro-section .fora-intro-subtitle',
      '.kissa-intro-section .fora-intro-script',
      '.kissa-intro-section .fora-intro-row-label',
      '.kissa-intro-section .fora-intro-row-value',
      '.kissa-intro-section .fora-intro-line',
      '.kissa-case-challenge .case-challenge-top .case-challenge-title',
      '.kissa-case-challenge .case-challenge-top .case-challenge-column',
      '.case-process-section--kissa .case-process-step__text',
      '.kissa-feature-cards .fora-feature-card .fora-feature-card__title',
      '.kissa-feature-cards .fora-feature-card .fora-feature-card__description',
    ]);
  });

  test('process tickets keep D guardrail on radical mobile widths', async ({ page }) => {
    const cases = [
      { pathname: '/fora' as const, selector: '.case-process-section--fora', baseStep: 36, defaultCols: 4 },
      { pathname: '/kissa' as const, selector: '.case-process-section--kissa', baseStep: 24, defaultCols: 6 },
    ] as const;

    for (const viewportWidth of [430, 767, 847] as const) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });
      for (const currentCase of cases) {
        await page.goto(currentCase.pathname);
        await expect(page.locator(currentCase.selector)).toBeVisible();
        await assertProcessTicketContract({
          page,
          sectionSelector: currentCase.selector,
          baseStep: currentCase.baseStep,
          defaultCols: currentCase.defaultCols,
        });
      }
    }
  });

  test('mobile challenge does not upscale scene on regular mobile widths', async ({ page }) => {
    const cases = [
      { pathname: '/fora' as const, sectionSelector: '.fora-case-challenge' },
      { pathname: '/kissa' as const, sectionSelector: '.kissa-case-challenge' },
    ] as const;
    const viewports = [
      { width: 390, height: 844 },
      { width: 767, height: 900 },
      { width: 847, height: 900 },
    ] as const;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const currentCase of cases) {
        await page.goto(currentCase.pathname);

        const snapshot = await page.evaluate((sectionSelector) => {
          const section = document.querySelector<HTMLElement>(sectionSelector);
          const wrap = section?.querySelector<HTMLElement>('.case-challenge-scene-wrap--mobile');
          const viewportNode = section?.querySelector<HTMLElement>('.case-challenge-scene-viewport--mobile');
          const scene = section?.querySelector<HTMLElement>('.case-challenge-scene--mobile');
          const device = section?.querySelector<HTMLElement>('.case-challenge-device--mobile .device-mockup');
          const shell = device?.querySelector<HTMLElement>('.device-mockup__shell');
          if (
            !(section instanceof HTMLElement) ||
            !(wrap instanceof HTMLElement) ||
            !(viewportNode instanceof HTMLElement) ||
            !(scene instanceof HTMLElement) ||
            !(device instanceof HTMLElement) ||
            !(shell instanceof HTMLElement)
          ) {
            return null;
          }

          const sectionRect = section.getBoundingClientRect();
          const viewportRect = viewportNode.getBoundingClientRect();
          const sceneRect = scene.getBoundingClientRect();
          const deviceRect = device.getBoundingClientRect();
          const shellRect = shell.getBoundingClientRect();
          const baseSceneWidth = Number.parseFloat(getComputedStyle(wrap).getPropertyValue('--case-mobile-scene-width'));
          const deviceScale = Number.parseFloat(getComputedStyle(device).getPropertyValue('--device-scale'));
          const scaleFromRect = sceneRect.width / baseSceneWidth;
          const leftInset = viewportRect.left - sectionRect.left;
          const rightInset = sectionRect.right - viewportRect.right;

          return {
            viewportWidth: Number.parseFloat(viewportRect.width.toFixed(2)),
            sceneWidth: Number.parseFloat(sceneRect.width.toFixed(2)),
            baseSceneWidth: Number.parseFloat(baseSceneWidth.toFixed(2)),
            scaleFromRect: Number.parseFloat(scaleFromRect.toFixed(4)),
            deviceScale: Number.parseFloat(deviceScale.toFixed(4)),
            centerDiff: Number.parseFloat(Math.abs(leftInset - rightInset).toFixed(2)),
            deviceWidth: Number.parseFloat(deviceRect.width.toFixed(2)),
            deviceHeight: Number.parseFloat(deviceRect.height.toFixed(2)),
            shellWidth: Number.parseFloat(shellRect.width.toFixed(2)),
            shellHeight: Number.parseFloat(shellRect.height.toFixed(2)),
          };
        }, currentCase.sectionSelector);

        expect(snapshot).not.toBeNull();
        expect(Math.abs(snapshot!.sceneWidth - snapshot!.baseSceneWidth)).toBeLessThanOrEqual(1);
        expect(Math.abs(snapshot!.viewportWidth - snapshot!.baseSceneWidth)).toBeLessThanOrEqual(1);
        expect(Math.abs(snapshot!.scaleFromRect - 1)).toBeLessThanOrEqual(0.01);
        expect(Math.abs(snapshot!.deviceScale - 1)).toBeLessThanOrEqual(0.01);
        expect(snapshot!.centerDiff).toBeLessThanOrEqual(1);
        expect(snapshot!.shellWidth).toBeGreaterThan(0);
        expect(snapshot!.shellHeight).toBeGreaterThan(0);
        expect(Math.abs(snapshot!.shellWidth - snapshot!.deviceWidth)).toBeLessThanOrEqual(1);
        expect(Math.abs(snapshot!.shellHeight - snapshot!.deviceHeight)).toBeLessThanOrEqual(1);
      }
    }
  });

  test('mobile challenge emergency-shrinks whole scene only on narrow viewport', async ({ page }) => {
    const cases = [
      { pathname: '/fora' as const, sectionSelector: '.fora-case-challenge' },
      { pathname: '/kissa' as const, sectionSelector: '.kissa-case-challenge' },
    ] as const;

    await page.setViewportSize({ width: 360, height: 800 });

    for (const currentCase of cases) {
      await page.goto(currentCase.pathname);

      const snapshot = await page.evaluate((sectionSelector) => {
        const section = document.querySelector<HTMLElement>(sectionSelector);
        const wrap = section?.querySelector<HTMLElement>('.case-challenge-scene-wrap--mobile');
        const viewportNode = section?.querySelector<HTMLElement>('.case-challenge-scene-viewport--mobile');
        const scene = section?.querySelector<HTMLElement>('.case-challenge-scene--mobile');
        const device = section?.querySelector<HTMLElement>('.case-challenge-device--mobile .device-mockup');
        const shell = device?.querySelector<HTMLElement>('.device-mockup__shell');
        if (
          !(section instanceof HTMLElement) ||
          !(wrap instanceof HTMLElement) ||
          !(viewportNode instanceof HTMLElement) ||
          !(scene instanceof HTMLElement) ||
          !(device instanceof HTMLElement) ||
          !(shell instanceof HTMLElement)
        ) {
          return null;
        }

        const sectionRect = section.getBoundingClientRect();
        const viewportRect = viewportNode.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        const deviceRect = device.getBoundingClientRect();
        const shellRect = shell.getBoundingClientRect();
        const baseSceneWidth = Number.parseFloat(getComputedStyle(wrap).getPropertyValue('--case-mobile-scene-width'));
        const deviceScale = Number.parseFloat(getComputedStyle(device).getPropertyValue('--device-scale'));
        const deviceWidthPercent = Number.parseFloat(getComputedStyle(wrap).getPropertyValue('--case-mobile-device-width'));
        const viewportContentWidth = document.documentElement.clientWidth || window.innerWidth;
        const expectedCurrentWidth = Math.min(baseSceneWidth, Math.max(0, viewportContentWidth - 40));
        const scaleFromRect = sceneRect.width / baseSceneWidth;
        const expectedDeviceWidth = ((deviceWidthPercent / 100) * baseSceneWidth) * scaleFromRect;
        const leftInset = viewportRect.left - sectionRect.left;
        const rightInset = sectionRect.right - viewportRect.right;

        return {
          viewportWidth: Number.parseFloat(viewportRect.width.toFixed(2)),
          sceneWidth: Number.parseFloat(sceneRect.width.toFixed(2)),
          expectedCurrentWidth: Number.parseFloat(expectedCurrentWidth.toFixed(2)),
          scaleFromRect: Number.parseFloat(scaleFromRect.toFixed(4)),
          deviceScale: Number.parseFloat(deviceScale.toFixed(4)),
          centerDiff: Number.parseFloat(Math.abs(leftInset - rightInset).toFixed(2)),
          deviceWidth: Number.parseFloat(deviceRect.width.toFixed(2)),
          deviceHeight: Number.parseFloat(deviceRect.height.toFixed(2)),
          expectedDeviceWidth: Number.parseFloat(expectedDeviceWidth.toFixed(2)),
          shellWidth: Number.parseFloat(shellRect.width.toFixed(2)),
          shellHeight: Number.parseFloat(shellRect.height.toFixed(2)),
        };
      }, currentCase.sectionSelector);

      expect(snapshot).not.toBeNull();
      expect(Math.abs(snapshot!.sceneWidth - snapshot!.expectedCurrentWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(snapshot!.viewportWidth - snapshot!.expectedCurrentWidth)).toBeLessThanOrEqual(1);
      expect(snapshot!.scaleFromRect).toBeGreaterThan(0);
      expect(snapshot!.scaleFromRect).toBeLessThan(1);
      expect(Math.abs(snapshot!.deviceScale - 1)).toBeLessThanOrEqual(0.01);
      expect(snapshot!.centerDiff).toBeLessThanOrEqual(1);
      expect(Math.abs(snapshot!.deviceWidth - snapshot!.expectedDeviceWidth)).toBeLessThanOrEqual(1);
      expect(snapshot!.shellWidth).toBeGreaterThan(0);
      expect(snapshot!.shellHeight).toBeGreaterThan(0);
      expect(Math.abs(snapshot!.shellWidth - snapshot!.deviceWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(snapshot!.shellHeight - snapshot!.deviceHeight)).toBeLessThanOrEqual(1);
    }
  });

  test('mobile challenge notes keep fixed 184px width on /fora and /kissa', async ({ page }) => {
    const cases = ['/fora', '/kissa'] as const;
    const viewports = [
      { width: 390, height: 844 },
      { width: 767, height: 900 },
      { width: 847, height: 900 },
    ] as const;

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const pathname of cases) {
        await page.goto(pathname);

        const widths = await page.evaluate(() => {
          return Array.from(document.querySelectorAll<HTMLElement>('.case-challenge-mobile-note')).map((note) =>
            Number(note.getBoundingClientRect().width.toFixed(2)),
          );
        });

        expect(widths.length).toBeGreaterThan(0);
        widths.forEach((width) => {
          expect(Math.abs(width - 184)).toBeLessThanOrEqual(1);
        });
      }
    }
  });

  test('mobile root sections keep grid width contract at 767px and 847px for /fora and /kissa', async ({ page }) => {
    for (const viewportWidth of [767, 847] as const) {
      await page.setViewportSize({ width: viewportWidth, height: 900 });

      for (const pathname of ['/fora', '/kissa'] as const) {
        await page.goto(pathname);

        const snapshot = await page.evaluate(() => {
          const main = document.querySelector('main.page-shell--case-detail');
          if (!(main instanceof HTMLElement)) {
            return null;
          }

          const visibleSections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section')).filter(
            (node) => getComputedStyle(node).display !== 'none',
          );

          const widthProbe = document.createElement('div');
          widthProbe.style.position = 'absolute';
          widthProbe.style.visibility = 'hidden';
          widthProbe.style.pointerEvents = 'none';
          widthProbe.style.height = '0';
          widthProbe.style.width = 'var(--case-mobile-grid-width)';
          main.appendChild(widthProbe);
          const expectedWidthFromVar = widthProbe.getBoundingClientRect().width;
          widthProbe.remove();

          const mainWidth = main.getBoundingClientRect().width;
          const viewportInnerWidth = window.innerWidth;
          const viewportClientWidth = document.documentElement.clientWidth || viewportInnerWidth;
          const expectedWidthCandidates = [
            Number.isFinite(expectedWidthFromVar) && expectedWidthFromVar > 0 ? expectedWidthFromVar : null,
            Math.max(0, mainWidth - 40),
            Math.max(0, viewportInnerWidth - 40),
            Math.max(0, viewportClientWidth - 40),
          ]
            .filter((value): value is number => value !== null && Number.isFinite(value))
            .map((value) => Number(value.toFixed(2)))
            .filter((value, index, arr) => arr.findIndex((candidate) => Math.abs(candidate - value) <= 0.1) === index);
          const visibleSectionWidths = visibleSections.map((node) => ({
            className: node.className,
            width: Number(node.getBoundingClientRect().width.toFixed(2)),
          }));

          return {
            expectedWidthCandidates,
            visibleSections: visibleSectionWidths,
            viewportInnerWidth: window.innerWidth,
            docScrollWidth: document.documentElement.scrollWidth,
            docClientWidth: document.documentElement.clientWidth,
          };
        });

        expect(snapshot).not.toBeNull();
        const expectedCount = 7;
        expect(snapshot!.visibleSections.length).toBe(expectedCount);
        expect(
          snapshot!.visibleSections.every((section) =>
            snapshot!.expectedWidthCandidates.some((expected) => Math.abs(section.width - expected) <= 4),
          ),
          JSON.stringify(snapshot),
        ).toBe(true);
        const scrollbarDelta = Math.max(0, snapshot!.viewportInnerWidth - snapshot!.docClientWidth);
        expect(Math.max(0, snapshot!.docScrollWidth - snapshot!.docClientWidth)).toBeLessThanOrEqual(scrollbarDelta + 1);
      }
    }
  });
});
test.describe('Case details mobile case switcher smoke', () => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 767, height: 900 },
    { width: 847, height: 900 },
  ] as const;

  for (const viewport of viewports) {
    test(`case switcher visibility contract at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/fora');
      await expect(page.locator('.case-switcher-section')).toBeVisible();

      await page.goto('/kissa');
      await expect(page.locator('.case-switcher-section')).toBeVisible();
    });

    test(`case switcher keeps cover centered at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      await page.goto('/kissa');
      const switcher = page.locator('.case-switcher-section');
      await expect(switcher).toBeVisible();
      await switcher.scrollIntoViewIfNeeded();

      const geometry = await page.evaluate(() => {
        const section = document.querySelector('.case-switcher-section');
        const cover = document.querySelector('.case-switcher-cover');
        const prev = document.querySelector('.case-switcher-button--prev');
        const next = document.querySelector('.case-switcher-button--next');

        if (
          !(section instanceof HTMLElement) ||
          !(cover instanceof HTMLElement) ||
          !(prev instanceof HTMLElement) ||
          !(next instanceof HTMLElement)
        ) {
          return null;
        }

        const sectionRect = section.getBoundingClientRect();
        const coverRect = cover.getBoundingClientRect();
        const prevRect = prev.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        const sectionCenter = sectionRect.left + sectionRect.width / 2;
        const coverCenter = coverRect.left + coverRect.width / 2;
        const buttonsCenter = (prevRect.left + (nextRect.left + nextRect.width)) / 2;

        return {
          sectionDelta: Number(Math.abs(sectionCenter - coverCenter).toFixed(2)),
          buttonsDelta: Number(Math.abs(buttonsCenter - coverCenter).toFixed(2)),
        };
      });

      expect(geometry).not.toBeNull();
      expect(geometry!.sectionDelta).toBeLessThanOrEqual(1);
      expect(geometry!.buttonsDelta).toBeLessThanOrEqual(1);
    });
  }
});
