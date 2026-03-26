import { devices, expect, test } from '@playwright/test';
import { resolveGalleryMobileExpectations } from './helpers/perimeter-contracts';

const floatingThemeButtonSelector = '.floating-theme-button[data-floating-theme-button]';

const waitForGalleryCriticalReady = async (
  page: import('@playwright/test').Page,
  timeout: number = 8_000,
) => {
  await expect(page.locator('.gallery-card')).toHaveCount(21, { timeout });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const criticalMockups = Array.from(
            document.querySelectorAll('.gallery-row:nth-child(-n+2) .device-mockup[data-device-priority="critical"]'),
          );
          return {
            count: criticalMockups.length,
            allReady: criticalMockups.every((mockup) => mockup.getAttribute('data-ready') === 'true'),
          };
        }),
      { timeout, message: 'Gallery critical mockups should be fully ready' },
    )
    .toEqual({ count: 3, allReady: true });
};

const scrollPageToBottom = async (page: import('@playwright/test').Page, settleMs: number = 180) => {
  await page.evaluate(async ({ settleMs }) => {
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxY <= 0) {
      return;
    }

    const step = Math.max(220, Math.round(window.innerHeight * 0.85));
    let currentY = window.scrollY;
    await new Promise<void>((resolve) => {
      const tick = () => {
        currentY = Math.min(maxY, currentY + step);
        window.scrollTo(0, currentY);
        if (currentY >= maxY) {
          window.setTimeout(resolve, settleMs);
          return;
        }
        window.requestAnimationFrame(tick);
      };
      tick();
    });
  }, { settleMs });
};

const scrollGalleryToTransparentCard = async (page: import('@playwright/test').Page, settleMs: number = 180) => {
  await page.evaluate(async ({ settleMs }) => {
    const target = document.querySelector('.gallery-card-illustration--coin-wheel');
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const targetTop = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - 120));
    window.scrollTo({ top: targetTop, behavior: 'instant' });
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, settleMs);
    });
  }, { settleMs });
};

const readGalleryPlaybackState = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('.gallery-row video')).filter(
      (node): node is HTMLVideoElement => node instanceof HTMLVideoElement,
    );
    const isInView = (video: HTMLVideoElement) => {
      const rect = video.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    };
    const isOffscreen = (video: HTMLVideoElement) => {
      const rect = video.getBoundingClientRect();
      return rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth;
    };

    const inViewVideos = videos.filter(isInView);
    const transparentInViewReadyStates = inViewVideos
      .filter((video) => video.dataset.transparentVideo === 'true')
      .map((video) => video.readyState);

    return {
      path: window.location.pathname,
      totalVideos: videos.length,
      inViewPlaying: inViewVideos.filter((video) => !video.paused && !video.ended).length,
      offscreenPlaying: videos.filter((video) => isOffscreen(video) && !video.paused && !video.ended).length,
      tempShellVideos: document.querySelectorAll('.temporary-adaptive-shell video').length,
      transparentInViewReadyStates,
    };
  });

test.describe('Gallery smoke', () => {
  test.use({ viewport: { width: 1440, height: 1100 } });

  test('/gallery renders webm cards, desktop row-stagger, and critical priority contract', async ({ page }) => {
    await page.addInitScript(() => {
      const timeline = {
        row1Card4StartAt: null as number | null,
        row2Card1StartAt: null as number | null,
      };
      (window as Window & { __galleryRowStaggerTimeline?: typeof timeline }).__galleryRowStaggerTimeline = timeline;

      const waitForTargets = () => {
        const row1Card4 = document.querySelector('.gallery-card-container[data-gallery-flat-index="3"]');
        const row2Card1 = document.querySelector('.gallery-card-container[data-gallery-flat-index="4"]');
        if (!(row1Card4 instanceof HTMLElement) || !(row2Card1 instanceof HTMLElement)) {
          window.requestAnimationFrame(waitForTargets);
          return;
        }

        const watchStart = (element: HTMLElement, key: 'row1Card4StartAt' | 'row2Card1StartAt') => {
          const readScheduledStart = () => {
            const animation = element.getAnimations()[0];
            if (!animation || typeof animation.startTime !== 'number') {
              return null;
            }
            const delay = Number(animation.effect?.getTiming?.().delay ?? 0);
            if (!Number.isFinite(delay)) {
              return null;
            }
            return animation.startTime + delay;
          };

          const tick = () => {
            if (timeline[key] !== null) {
              return;
            }
            const scheduledStart = readScheduledStart();
            if (typeof scheduledStart === 'number') {
              timeline[key] = scheduledStart;
              return;
            }
            window.requestAnimationFrame(tick);
          };
          tick();

          const observer = new MutationObserver(() => {
            if (timeline[key] !== null) {
              return;
            }
            const scheduledStart = readScheduledStart();
            if (typeof scheduledStart === 'number') {
              timeline[key] = scheduledStart;
            }
          });
          observer.observe(element, { attributes: true, attributeFilter: ['style'] });
        };

        watchStart(row1Card4, 'row1Card4StartAt');
        watchStart(row2Card1, 'row2Card1StartAt');
      };

      waitForTargets();
    });

    await page.goto('/gallery');

    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);
    await waitForGalleryCriticalReady(page);

    const desktopDiagnostics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      desktopMq1360: window.matchMedia('(min-width: 1360px)').matches,
      rowMotionCount: document.querySelectorAll('.gallery-row[data-motion-inview]').length,
      rootMotionPreset: document.querySelector('.gallery-rows')?.getAttribute('data-motion-inview') ?? null,
      hasDesktopRuntime: typeof window.__galleryDesktopRowStaggerRuntime !== 'undefined',
    }));
    expect(desktopDiagnostics.desktopMq1360).toBe(true);
    expect(desktopDiagnostics.hasDesktopRuntime).toBe(true);
    expect(desktopDiagnostics.rootMotionPreset).toBe('gallery-first-two-rows-stagger-v1');

    const rows = page.locator('.gallery-row');
    await expect(rows).toHaveCount(6);
    await expect(page.locator('.gallery-rows[data-motion-inview="gallery-first-two-rows-stagger-v1"]')).toHaveCount(1);
    await expect(page.locator('.gallery-row[data-motion-inview="gallery-row-stagger-v1"]')).toHaveCount(4);

    const rowMotionMatrix = await rows.evaluateAll((nodes) =>
      nodes.map((node) => ({
        index: node.getAttribute('data-gallery-row-index'),
        motion: node.getAttribute('data-motion-inview'),
        sequenceAfter: node.getAttribute('data-motion-sequence-after'),
      })),
    );
    expect(rowMotionMatrix[0]?.motion ?? null).toBeNull();
    expect(rowMotionMatrix[1]?.motion ?? null).toBeNull();
    expect(rowMotionMatrix[2]?.motion ?? null).toBe('gallery-row-stagger-v1');
    expect(rowMotionMatrix[3]?.motion ?? null).toBe('gallery-row-stagger-v1');
    expect(rowMotionMatrix[4]?.motion ?? null).toBe('gallery-row-stagger-v1');
    expect(rowMotionMatrix[5]?.motion ?? null).toBe('gallery-row-stagger-v1');
    expect(rowMotionMatrix[0]?.sequenceAfter ?? null).toBeNull();
    expect(rowMotionMatrix[1]?.sequenceAfter ?? null).toBeNull();

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const state = (
              window as Window & {
                __galleryRowStaggerTimeline?: {
                  row1Card4StartAt: number | null;
                  row2Card1StartAt: number | null;
                };
              }
            ).__galleryRowStaggerTimeline;
            if (!state) {
              return null;
            }
            if (state.row1Card4StartAt === null || state.row2Card1StartAt === null) {
              return null;
            }
            return state.row2Card1StartAt - state.row1Card4StartAt;
          }),
        { timeout: 8_000, message: 'Row-2 card-1 should start right after row-1 card-4 in one staged flow' },
      )
      .not.toBeNull();
    const staggerDelta = await page.evaluate(() => {
      const state = (
        window as Window & {
          __galleryRowStaggerTimeline?: {
            row1Card4StartAt: number | null;
            row2Card1StartAt: number | null;
          };
        }
      ).__galleryRowStaggerTimeline;
      if (!state || state.row1Card4StartAt === null || state.row2Card1StartAt === null) {
        return null;
      }
      return state.row2Card1StartAt - state.row1Card4StartAt;
    });
    expect(staggerDelta).not.toBeNull();
    expect(staggerDelta!).toBeGreaterThanOrEqual(40);
    expect(staggerDelta!).toBeLessThanOrEqual(180);

    const cards = page.locator('.gallery-card');
    await expect(cards).toHaveCount(21);
    await expect(page.locator('.gallery-card[data-motion-stagger-item]')).toHaveCount(21);

    const webmVideos = page.locator('.gallery-card .device-mockup video.device-mockup__media');
    await expect(webmVideos).toHaveCount(7);

    const allVideosHavePlaybackContract = await webmVideos.evaluateAll((nodes) =>
      nodes.every((node) => {
        if (!(node instanceof HTMLVideoElement)) {
          return false;
        }
        return (
          node.muted &&
          node.loop &&
          node.playsInline &&
          ['always', 'inview'].includes(node.dataset.videoPlayback ?? '') &&
          node.getAttribute('src')?.endsWith('.webm') === true
        );
      }),
    );
    expect(allVideosHavePlaybackContract).toBe(true);

    const playbackPolicySummary = await webmVideos.evaluateAll((nodes) => {
      let always = 0;
      let inview = 0;
      let inviewWithAutoplay = 0;
      nodes.forEach((node) => {
        if (!(node instanceof HTMLVideoElement)) {
          return;
        }
        const policy = node.dataset.videoPlayback;
        if (policy === 'always') {
          always += 1;
        } else if (policy === 'inview') {
          inview += 1;
          if (node.autoplay) {
            inviewWithAutoplay += 1;
          }
        }
      });
      return { always, inview, inviewWithAutoplay };
    });
    expect(playbackPolicySummary.always).toBe(1);
    expect(playbackPolicySummary.inview).toBe(6);
    expect(playbackPolicySummary.inviewWithAutoplay).toBe(0);

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

    const allMockupVideosHavePosterOverlay = await webmVideos.evaluateAll((nodes) =>
      nodes.every((node) => {
        if (!(node instanceof HTMLVideoElement)) {
          return false;
        }
        const overlay = node.parentElement?.querySelector('.device-mockup__video-poster');
        return overlay instanceof HTMLImageElement && overlay.getAttribute('src')?.length > 0;
      }),
    );
    expect(allMockupVideosHavePosterOverlay).toBe(true);

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
    const coinWheelVideoContract = await coinWheelVideo.evaluate((node) => {
      if (!(node instanceof HTMLVideoElement)) {
        return null;
      }
      return (
        {
          autoplay: node.autoplay,
          muted: node.muted,
          loop: node.loop,
          playsInline: node.playsInline,
          webmSrc: node.dataset.transparentVideoWebm ?? '',
          hevcSrc: node.dataset.transparentVideoHevc ?? '',
          activeSrc: node.dataset.transparentVideoActiveSrc ?? '',
          selectedCodec: node.dataset.transparentVideoCodec ?? '',
          srcAttr: node.getAttribute('src') ?? '',
          poster: node.getAttribute('poster') ?? '',
          currentSrc: node.currentSrc ?? '',
        }
      );
    });
    expect(coinWheelVideoContract).not.toBeNull();
    expect(coinWheelVideoContract!.autoplay).toBe(false);
    expect(coinWheelVideoContract!.muted).toBe(true);
    expect(coinWheelVideoContract!.loop).toBe(true);
    expect(coinWheelVideoContract!.playsInline).toBe(true);
    expect(coinWheelVideoContract!.poster).toBe('/media/gallery/illustrations/coin-wheel.webp');
    expect(coinWheelVideoContract!.webmSrc).toBe('/media/gallery/illustrations/coin-wheel.webm');
    expect(coinWheelVideoContract!.hevcSrc).toBe('/media/gallery/illustrations/coin-wheel.mov');
    expect(
      ['webm-vp9', 'hevc-alpha'].includes(coinWheelVideoContract!.selectedCodec),
      `Unexpected codec marker: ${coinWheelVideoContract!.selectedCodec}`,
    ).toBe(true);
    expect(
      [coinWheelVideoContract!.webmSrc, coinWheelVideoContract!.hevcSrc].includes(
        coinWheelVideoContract!.activeSrc,
      ),
    ).toBe(true);
    expect(coinWheelVideoContract!.srcAttr).toBe(coinWheelVideoContract!.activeSrc);
    expect(coinWheelVideoContract!.currentSrc.endsWith(coinWheelVideoContract!.activeSrc)).toBe(true);

    const loaderLight = page.locator('.gallery-card-illustration--cube video.gallery-card-illustration__asset--cube');
    await expect(loaderLight).toHaveCount(1);
    const loaderLightContract = await loaderLight.evaluate((node) => {
      if (!(node instanceof HTMLVideoElement)) {
        return null;
      }
      return (
        {
          autoplay: node.autoplay,
          muted: node.muted,
          loop: node.loop,
          playsInline: node.playsInline,
          webmSrc: node.dataset.transparentVideoWebm ?? '',
          hevcSrc: node.dataset.transparentVideoHevc ?? '',
          activeSrc: node.dataset.transparentVideoActiveSrc ?? '',
          selectedCodec: node.dataset.transparentVideoCodec ?? '',
          srcAttr: node.getAttribute('src') ?? '',
          poster: node.getAttribute('poster') ?? '',
          currentSrc: node.currentSrc ?? '',
        }
      );
    });
    expect(loaderLightContract).not.toBeNull();
    expect(loaderLightContract!.autoplay).toBe(false);
    expect(loaderLightContract!.muted).toBe(true);
    expect(loaderLightContract!.loop).toBe(true);
    expect(loaderLightContract!.playsInline).toBe(true);
    expect(loaderLightContract!.poster).toBe('/media/gallery/illustrations/cube.webp');
    expect(loaderLightContract!.webmSrc).toBe('/media/gallery/illustrations/loader-light.webm');
    expect(loaderLightContract!.hevcSrc).toBe('/media/gallery/illustrations/loader-light.mov');
    expect(
      ['webm-vp9', 'hevc-alpha'].includes(loaderLightContract!.selectedCodec),
      `Unexpected codec marker: ${loaderLightContract!.selectedCodec}`,
    ).toBe(true);
    expect(
      [loaderLightContract!.webmSrc, loaderLightContract!.hevcSrc].includes(
        loaderLightContract!.activeSrc,
      ),
    ).toBe(true);
    expect(loaderLightContract!.srcAttr).toBe(loaderLightContract!.activeSrc);
    expect(loaderLightContract!.currentSrc.endsWith(loaderLightContract!.activeSrc)).toBe(true);

    const criticalDeviceCards = page.locator('.gallery-card[data-gallery-card-priority="critical"]');
    await expect(criticalDeviceCards).toHaveCount(3);

    const lazyDeviceCards = page.locator(
      '.gallery-card[data-gallery-card-priority="lazy"][data-gallery-card-type="phone"], .gallery-card[data-gallery-card-priority="lazy"][data-gallery-card-type="tablet"]',
    );
    await expect(lazyDeviceCards).toHaveCount(11);

    const criticalShellsAreEager = await page
      .locator('.gallery-card[data-gallery-card-priority="critical"] .device-mockup__shell')
      .evaluateAll((nodes) =>
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
    await waitForGalleryCriticalReady(page);

    const preloadSummary = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('head link[rel="preload"]'));
      const galleryLinks = links
        .map((link) => ({
          href: link.getAttribute('href') ?? '',
          as: link.getAttribute('as') ?? '',
          fetchpriority: link.getAttribute('fetchpriority') ?? '',
          media: link.getAttribute('media') ?? '',
        }))
        .filter((link) => link.href.startsWith('/media/gallery/'));

      return {
        count: galleryLinks.length,
        hasPhoneShell: galleryLinks.some((link) => link.href === '/media/gallery/device-shells/phone-shell.webp' && link.as === 'image'),
        hasTabletShell: galleryLinks.some((link) => link.href === '/media/gallery/device-shells/tablet-shell.webp' && link.as === 'image'),
        hasCriticalVideoR1: galleryLinks.some(
          (link) => link.href === '/media/gallery/flows/r1-c2-phone.webm' && link.as === 'video',
        ),
        hasCriticalVideoR2: galleryLinks.some(
          (link) => link.href === '/media/gallery/flows/r2-c3-tablet.webm' && link.as === 'video',
        ),
        allVideoPreloadsUseMobileGuard: galleryLinks
          .filter((link) => link.as === 'video')
          .every((link) => link.media === '(min-width: 768px)'),
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
    expect(preloadSummary.allVideoPreloadsUseMobileGuard).toBe(true);
    expect(preloadSummary.allImagePreloadsAreHigh).toBe(true);

    await page.click('.site-desktop-shell a[data-nav-id="home"]');
    await page.waitForURL('**/');
    await expect
      .poll(() => page.evaluate(() => document.body.getAttribute('data-route-home')), { timeout: 3000 })
      .toBe('true');
    await page.click('.site-desktop-shell a[data-nav-id="gallery"]');
    await page.waitForURL('**/gallery');
    await waitForGalleryCriticalReady(page);
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
    await page.waitForURL('**/');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const all = (window.__routeTransitionAnimations || []).flat();
            return Array.from(new Set(all.map((entry) => `${entry.name}|${entry.pseudoElement}`))).sort();
          }),
        { timeout: 3000 },
      )
      .toContain('contentFadeIn|::view-transition-new(page-content)');

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

test.describe('Gallery tablet smoke', () => {
  test('1024x1100 renders real gallery shell and hides temporary adaptive shell', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1100 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-shell')).toHaveCount(0);
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.gallery-row[data-motion-inview]')).toHaveCount(0);

    const tabletVisibilitySnapshot = await page.evaluate(() => {
      const firstRow = document.querySelector('.gallery-row');
      const firstCard = document.querySelector('.gallery-card');
      if (!(firstRow instanceof HTMLElement) || !(firstCard instanceof HTMLElement)) {
        return null;
      }
      return {
        firstRowHasMotion: firstRow.hasAttribute('data-motion-inview'),
        firstCardOpacity: getComputedStyle(firstCard).opacity,
      };
    });
    expect(tabletVisibilitySnapshot).not.toBeNull();
    expect(tabletVisibilitySnapshot!.firstRowHasMotion).toBe(false);
    expect(tabletVisibilitySnapshot!.firstCardOpacity).toBe('1');
  });

  test('gallery header and page-shell top stay compact through 847 and switch at 848', async ({ page }) => {
    const cases = [
      { width: 768, expectedHeaderPaddingTop: '24px', expectedShellPaddingTop: '64px' },
      { width: 820, expectedHeaderPaddingTop: '24px', expectedShellPaddingTop: '64px' },
      { width: 847, expectedHeaderPaddingTop: '24px', expectedShellPaddingTop: '64px' },
      { width: 848, expectedHeaderPaddingTop: '56px', expectedShellPaddingTop: '144px' },
    ] as const;

    for (const currentCase of cases) {
      await page.setViewportSize({ width: currentCase.width, height: 1100 });
      await page.goto('/gallery');

      const snapshot = await page.evaluate(() => {
        const header = document.querySelector('.site-header-inner');
        const shell = document.querySelector('main.page-shell--gallery');
        if (!(header instanceof HTMLElement) || !(shell instanceof HTMLElement)) {
          return null;
        }
        return {
          headerPaddingTop: getComputedStyle(header).paddingTop,
          shellPaddingTop: getComputedStyle(shell).paddingTop,
        };
      });

      expect(snapshot).not.toBeNull();
      expect(snapshot!.headerPaddingTop).toBe(currentCase.expectedHeaderPaddingTop);
      expect(snapshot!.shellPaddingTop).toBe(currentCase.expectedShellPaddingTop);
    }
  });

  test('820 keeps desktop initial final-cta morph vars on gallery', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    await page.goto('/gallery');
    await waitForGalleryCriticalReady(page);

    const setSectionTop = async (targetTop: number) => {
      await page.evaluate((nextTop) => {
        const section = document.querySelector('.final-cta-section');
        if (!(section instanceof HTMLElement)) {
          return;
        }
        const currentTop = section.getBoundingClientRect().top;
        window.scrollBy(0, currentTop - nextTop);
      }, targetTop);
    };

    const snapshot = async () =>
      page.evaluate(() => {
        const section = document.querySelector('.final-cta-section');
        const title = document.querySelector('.final-cta-title');
        if (!(section instanceof HTMLElement) || !(title instanceof HTMLElement)) {
          return null;
        }
        return {
          triggerLineY: window.innerHeight * 0.3,
          sectionTop: section.getBoundingClientRect().top,
          titleFlexDirection: getComputedStyle(title).flexDirection,
          titleGapVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-gap') || '0'),
          titleOffsetYVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-offset-y') || '0'),
          orbRotateVar: section.style.getPropertyValue('--final-cta-orb-rotate').trim(),
        };
      });

    await setSectionTop(360);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(120);

    const initialSnapshot = await snapshot();
    expect(initialSnapshot).not.toBeNull();
    expect(initialSnapshot!.sectionTop).toBeGreaterThan(initialSnapshot!.triggerLineY);
    expect(initialSnapshot!.titleFlexDirection).toBe('row');
    expect(Math.abs(initialSnapshot!.titleGapVar - 350)).toBeLessThanOrEqual(2);
    expect(Math.abs(initialSnapshot!.titleOffsetYVar)).toBeLessThanOrEqual(1);
    expect(Math.abs(initialSnapshot!.titleGapVar - 210)).toBeGreaterThan(20);
    expect(initialSnapshot!.orbRotateVar === '90deg' || initialSnapshot!.orbRotateVar === '-270deg').toBe(true);
  });

  test('gallery tablet container thresholds follow 8->6->4 and keep dense lines', async ({ page }) => {
    const cases = [{ width: 1359 }, { width: 1200 }, { width: 1080 }, { width: 980 }, { width: 848 }, { width: 847 }] as const;

    for (const testCase of cases) {
      await page.setViewportSize({ width: testCase.width, height: 1100 });
      await page.goto('/gallery');
      await waitForGalleryCriticalReady(page);

      await expect(page.locator('.temporary-adaptive-shell')).toHaveCount(0);
      await expect(page.locator('.site-desktop-shell')).toBeVisible();

      const snapshot = await page.evaluate(() => {
        const rootGrid = document.querySelector('.gallery-rows');
        const containers = Array.from(document.querySelectorAll('.gallery-card-container'));
        if (!(rootGrid instanceof HTMLElement) || containers.length === 0) {
          return null;
        }

        const styles = getComputedStyle(rootGrid);
        const template = styles.gridTemplateColumns.trim();
        const columnCount = template.length === 0 || template === 'none' ? 0 : template.split(/\s+/).length;
        const spanByTop: Array<{ top: number; span: number }> = [];
        containers.forEach((container) => {
          if (!(container instanceof HTMLElement)) {
            return;
          }
          const rect = container.getBoundingClientRect();
          const span = container.classList.contains('gallery-card-container--span-4') ? 4 : 2;
          spanByTop.push({ top: rect.top, span });
        });
        spanByTop.sort((left, right) => left.top - right.top);
        const lines: Array<{ top: number; total: number }> = [];
        const epsilon = 2;
        for (const entry of spanByTop) {
          const lastLine = lines.at(-1);
          if (lastLine && Math.abs(entry.top - lastLine.top) <= epsilon) {
            lastLine.total += entry.span;
          } else {
            lines.push({ top: entry.top, total: entry.span });
          }
        }
        const lineTotals = lines.map((line) => line.total);

        return {
          rootWidth: Number(rootGrid.getBoundingClientRect().width.toFixed(2)),
          columnCount,
          rowGap: styles.rowGap,
          lineTotals,
          hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });

      expect(snapshot).not.toBeNull();
      const expectedColumns = snapshot!.rootWidth < 1032 ? 4 : snapshot!.rootWidth < 1224 ? 6 : 8;
      expect(snapshot!.columnCount).toBe(expectedColumns);
      expect(snapshot!.hasHorizontalOverflow).toBe(false);
      expect(snapshot!.rowGap).toBe('120px');
      expect(snapshot!.lineTotals.length).toBeGreaterThan(0);
      if (snapshot!.lineTotals.length > 1) {
        const completeLines = snapshot!.lineTotals.slice(0, -1);
        expect(completeLines.every((total) => total === expectedColumns)).toBe(true);
      }
    }
  });
});

test.describe('Gallery mobile smoke', () => {
  test('390x844 renders real gallery shell with D-runtime and pair-gap matrix', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-shell')).toHaveCount(0);
    await expect(page.locator('.temporary-adaptive-notice')).toHaveCount(0);
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.gallery-row[data-motion-inview]')).toHaveCount(0);
    await expect(page.locator('.gallery-card')).toHaveCount(21);

    const snapshot = await page.evaluate(() => {
      const rowsSection = document.querySelector('.gallery-rows-section');
      const firstRow = document.querySelector('.gallery-row');
      const firstCard = document.querySelector('.gallery-card');
      const containers = Array.from(document.querySelectorAll('.gallery-card-container'));
      const cards = Array.from(document.querySelectorAll('.gallery-card'));
      if (
        !(rowsSection instanceof HTMLElement) ||
        !(firstRow instanceof HTMLElement) ||
        !(firstCard instanceof HTMLElement) ||
        containers.length !== cards.length
      ) {
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
        contentViewportWidth: Math.floor(document.documentElement.clientWidth || window.innerWidth),
        firstRowHasMotion: firstRow.hasAttribute('data-motion-inview'),
        firstCardOpacity: getComputedStyle(firstCard).opacity,
        pageWidth: Number(document.querySelector('.page-shell--gallery')?.getBoundingClientRect().width.toFixed(2) ?? 0),
        expectedRowsSectionWidthCandidates: [
          Number((Math.max(0, window.innerWidth - 40)).toFixed(2)),
          Number((Math.max(0, (document.documentElement.clientWidth || window.innerWidth) - 40)).toFixed(2)),
        ],
        rowsSectionWidth: Number(rowsSection.getBoundingClientRect().width.toFixed(2)),
        hasHorizontalOverflow:
          document.documentElement.scrollWidth - Math.floor(document.documentElement.clientWidth || window.innerWidth) > 0,
        surfaceSteps,
        firstFiveIds: cardEntries.slice(0, 5).map((entry, index) => cards[index]?.getAttribute('data-gallery-card-id')),
        cardEntries: cardEntries.map((entry) => ({ kind: entry.kind, height: Number(entry.height.toFixed(2)) })),
        adjacentGaps,
      };
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot!.hasHorizontalOverflow).toBe(false);
    expect(snapshot!.firstRowHasMotion).toBe(false);
    expect(snapshot!.firstCardOpacity).toBe('1');
    expect(snapshot!.pageWidth).toBeGreaterThan(0);
    expect(
      snapshot!.expectedRowsSectionWidthCandidates.some((expected) => Math.abs(snapshot!.rowsSectionWidth - expected) <= 1),
    ).toBe(true);
    expect(snapshot!.firstFiveIds).toEqual(['51:5263', '51:5269', '51:5274', '51:5279', '51:5286']);

    const expected = resolveGalleryMobileExpectations({
      viewportWidth: snapshot!.viewportWidth,
      sectionWidth: snapshot!.rowsSectionWidth,
    });

    expect(snapshot!.surfaceSteps.length).toBe(21);
    expect(snapshot!.surfaceSteps.every((step) => Math.abs(step - expected.step) <= 0.01)).toBe(true);
    expect(
      snapshot!.cardEntries
        .filter((entry) => entry.kind !== 'image')
        .every((entry) => Math.abs(entry.height - expected.mockHeight) <= 1),
    ).toBe(true);
    expect(
      snapshot!.cardEntries
        .filter((entry) => entry.kind === 'image')
        .every((entry) => Math.abs(entry.height - expected.imageHeight) <= 1),
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

  test('390x844 final cta morph matches home-consistent initial/final title states on gallery', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');
    await waitForGalleryCriticalReady(page);
    const routeDiagnostics = await page.evaluate(() => ({
      pathname: window.location.pathname,
      routeGallery: document.body.dataset.routeGallery ?? null,
      routeHome: document.body.dataset.routeHome ?? null,
      routeCases: document.body.dataset.routeCases ?? null,
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      mq767: window.matchMedia('(max-width: 767px)').matches,
      mq847: window.matchMedia('(max-width: 847px)').matches,
    }));
    expect(routeDiagnostics.pathname).toBe('/gallery');
    expect(routeDiagnostics.routeGallery).toBe('true');
    expect(routeDiagnostics.routeHome).toBe('false');
    expect(routeDiagnostics.routeCases).toBe('false');
    expect(routeDiagnostics.mq767).toBe(true);
    expect(routeDiagnostics.mq847).toBe(true);

    const readStateAtTop = async (targetTop: number) =>
      page.evaluate((nextTop) => {
        const section = document.querySelector('.final-cta-section');
        const wrap = document.querySelector('.final-cta-title-wrap');
        const title = document.querySelector('.final-cta-title');
        if (!(section instanceof HTMLElement) || !(wrap instanceof HTMLElement) || !(title instanceof HTMLElement)) {
          return null;
        }

        const currentTop = section.getBoundingClientRect().top;
        window.scrollBy(0, currentTop - nextTop);
        window.dispatchEvent(new Event('resize'));

        return {
          triggerLineY: window.innerHeight * 0.3,
          sectionTop: section.getBoundingClientRect().top,
          titleTopWithinWrap: title.getBoundingClientRect().top - wrap.getBoundingClientRect().top,
          titleFlexDirection: getComputedStyle(title).flexDirection,
          titleOffsetYVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-offset-y') || '0'),
          titleGapVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-gap') || '0'),
          orbRotateVar: section.style.getPropertyValue('--final-cta-orb-rotate').trim(),
        };
      }, targetTop);

    const initialSnapshot = await readStateAtTop(360);
    expect(initialSnapshot).not.toBeNull();
    expect(initialSnapshot!.sectionTop).toBeGreaterThan(initialSnapshot!.triggerLineY);
    expect(initialSnapshot!.titleFlexDirection).toBe('column');
    expect(Math.abs(initialSnapshot!.titleGapVar - 210)).toBeLessThanOrEqual(2);
    expect(Math.abs(initialSnapshot!.titleOffsetYVar - -109)).toBeLessThanOrEqual(2);
    expect(initialSnapshot!.orbRotateVar === '90deg' || initialSnapshot!.orbRotateVar === '-270deg').toBe(true);

    const finalSnapshot = await readStateAtTop(-260);
    expect(finalSnapshot).not.toBeNull();
    expect(finalSnapshot!.sectionTop).toBeLessThanOrEqual(finalSnapshot!.triggerLineY);
    expect(finalSnapshot!.titleFlexDirection).toBe('column');
    expect(Math.abs(finalSnapshot!.titleGapVar - -8)).toBeLessThanOrEqual(2);
    expect(Math.abs(finalSnapshot!.titleOffsetYVar)).toBeLessThanOrEqual(2);
    expect(Math.abs(finalSnapshot!.titleTopWithinWrap - 92)).toBeLessThanOrEqual(4);
    expect(finalSnapshot!.orbRotateVar === '0deg' || finalSnapshot!.orbRotateVar === '-0deg').toBe(true);
  });

  test('390x844 keeps offscreen in-view videos paused', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');
    await waitForGalleryCriticalReady(page);
    await page.waitForTimeout(700);

    const playbackSnapshot = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('.gallery-row video')).filter(
        (node): node is HTMLVideoElement => node instanceof HTMLVideoElement,
      );
      if (videos.length === 0) {
        return null;
      }
      const isOffscreen = (node: HTMLVideoElement) => {
        const rect = node.getBoundingClientRect();
        return rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth;
      };

      let offscreenPlaying = 0;
      let inviewPolicyCount = 0;
      let inviewWithAutoplayCount = 0;

      videos.forEach((video) => {
        if (video.dataset.videoPlayback === 'inview') {
          inviewPolicyCount += 1;
          if (video.autoplay) {
            inviewWithAutoplayCount += 1;
          }
        }
        const isPlaying = !video.paused && !video.ended;
        if (isOffscreen(video) && isPlaying) {
          offscreenPlaying += 1;
        }
      });

      return {
        totalVideos: videos.length,
        offscreenPlaying,
        inviewPolicyCount,
        inviewWithAutoplayCount,
      };
    });

    expect(playbackSnapshot).not.toBeNull();
    expect(playbackSnapshot!.totalVideos).toBe(9);
    expect(playbackSnapshot!.offscreenPlaying).toBe(0);
    expect(playbackSnapshot!.inviewPolicyCount).toBeGreaterThan(0);
    expect(playbackSnapshot!.inviewWithAutoplayCount).toBe(0);
  });

  test('390x844 keeps poster overlay visible until frame-ready for lazy mockup video', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');
    await waitForGalleryCriticalReady(page);

    const transitionSnapshot = await page.evaluate(async () => {
      const targetCard = document.querySelector('.gallery-card[data-gallery-card-id="53:5327"]');
      if (!(targetCard instanceof HTMLElement)) {
        return null;
      }
      const mockup = targetCard.querySelector('.device-mockup');
      const video = targetCard.querySelector('video.device-mockup__media--video');
      const poster = targetCard.querySelector('.device-mockup__video-poster');
      if (!(mockup instanceof HTMLElement) || !(video instanceof HTMLVideoElement) || !(poster instanceof HTMLImageElement)) {
        return null;
      }

      const targetTop = Math.max(0, Math.round(targetCard.getBoundingClientRect().top + window.scrollY - 120));
      window.scrollTo({ top: targetTop, behavior: 'instant' });
      await new Promise((resolve) => window.setTimeout(resolve, 80));

      const samples = [];
      const start = performance.now();
      while (performance.now() - start < 3500) {
        const styles = getComputedStyle(poster);
        const posterVisible = styles.display !== 'none' && Number.parseFloat(styles.opacity || '1') > 0.05;
        const frameReady = mockup.getAttribute('data-video-frame-ready') === 'true';
        samples.push({
          frameReady,
          posterVisible,
          readyState: video.readyState,
          paused: video.paused,
        });
        await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      }

      const hasGapBeforeFrameReady = samples.some((sample) => !sample.frameReady && !sample.posterVisible);
      const reachedFrameReady = samples.some((sample) => sample.frameReady);
      const playedAfterFrameReady = samples.some((sample) => sample.frameReady && !sample.paused);

      return {
        hasGapBeforeFrameReady,
        reachedFrameReady,
        playedAfterFrameReady,
      };
    });

    expect(transitionSnapshot).not.toBeNull();
    expect(transitionSnapshot!.hasGapBeforeFrameReady).toBe(false);
    expect(transitionSnapshot!.reachedFrameReady).toBe(true);
    expect(transitionSnapshot!.playedAfterFrameReady).toBe(true);
  });

  test('mobile home <-> gallery soft-nav keeps bounded video budget for 10 cycles', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const routeBudget = async () =>
      page.evaluate(() => {
        const allVideos = Array.from(document.querySelectorAll('video')).filter(
          (node): node is HTMLVideoElement => node instanceof HTMLVideoElement,
        );
        return {
          path: window.location.pathname,
          totalVideos: allVideos.length,
          tempShellVideos: document.querySelectorAll('.temporary-adaptive-shell video').length,
          homeSliderVideos: document.querySelectorAll('.home-hero-mobile [data-temp-slider] video').length,
          playingVideos: allVideos.filter((video) => !video.paused && !video.ended).length,
        };
      });

    const snapshots: Array<{
      path: string;
      totalVideos: number;
      tempShellVideos: number;
      homeSliderVideos: number;
      playingVideos: number;
    }> = [];

    for (let cycle = 0; cycle < 10; cycle += 1) {
      await page.click('.site-desktop-shell a[data-nav-id="gallery"]');
      await page.waitForURL('**/gallery');
      snapshots.push(await routeBudget());

      await page.click('.site-desktop-shell a[data-nav-id="home"]');
      await page.waitForURL('**/');
      snapshots.push(await routeBudget());
    }

    const gallerySnapshots = snapshots.filter((snapshot) => snapshot.path.startsWith('/gallery'));
    const homeSnapshots = snapshots.filter((snapshot) => snapshot.path === '/');

    expect(gallerySnapshots.length).toBe(10);
    expect(homeSnapshots.length).toBe(10);
    expect(gallerySnapshots.every((snapshot) => snapshot.tempShellVideos === 0)).toBe(true);
    expect(homeSnapshots.every((snapshot) => snapshot.tempShellVideos === 0)).toBe(true);
    expect(homeSnapshots.every((snapshot) => snapshot.homeSliderVideos === 0)).toBe(true);
    expect(gallerySnapshots.every((snapshot) => snapshot.totalVideos <= 10)).toBe(true);
    expect(homeSnapshots.every((snapshot) => snapshot.totalVideos <= 3)).toBe(true);
  });

  test('webkit mobile stress iOS WebKit mobile reload keeps gallery videos playable', async ({
    browser,
    browserName,
    baseURL,
  }) => {
    test.skip(browserName !== 'webkit', 'WebKit-only iOS reload regression guard');
    test.setTimeout(180_000);

    const context = await browser.newContext({
      ...devices['iPhone 13'],
      baseURL: baseURL ?? 'http://127.0.0.1:4173',
    });
    const page = await context.newPage();

    const crashEvents: string[] = [];
    page.on('crash', () => {
      crashEvents.push('crash');
    });

    const snapshots: Array<{
      path: string;
      totalVideos: number;
      inViewPlaying: number;
      offscreenPlaying: number;
      tempShellVideos: number;
      transparentInViewReadyStates: number[];
    }> = [];

    const waitForPlayableInView = async (label: string) => {
      await expect
        .poll(
          async () => {
            const state = await readGalleryPlaybackState(page);
            const transparentReady =
              state.transparentInViewReadyStates.length > 0 &&
              state.transparentInViewReadyStates.every((readyState) => readyState >= 2);
            return (
              state.inViewPlaying > 0 &&
              state.offscreenPlaying === 0 &&
              state.tempShellVideos === 0 &&
              transparentReady
            );
          },
          {
            timeout: 12_000,
            message: `${label}: gallery in-view media should stay playable after refresh/navigation`,
          },
        )
        .toBe(true);
      snapshots.push(await readGalleryPlaybackState(page));
    };

    const navigateViaHeaderWithFallback = async (
      navId: 'home' | 'gallery',
      expectedPath: '/' | '/gallery',
      fallbackHref: '/' | '/gallery/',
    ) => {
      const selector = `.site-desktop-shell a[data-nav-id="${navId}"]`;
      await page.click(selector);
      const navigatedViaSoftNav = await page
        .waitForFunction(
          (targetPath) => {
            const path = window.location.pathname;
            return path === targetPath || path === `${targetPath}/`;
          },
          expectedPath,
          { timeout: 8_000 },
        )
        .then(() => true)
        .catch(() => false);

      if (!navigatedViaSoftNav) {
        await page.goto(fallbackHref);
      }
      await page.waitForTimeout(250);
    };

    try {
      await page.goto('/gallery/');
      await waitForGalleryCriticalReady(page);
      await scrollGalleryToTransparentCard(page);
      await waitForPlayableInView('first gallery load');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForGalleryCriticalReady(page);
      await scrollGalleryToTransparentCard(page);
      await waitForPlayableInView('gallery reload');

      await navigateViaHeaderWithFallback('home', '/', '/');
      await navigateViaHeaderWithFallback('gallery', '/gallery', '/gallery/');
      await waitForGalleryCriticalReady(page);
      await scrollGalleryToTransparentCard(page);
      await waitForPlayableInView('gallery re-entry from home');

      expect(crashEvents).toHaveLength(0);
      expect(snapshots).toHaveLength(3);
      expect(snapshots.every((snapshot) => snapshot.path === '/gallery' || snapshot.path === '/gallery/')).toBe(true);
      expect(snapshots.every((snapshot) => snapshot.totalVideos <= 10)).toBe(true);
      expect(snapshots.every((snapshot) => snapshot.offscreenPlaying === 0)).toBe(true);
      expect(snapshots.every((snapshot) => snapshot.inViewPlaying > 0)).toBe(true);
      expect(
        snapshots.every(
          (snapshot) =>
            snapshot.transparentInViewReadyStates.length > 0 &&
            snapshot.transparentInViewReadyStates.every((readyState) => readyState >= 2),
        ),
      ).toBe(true);
    } finally {
      await context.close();
    }
  });

  test('webkit mobile deep-scroll soft-nav gallery-home-gallery keeps page stable', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'webkit', 'WebKit-only deep-scroll soft-nav scenario');
    test.setTimeout(360_000);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery/');
    await waitForGalleryCriticalReady(page);

    const crashEvents: string[] = [];
    page.on('crash', () => {
      crashEvents.push('crash');
    });

    const readRouteState = async () =>
      page.evaluate(() => {
        const allVideos = Array.from(document.querySelectorAll('video')).filter(
          (node): node is HTMLVideoElement => node instanceof HTMLVideoElement,
        );
        const isOffscreen = (node: HTMLVideoElement) => {
          const rect = node.getBoundingClientRect();
          return (
            rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth
          );
        };
        return {
          path: window.location.pathname,
          totalVideos: allVideos.length,
          offscreenPlaying: allVideos.filter((video) => isOffscreen(video) && !video.paused && !video.ended).length,
          tempShellVideos: document.querySelectorAll('.temporary-adaptive-shell video').length,
        };
      });

    const snapshots: Array<{ path: string; totalVideos: number; offscreenPlaying: number; tempShellVideos: number }> = [];
    const navigateViaHeaderWithFallback = async (
      navId: 'home' | 'gallery',
      expectedPath: '/' | '/gallery',
      fallbackHref: '/' | '/gallery/',
    ) => {
      const selector = `.site-desktop-shell a[data-nav-id="${navId}"]`;
      await page.click(selector);
      const navigatedViaSoftNav = await page
        .waitForFunction(
          (targetPath) => {
            const path = window.location.pathname;
            return path === targetPath || path === `${targetPath}/`;
          },
          expectedPath,
          { timeout: 8_000 },
        )
        .then(() => true)
        .catch(() => false);

      if (!navigatedViaSoftNav) {
        await page.goto(fallbackHref);
      }
      await page.waitForTimeout(250);
    };

    for (let cycle = 0; cycle < 10; cycle += 1) {
      await scrollPageToBottom(page);
      snapshots.push(await readRouteState());

      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(120);
      await navigateViaHeaderWithFallback('home', '/', '/');
      await scrollPageToBottom(page);
      snapshots.push(await readRouteState());

      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(120);
      await navigateViaHeaderWithFallback('gallery', '/gallery', '/gallery/');
      await waitForGalleryCriticalReady(page);
      await scrollPageToBottom(page);
      snapshots.push(await readRouteState());
    }

    const gallerySnapshots = snapshots.filter((snapshot) => snapshot.path.startsWith('/gallery'));
    const homeSnapshots = snapshots.filter((snapshot) => snapshot.path === '/');

    expect(crashEvents).toHaveLength(0);
    expect(snapshots).toHaveLength(30);
    expect(gallerySnapshots.length).toBeGreaterThanOrEqual(19);
    expect(homeSnapshots.length).toBeGreaterThanOrEqual(10);
    expect(snapshots.every((snapshot) => snapshot.tempShellVideos === 0)).toBe(true);
    expect(gallerySnapshots.every((snapshot) => snapshot.totalVideos <= 10)).toBe(true);
    expect(homeSnapshots.every((snapshot) => snapshot.totalVideos <= 3)).toBe(true);
    expect(snapshots.every((snapshot) => snapshot.offscreenPlaying === 0)).toBe(true);
  });

  test('webkit mobile stress route cycle keeps offscreen videos paused and budget bounded', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'webkit', 'WebKit-only stress scenario for iOS-like behavior');
    test.setTimeout(240_000);

    await page.setViewportSize({ width: 390, height: 844 });

    const readRouteState = async () =>
      page.evaluate(() => {
        const allVideos = Array.from(document.querySelectorAll('video')).filter(
          (node): node is HTMLVideoElement => node instanceof HTMLVideoElement,
        );
        const isOffscreen = (node: HTMLVideoElement) => {
          const rect = node.getBoundingClientRect();
          return (
            rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth
          );
        };
        return {
          path: window.location.pathname,
          totalVideos: allVideos.length,
          tempShellVideos: document.querySelectorAll('.temporary-adaptive-shell video').length,
          offscreenPlaying: allVideos.filter((video) => isOffscreen(video) && !video.paused && !video.ended).length,
        };
      });

    const routeSequence = ['/', '/cases', '/fora', '/kissa', '/gallery', '/'] as const;
    const snapshots: Array<{ path: string; totalVideos: number; tempShellVideos: number; offscreenPlaying: number }> = [];

    await page.goto('/');
    snapshots.push(await readRouteState());

    for (let cycle = 0; cycle < 10; cycle += 1) {
      for (const route of routeSequence.slice(1)) {
        await page.goto(route);
        if (route === '/gallery') {
          await waitForGalleryCriticalReady(page);
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
          await page.waitForTimeout(800);
          snapshots.push(await readRouteState());
          await page.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(250);
          continue;
        }
        snapshots.push(await readRouteState());
      }
    }

    const gallerySnapshots = snapshots.filter((snapshot) => snapshot.path === '/gallery');
    const homeSnapshots = snapshots.filter((snapshot) => snapshot.path === '/');
    const casesSnapshots = snapshots.filter((snapshot) => snapshot.path === '/cases');
    const monitoredSnapshots = snapshots.filter(
      (snapshot) => snapshot.path === '/' || snapshot.path === '/cases' || snapshot.path === '/gallery',
    );
    const allTempShellHidden = snapshots.every((snapshot) => snapshot.tempShellVideos === 0);

    expect(gallerySnapshots.length).toBe(10);
    expect(homeSnapshots.length).toBe(11);
    expect(allTempShellHidden).toBe(true);
    expect(gallerySnapshots.every((snapshot) => snapshot.totalVideos <= 10)).toBe(true);
    expect(homeSnapshots.every((snapshot) => snapshot.totalVideos <= 3)).toBe(true);
    expect(casesSnapshots.every((snapshot) => snapshot.totalVideos <= 3)).toBe(true);
    expect(monitoredSnapshots.every((snapshot) => snapshot.offscreenPlaying === 0)).toBe(true);
  });

  test('767 keeps real gallery shell and grid-width contract', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto('/gallery');
    await waitForGalleryCriticalReady(page);

    await expect(page.locator('.temporary-adaptive-shell')).toHaveCount(0);
    await expect(page.locator('.temporary-adaptive-notice')).toHaveCount(0);
    await expect(page.locator('.site-desktop-shell')).toBeVisible();

    const snapshot = await page.evaluate(() => {
      const pageShell = document.querySelector('.page-shell--gallery');
      const rowsSection = document.querySelector('.gallery-rows-section');
      if (!(pageShell instanceof HTMLElement) || !(rowsSection instanceof HTMLElement)) {
        return null;
      }
      return {
        viewportWidth: Math.floor(window.innerWidth),
        contentViewportWidth: Math.floor(document.documentElement.clientWidth || window.innerWidth),
        pageWidth: Number(pageShell.getBoundingClientRect().width.toFixed(2)),
        expectedRowsWidthCandidates: [
          Number((Math.max(0, window.innerWidth - 40)).toFixed(2)),
          Number((Math.max(0, (document.documentElement.clientWidth || window.innerWidth) - 40)).toFixed(2)),
        ],
        rowsWidth: Number(rowsSection.getBoundingClientRect().width.toFixed(2)),
        hasOverflow:
          document.documentElement.scrollWidth - Math.floor(document.documentElement.clientWidth || window.innerWidth) > 0,
      };
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot!.hasOverflow).toBe(false);
    expect(snapshot!.pageWidth).toBeGreaterThan(0);
    expect(snapshot!.expectedRowsWidthCandidates.some((expected) => Math.abs(snapshot!.rowsWidth - expected) <= 1)).toBe(
      true,
    );
  });
});
