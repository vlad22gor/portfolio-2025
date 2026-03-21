import { expect, test } from '@playwright/test';

const floatingThemeButtonSelector = '.floating-theme-button[data-floating-theme-button]';

test.describe('Gallery smoke', () => {
  test.use({ viewport: { width: 1440, height: 1100 } });

  test('/gallery renders webm cards, row-stagger, and critical priority contract', async ({ page }) => {
    await page.goto('/gallery');

    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    const rows = page.locator('.gallery-row');
    await expect(rows).toHaveCount(6);
    await expect(page.locator('.gallery-row[data-motion-inview="process-tickets-row-stagger-v1"]')).toHaveCount(6);

    const cards = page.locator('.gallery-card');
    await expect(cards).toHaveCount(21);
    await expect(page.locator('.gallery-card[data-motion-stagger-item]')).toHaveCount(21);

    const webmVideos = page.locator('.gallery-card .device-mockup video.device-mockup__media');
    await expect(webmVideos).toHaveCount(7);

    const allVideosAreAutoplayReady = await webmVideos.evaluateAll((nodes) =>
      nodes.every((node) => {
        if (!(node instanceof HTMLVideoElement)) {
          return false;
        }
        return (
          node.autoplay &&
          node.muted &&
          node.loop &&
          node.playsInline &&
          node.getAttribute('src')?.endsWith('.webm') === true
        );
      }),
    );
    expect(allVideosAreAutoplayReady).toBe(true);

    const allVideosUseSafeMode = await webmVideos.evaluateAll((nodes) =>
      nodes.every((node) => node.classList.contains('device-mockup__media--video')),
    );
    expect(allVideosUseSafeMode).toBe(true);

    const allVideosUseBleedWrapper = await webmVideos.evaluateAll((nodes) =>
      nodes.every(
        (node) =>
          node.parentElement instanceof HTMLElement &&
          node.parentElement.classList.contains('device-mockup__video-bleed') &&
          node.parentElement.hasAttribute('data-device-video-bleed'),
      ),
    );
    expect(allVideosUseBleedWrapper).toBe(true);

    const allVideoTransformsAreDisabled = await webmVideos.evaluateAll((nodes) =>
      nodes.every((node) => getComputedStyle(node).transform === 'none'),
    );
    expect(allVideoTransformsAreDisabled).toBe(true);

    const illustrationVideos = page.locator('.gallery-card-illustration video.gallery-card-illustration__asset');
    await expect(illustrationVideos).toHaveCount(2);

    const coinWheelVideo = page.locator(
      '.gallery-card-illustration--coin-wheel video.gallery-card-illustration__asset--coin-wheel',
    );
    await expect(coinWheelVideo).toHaveCount(1);
    const coinWheelVideoIsAutoplayReady = await coinWheelVideo.evaluate((node) => {
      if (!(node instanceof HTMLVideoElement)) {
        return false;
      }
      return (
        node.autoplay &&
        node.muted &&
        node.loop &&
        node.playsInline &&
        node.getAttribute('src')?.endsWith('/media/gallery/illustrations/coin-wheel.webm') === true &&
        node.getAttribute('poster')?.endsWith('/media/gallery/illustrations/coin-wheel.webp') === true
      );
    });
    expect(coinWheelVideoIsAutoplayReady).toBe(true);

    const loaderLight = page.locator('.gallery-card-illustration--cube video.gallery-card-illustration__asset--cube');
    await expect(loaderLight).toHaveCount(1);
    const loaderLightIsAutoplayReady = await loaderLight.evaluate((node) => {
      if (!(node instanceof HTMLVideoElement)) {
        return false;
      }
      return (
        node.autoplay &&
        node.muted &&
        node.loop &&
        node.playsInline &&
        node.getAttribute('src')?.endsWith('/media/gallery/illustrations/loader-light.webm') === true
      );
    });
    expect(loaderLightIsAutoplayReady).toBe(true);

    const criticalDeviceCards = page.locator(
      '.gallery-row:nth-child(-n+2) .gallery-card[data-gallery-card-type="phone"], .gallery-row:nth-child(-n+2) .gallery-card[data-gallery-card-type="tablet"]',
    );
    await expect(criticalDeviceCards).toHaveCount(5);
    await expect(page.locator('.gallery-row:nth-child(-n+2) .gallery-card[data-gallery-card-priority="critical"]')).toHaveCount(5);

    const lazyDeviceCards = page.locator('.gallery-row:nth-child(n+3) .gallery-card[data-gallery-card-priority="lazy"]');
    await expect(lazyDeviceCards).toHaveCount(9);

    const criticalShellsAreEager = await page.locator('.gallery-row:nth-child(-n+2) .gallery-card .device-mockup__shell').evaluateAll((nodes) =>
      nodes.every((node) => {
        if (!(node instanceof HTMLImageElement)) {
          return false;
        }
        return node.loading === 'eager' && node.getAttribute('fetchpriority') === 'high';
      }),
    );
    expect(criticalShellsAreEager).toBe(true);

    const allShellsUseFillFit = await page.locator('.gallery-card .device-mockup__shell').evaluateAll((nodes) =>
      nodes.every((node) => node instanceof HTMLImageElement && getComputedStyle(node).objectFit === 'fill'),
    );
    expect(allShellsUseFillFit).toBe(true);

    const mockupSizeAndDimensions = await page.evaluate(() => {
      const firstPhone = document.querySelector('.gallery-card[data-gallery-card-type="phone"] .device-mockup');
      const firstTablet = document.querySelector('.gallery-card[data-gallery-card-type="tablet"] .device-mockup');
      if (!(firstPhone instanceof HTMLElement) || !(firstTablet instanceof HTMLElement)) {
        return null;
      }
      const phoneRect = firstPhone.getBoundingClientRect();
      const tabletRect = firstTablet.getBoundingClientRect();
      return {
        phone: { width: phoneRect.width, height: phoneRect.height, size: firstPhone.getAttribute('data-device-size') },
        tablet: { width: tabletRect.width, height: tabletRect.height, size: firstTablet.getAttribute('data-device-size') },
      };
    });

    expect(mockupSizeAndDimensions).not.toBeNull();
    expect(mockupSizeAndDimensions!.phone.size).toBe('compact');
    expect(mockupSizeAndDimensions!.tablet.size).toBe('compact');
    expect(mockupSizeAndDimensions!.phone.width).toBeGreaterThanOrEqual(215);
    expect(mockupSizeAndDimensions!.phone.width).toBeLessThanOrEqual(217);
    expect(mockupSizeAndDimensions!.phone.height).toBeGreaterThanOrEqual(442);
    expect(mockupSizeAndDimensions!.phone.height).toBeLessThanOrEqual(444);
    expect(mockupSizeAndDimensions!.tablet.width).toBeGreaterThanOrEqual(257);
    expect(mockupSizeAndDimensions!.tablet.width).toBeLessThanOrEqual(259);
    expect(mockupSizeAndDimensions!.tablet.height).toBeGreaterThanOrEqual(442);
    expect(mockupSizeAndDimensions!.tablet.height).toBeLessThanOrEqual(444);

    const compactCalibrationMarker = await page
      .locator('.gallery-card[data-gallery-card-id="51:5269"] .device-mockup')
      .first()
      .getAttribute('data-device-screen-calibration');
    expect(compactCalibrationMarker).toBe('aperture-compact-v2-aa');

    const videoCoverage = await page.evaluate(() => {
      const firstVideo = document.querySelector('.gallery-card video.device-mockup__media');
      const firstScreen = firstVideo?.closest('.device-mockup')?.querySelector('.device-mockup__screen');
      if (!(firstVideo instanceof HTMLVideoElement) || !(firstScreen instanceof HTMLElement)) {
        return null;
      }
      const screenRect = firstScreen.getBoundingClientRect();
      const videoRect = firstVideo.getBoundingClientRect();
      const epsilon = 0.02;
      return {
        screenW: screenRect.width,
        screenH: screenRect.height,
        videoW: videoRect.width,
        videoH: videoRect.height,
        covers:
          videoRect.left <= screenRect.left + epsilon &&
          videoRect.top <= screenRect.top + epsilon &&
          videoRect.right >= screenRect.right - epsilon &&
          videoRect.bottom >= screenRect.bottom - epsilon,
      };
    });

    expect(videoCoverage).not.toBeNull();
    expect(videoCoverage!.covers).toBe(true);

    const imageCards = page.locator('.gallery-card[data-gallery-card-type="image"] .gallery-card__surface');
    await expect(imageCards).toHaveCount(2);
    const imageCardsUseTotemStep50 = await imageCards.evaluateAll((nodes) =>
      nodes.every((node) => node instanceof HTMLElement && node.getAttribute('data-perimeter-step') === '50'),
    );
    expect(imageCardsUseTotemStep50).toBe(true);
    const imageMaskCoverage = await imageCards.evaluateAll((nodes) =>
      nodes.every((surface) => {
        if (!(surface instanceof HTMLElement) || surface.dataset.ready !== 'true') {
          return false;
        }
        const bg = surface.querySelector('.gallery-card__image-bg');
        const layer = surface.querySelector('.gallery-card__image-layer');
        if (!(bg instanceof HTMLElement) || !(layer instanceof HTMLElement)) {
          return false;
        }
        const bgStyles = getComputedStyle(bg);
        const layerStyles = getComputedStyle(layer);
        const bgMask = bgStyles.maskImage || bgStyles.webkitMaskImage;
        const layerMask = layerStyles.maskImage || layerStyles.webkitMaskImage;
        return bgMask !== 'none' && layerMask !== 'none';
      }),
    );
    expect(imageMaskCoverage).toBe(true);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
      window.localStorage.setItem('vh-theme', 'light');
    });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme), {
        timeout: 2000,
      })
      .toBe('light');

    const secondImageCardLightSnapshot = await page.evaluate(() => {
      const target = document.querySelector(
        '.gallery-card[data-gallery-card-id="57:5450"] .gallery-card__image-layer',
      );
      if (!(target instanceof HTMLImageElement)) {
        return null;
      }
      return {
        src: target.getAttribute('src'),
      };
    });
    expect(secondImageCardLightSnapshot).not.toBeNull();
    expect(secondImageCardLightSnapshot!.src).toBe('/media/gallery/images/r5-c3-cube-log-in.webp');

    await expect(page.locator(floatingThemeButtonSelector)).toBeVisible();
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
            const target = document.querySelector(
              '.gallery-card[data-gallery-card-id="57:5450"] .gallery-card__image-layer',
            );
            return target instanceof HTMLImageElement ? target.getAttribute('src') : null;
          }),
        { timeout: 2000 },
      )
      .toBe('/media/gallery/images/r5-c3-cube-log-in-dark.webp');

    const compactApertureAlignment = await page.evaluate(async () => {
      const targetCard = document.querySelector('.gallery-card[data-gallery-card-id="51:5269"]');
      const mockup = targetCard?.querySelector('.device-mockup');
      const shell = mockup?.querySelector('.device-mockup__shell');
      const screen = mockup?.querySelector('.device-mockup__screen');
      if (!(shell instanceof HTMLImageElement) || !(screen instanceof HTMLElement) || !shell.src) {
        return null;
      }

      const loadImage = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = src;
        });

      const findLongestTransparentRun = (length: number, alphaAt: (index: number) => number) => {
        let bestStart = -1;
        let bestEnd = -1;
        let runStart = -1;
        for (let index = 0; index < length; index += 1) {
          const transparent = alphaAt(index) <= 8;
          if (transparent) {
            if (runStart === -1) {
              runStart = index;
            }
            continue;
          }
          if (runStart !== -1) {
            const runEnd = index - 1;
            if (runEnd - runStart > bestEnd - bestStart) {
              bestStart = runStart;
              bestEnd = runEnd;
            }
            runStart = -1;
          }
        }
        if (runStart !== -1) {
          const runEnd = length - 1;
          if (runEnd - runStart > bestEnd - bestStart) {
            bestStart = runStart;
            bestEnd = runEnd;
          }
        }
        return bestStart >= 0 && bestEnd >= bestStart ? { start: bestStart, end: bestEnd } : null;
      };

      const image = await loadImage(shell.src);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        return null;
      }
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const alphaAt = (x: number, y: number) => data[(y * canvas.width + x) * 4 + 3] ?? 255;

      const centerRow = Math.floor(canvas.height / 2);
      const horizontalRun = findLongestTransparentRun(canvas.width, (x) => alphaAt(x, centerRow));
      if (!horizontalRun) {
        return null;
      }

      const verticalSamplingRatios = [0.15, 0.18, 0.22, 0.26, 0.3];
      const verticalCandidates = verticalSamplingRatios
        .map((ratio) => {
          const column = Math.min(
            canvas.width - 1,
            Math.max(horizontalRun.start + 1, Math.floor(horizontalRun.start + (horizontalRun.end - horizontalRun.start) * ratio)),
          );
          const run = findLongestTransparentRun(canvas.height, (y) => alphaAt(column, y));
          if (!run) {
            return null;
          }
          return {
            column,
            run,
            length: run.end - run.start,
          };
        })
        .filter((candidate): candidate is { column: number; run: { start: number; end: number }; length: number } => candidate !== null)
        .sort((left, right) => right.length - left.length);
      const verticalRun = verticalCandidates[0]?.run;
      if (!verticalRun) {
        return null;
      }

      const shellRect = shell.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      const aaAwareHoleLeft = shellRect.left + ((horizontalRun.start - 1) / canvas.width) * shellRect.width;
      const aaAwareHoleRight = shellRect.left + ((horizontalRun.end + 2) / canvas.width) * shellRect.width;
      const aaAwareHoleTop = shellRect.top + ((verticalRun.start - 1) / canvas.height) * shellRect.height;
      const aaAwareHoleBottom = shellRect.top + ((verticalRun.end + 2) / canvas.height) * shellRect.height;
      const epsilon = 0.6;
      return {
        withinX: screenRect.left <= aaAwareHoleLeft + epsilon && screenRect.right >= aaAwareHoleRight - epsilon,
        withinY: screenRect.top <= aaAwareHoleTop + epsilon && screenRect.bottom >= aaAwareHoleBottom - epsilon,
      };
    });

    expect(compactApertureAlignment).not.toBeNull();
    expect(compactApertureAlignment!.withinX).toBe(true);
    expect(compactApertureAlignment!.withinY).toBe(true);
  });

  test('/gallery preloads critical media and keeps critical mockups ready on repeat entry', async ({ page }) => {
    await page.goto('/gallery');

    const preloadSummary = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('head link[rel="preload"]'));
      const galleryLinks = links
        .map((link) => ({
          href: link.getAttribute('href') ?? '',
          as: link.getAttribute('as') ?? '',
          fetchpriority: link.getAttribute('fetchpriority') ?? '',
        }))
        .filter((link) => link.href.startsWith('/media/gallery/'));

      return {
        count: galleryLinks.length,
        hasPhoneShell: galleryLinks.some((link) => link.href === '/media/gallery/device-shells/phone-shell.webp' && link.as === 'image'),
        hasTabletShell: galleryLinks.some((link) => link.href === '/media/gallery/device-shells/tablet-shell.webp' && link.as === 'image'),
        hasCriticalVideoR1: galleryLinks.some((link) => link.href === '/media/gallery/flows/r1-c2-phone.webm' && link.as === 'video'),
        hasCriticalVideoR2: galleryLinks.some((link) => link.href === '/media/gallery/flows/r2-c3-tablet.webm' && link.as === 'video'),
        allImagePreloadsAreHigh: galleryLinks
          .filter((link) => link.as === 'image')
          .every((link) => link.fetchpriority === 'high'),
      };
    });

    expect(preloadSummary.count).toBe(9);
    expect(preloadSummary.hasPhoneShell).toBe(true);
    expect(preloadSummary.hasTabletShell).toBe(true);
    expect(preloadSummary.hasCriticalVideoR1).toBe(true);
    expect(preloadSummary.hasCriticalVideoR2).toBe(true);
    expect(preloadSummary.allImagePreloadsAreHigh).toBe(true);

    await page.waitForTimeout(1200);
    await page.click('.site-desktop-shell a[data-nav-id="home"]');
    await page.waitForURL('**/');
    await page.waitForTimeout(250);
    await page.click('.site-desktop-shell a[data-nav-id="gallery"]');
    await page.waitForURL('**/gallery');

    await page.waitForTimeout(200);
    const criticalReadyState = await page.evaluate(() => {
      const criticalMockups = Array.from(
        document.querySelectorAll('.gallery-row:nth-child(-n+2) .device-mockup[data-device-priority="critical"]'),
      );

      return {
        count: criticalMockups.length,
        allReady: criticalMockups.every((mockup) => mockup.getAttribute('data-ready') === 'true'),
      };
    });

    expect(criticalReadyState.count).toBe(5);
    expect(criticalReadyState.allReady).toBe(true);
  });

  test('gallery content transition is isolated from shared page-content transition', async ({ page }) => {
    await page.goto('/cases');
    const casesScope = await page.locator('main#content').getAttribute('data-astro-transition-scope');
    expect(casesScope).toBeTruthy();

    await page.goto('/gallery');
    const galleryScope = await page.locator('main#content').getAttribute('data-astro-transition-scope');
    expect(galleryScope).toBeTruthy();
    expect(galleryScope).not.toBe(casesScope);
  });

  test('route transition to home keeps fade only in page-content and removes plus-lighter artifacts', async ({ page }) => {
    await page.goto('/cases');

    await page.evaluate(() => {
      window.__routeTransitionAnimations = [];

      const startedAt = performance.now();
      const record = () => {
        const activeAnimations = document
          .getAnimations()
          .map((animation) => {
            const effect = animation.effect;
            const pseudoElement = effect && typeof effect.pseudoElement === 'string' ? effect.pseudoElement : '';
            return {
              name: animation.animationName || '',
              pseudoElement,
            };
          })
          .filter((entry) => entry.name || entry.pseudoElement.includes('view-transition'));

        window.__routeTransitionAnimations.push(activeAnimations);

        if (performance.now() - startedAt < 1000) {
          requestAnimationFrame(record);
        }
      };

      requestAnimationFrame(record);
    });

    await page.click('a[data-nav-id="home"]');
    await page.waitForTimeout(1100);

    const uniqueAnimations = await page.evaluate(() => {
      const all = (window.__routeTransitionAnimations || []).flat();
      return Array.from(new Set(all.map((entry) => `${entry.name}|${entry.pseudoElement}`))).sort();
    });

    expect(uniqueAnimations).not.toContain('-ua-mix-blend-mode-plus-lighter|::view-transition-new(root)');
    expect(uniqueAnimations).not.toContain('-ua-mix-blend-mode-plus-lighter|::view-transition-old(root)');

    const hasHeaderFooterAstroFade = uniqueAnimations.some((entry) =>
      /astroFade(In|Out)\|::view-transition-(new|old)\(site-(header|footer)\)/.test(entry),
    );
    expect(hasHeaderFooterAstroFade).toBe(false);

    expect(uniqueAnimations).toContain('contentFadeIn|::view-transition-new(page-content)');
    expect(uniqueAnimations).toContain('contentFadeOut|::view-transition-old(page-content)');
  });
});

test.describe('Gallery mobile smoke', () => {
  const resolveExpectedStep = (viewportWidth: number, sectionWidth: number) => {
    const inferredMarginX = Math.max(0, Math.floor((viewportWidth - sectionWidth) / 2));
    const availableWidth = Math.max(40, viewportWidth - inferredMarginX * 2);
    const idealCols = Math.max(6, Math.min(24, Math.round(availableWidth / 40)));
    return Math.max(8, Math.floor(availableWidth / idealCols));
  };

  const resolveQuantizedHeight = (step: number, targetHeight: number, minRows: number) => {
    const rows = Math.max(minRows, Math.round(targetHeight / step));
    return rows * step;
  };

  test('390x844 renders real gallery shell with D-runtime and pair-gap matrix', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-notice')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.gallery-card')).toHaveCount(21);

    const snapshot = await page.evaluate(() => {
      const rowsSection = document.querySelector('.gallery-rows-section');
      const containers = Array.from(document.querySelectorAll('.gallery-card-container'));
      const cards = Array.from(document.querySelectorAll('.gallery-card'));
      if (!(rowsSection instanceof HTMLElement) || containers.length !== cards.length) {
        return null;
      }

      const pairs = containers.map((container, index) => {
        const card = cards[index];
        if (!(container instanceof HTMLElement) || !(card instanceof HTMLElement)) {
          return null;
        }
        const type = (card.getAttribute('data-gallery-card-type') ?? '').trim();
        const kind = type === 'image' ? 'image' : type === 'illustration' ? 'illustration' : 'device';
        const rect = card.getBoundingClientRect();
        const stepNode = card.querySelector('.gallery-card__surface[data-quantized-perimeter]');
        const step = stepNode instanceof HTMLElement ? Number.parseFloat(stepNode.dataset.perimeterStep ?? '') : NaN;
        return {
          type,
          kind,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          step: Number.isFinite(step) ? step : null,
        };
      });

      if (pairs.some((entry) => entry === null)) {
        return null;
      }

      const cardEntries = pairs as Array<{
        type: string;
        kind: 'device' | 'illustration' | 'image';
        top: number;
        bottom: number;
        height: number;
        step: number | null;
      }>;
      const adjacentGaps = cardEntries.slice(1).map((entry, index) => {
        const prev = cardEntries[index];
        const prevPadBottom = Number.parseFloat(containers[index]?.getAttribute('data-gallery-mobile-pad-bottom') ?? '');
        const nextPadTop = Number.parseFloat(containers[index + 1]?.getAttribute('data-gallery-mobile-pad-top') ?? '');
        const resolvedGap = Number.isFinite(prevPadBottom) && Number.isFinite(nextPadTop) ? prevPadBottom + nextPadTop : NaN;
        return {
          fromKind: prev.kind,
          toKind: entry.kind,
          gap: Number.isFinite(resolvedGap) ? Number(resolvedGap.toFixed(2)) : Number((entry.top - prev.bottom).toFixed(2)),
        };
      });
      const surfaceSteps = cardEntries.map((entry) => entry.step).filter((value): value is number => value !== null);

      return {
        viewportWidth: Math.floor(window.innerWidth),
        pageWidth: Number(document.querySelector('.page-shell--gallery')?.getBoundingClientRect().width.toFixed(2) ?? 0),
        rowsSectionWidth: Number(rowsSection.getBoundingClientRect().width.toFixed(2)),
        hasHorizontalOverflow: document.documentElement.scrollWidth - Math.floor(window.innerWidth) > 0,
        surfaceSteps,
        firstFiveIds: cardEntries.slice(0, 5).map((entry, index) => cards[index]?.getAttribute('data-gallery-card-id')),
        cardEntries: cardEntries.map((entry) => ({ kind: entry.kind, height: Number(entry.height.toFixed(2)) })),
        adjacentGaps,
      };
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot!.hasHorizontalOverflow).toBe(false);
    expect(snapshot!.pageWidth).toBeGreaterThanOrEqual(389.5);
    expect(snapshot!.pageWidth).toBeLessThanOrEqual(390.5);
    expect(snapshot!.rowsSectionWidth).toBeGreaterThanOrEqual(349.5);
    expect(snapshot!.rowsSectionWidth).toBeLessThanOrEqual(350.5);
    expect(snapshot!.firstFiveIds).toEqual(['51:5263', '51:5269', '51:5274', '51:5279', '51:5286']);

    const expectedStep = resolveExpectedStep(snapshot!.viewportWidth, snapshot!.rowsSectionWidth);
    const expectedMockHeight = resolveQuantizedHeight(expectedStep, 384, 8);
    const expectedImageHeight = resolveQuantizedHeight(expectedStep, 224, 4);

    expect(snapshot!.surfaceSteps.length).toBe(21);
    expect(snapshot!.surfaceSteps.every((step) => Math.abs(step - expectedStep) <= 0.01)).toBe(true);
    expect(
      snapshot!.cardEntries
        .filter((entry) => entry.kind !== 'image')
        .every((entry) => Math.abs(entry.height - expectedMockHeight) <= 1),
    ).toBe(true);
    expect(
      snapshot!.cardEntries
        .filter((entry) => entry.kind === 'image')
        .every((entry) => Math.abs(entry.height - expectedImageHeight) <= 1),
    ).toBe(true);

    const expectedGapMatrix: Record<
      'device' | 'illustration' | 'image',
      Record<'device' | 'illustration' | 'image', number>
    > = {
      device: { device: 120, illustration: 92, image: 92 },
      illustration: { device: 92, illustration: 64, image: 64 },
      image: { device: 92, illustration: 64, image: 64 },
    };
    expect(
      snapshot!.adjacentGaps.every((entry) => {
        const expectedGap = expectedGapMatrix[entry.fromKind][entry.toKind];
        return Math.abs(entry.gap - expectedGap) <= 1.1;
      }),
    ).toBe(true);
  });

  test('767 keeps real gallery shell and grid-width contract', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-notice')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();

    const snapshot = await page.evaluate(() => {
      const pageShell = document.querySelector('.page-shell--gallery');
      const rowsSection = document.querySelector('.gallery-rows-section');
      if (!(pageShell instanceof HTMLElement) || !(rowsSection instanceof HTMLElement)) {
        return null;
      }
      return {
        viewportWidth: Math.floor(window.innerWidth),
        pageWidth: Number(pageShell.getBoundingClientRect().width.toFixed(2)),
        rowsWidth: Number(rowsSection.getBoundingClientRect().width.toFixed(2)),
        hasOverflow: document.documentElement.scrollWidth - Math.floor(window.innerWidth) > 0,
      };
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot!.hasOverflow).toBe(false);
    expect(snapshot!.pageWidth).toBeGreaterThanOrEqual(766.5);
    expect(snapshot!.pageWidth).toBeLessThanOrEqual(767.5);
    expect(snapshot!.rowsWidth).toBeGreaterThanOrEqual(726.5);
    expect(snapshot!.rowsWidth).toBeLessThanOrEqual(727.5);
  });
});
