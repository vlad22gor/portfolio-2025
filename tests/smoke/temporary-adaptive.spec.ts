import { expect, test } from '@playwright/test';

const trackSelector = '[data-temp-slider-track]';

const readTrackX = async (page: import('@playwright/test').Page) =>
  page.evaluate((selector) => {
    const track = document.querySelector(selector);
    if (!(track instanceof HTMLElement)) {
      return null;
    }
    const transform = getComputedStyle(track).transform;
    if (transform === 'none') {
      return 0;
    }
    const matrix2d = transform.match(/^matrix\((.+)\)$/);
    if (matrix2d) {
      const values = matrix2d[1].split(',').map((token) => Number.parseFloat(token.trim()));
      return Number.isFinite(values[4]) ? values[4] : null;
    }
    const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
    if (matrix3d) {
      const values = matrix3d[1].split(',').map((token) => Number.parseFloat(token.trim()));
      return Number.isFinite(values[12]) ? values[12] : null;
    }
    return null;
  }, trackSelector);

test.describe('Temporary adaptive notice', () => {
  test('390x855 shows temporary screen with centered text and moving slider', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');

    await expect(page.locator('.temporary-adaptive-notice')).toBeVisible();
    await expect(page.locator('.site-desktop-shell')).toBeHidden();
    await expect(page.locator('.temporary-adaptive-notice__title')).toHaveText(/mobile version is coming soon/i);
    await expect(page.locator('.temporary-adaptive-notice__text')).toBeVisible();
    await expect(page.locator('.temporary-adaptive-notice__screens-item')).toHaveCount(18);

    const textWidth = await page.locator('.temporary-adaptive-notice__text').evaluate((node) => {
      if (!(node instanceof HTMLElement)) {
        return null;
      }
      return node.getBoundingClientRect().width;
    });
    expect(textWidth).not.toBeNull();
    expect(textWidth!).toBeLessThanOrEqual(390.5);

    const firstX = await readTrackX(page);
    await page.waitForTimeout(450);
    const secondX = await readTrackX(page);
    expect(firstX).not.toBeNull();
    expect(secondX).not.toBeNull();
    expect(Math.abs((secondX ?? 0) - (firstX ?? 0))).toBeGreaterThan(0.5);
  });

  test('1024x1366 keeps temporary screen with explicit phone small size', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-notice')).toBeVisible();
    await expect(page.locator('.site-desktop-shell')).toBeHidden();

    const firstDeviceSize = await page.evaluate(() => {
      const device = document.querySelector('.temporary-adaptive-notice__screens-item .device-mockup');
      if (!(device instanceof HTMLElement)) {
        return null;
      }
      const computed = getComputedStyle(device);
      return {
        width: Number.parseFloat(computed.width),
        height: Number.parseFloat(computed.height),
        size: device.getAttribute('data-device-size'),
        hasInlineScaleVar: (device.getAttribute('style') ?? '').includes('--device-scale'),
      };
    });
    expect(firstDeviceSize).not.toBeNull();
    expect(firstDeviceSize!.size).toBe('small');
    expect(firstDeviceSize!.hasInlineScaleVar).toBe(false);
    expect(firstDeviceSize!.width).toBeGreaterThanOrEqual(142.2);
    expect(firstDeviceSize!.width).toBeLessThanOrEqual(143.3);
    expect(firstDeviceSize!.height).toBeGreaterThanOrEqual(292);
    expect(firstDeviceSize!.height).toBeLessThanOrEqual(293.4);

    const screensViewportState = await page.evaluate(() => {
      const screens = document.querySelector('.temporary-adaptive-notice__screens');
      const viewport = document.querySelector('.temporary-adaptive-notice__screens-viewport');
      const centerMockup = document.querySelector(
        '.temporary-adaptive-notice__screens-item[data-temp-slider-index="1"] .device-mockup',
      );
      const screen = centerMockup instanceof HTMLElement ? centerMockup.querySelector('.device-mockup__screen') : null;
      const media = screen instanceof HTMLElement ? screen.querySelector('.device-mockup__media') : null;
      const videoBleed = centerMockup instanceof HTMLElement ? centerMockup.querySelector('[data-device-video-bleed]') : null;
      if (
        !(screens instanceof HTMLElement) ||
        !(viewport instanceof HTMLElement) ||
        !(centerMockup instanceof HTMLElement) ||
        !(screen instanceof HTMLElement) ||
        !(media instanceof HTMLElement) ||
        !(videoBleed instanceof HTMLElement)
      ) {
        return null;
      }
      const screensStyle = getComputedStyle(screens);
      const viewportStyle = getComputedStyle(viewport);
      const viewportRect = viewport.getBoundingClientRect();
      const centerRect = centerMockup.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      const screenBorderRadius = Number.parseFloat(getComputedStyle(screen).borderTopLeftRadius);
      const videoBleedStyle = getComputedStyle(videoBleed);
      return {
        screenCalibration: centerMockup.dataset.deviceScreenCalibration ?? null,
        screenBorderRadius,
        videoBleedInsetTop: Number.parseFloat(videoBleedStyle.top),
        videoBleedInsetRight: Number.parseFloat(videoBleedStyle.right),
        videoBleedInsetBottom: Number.parseFloat(videoBleedStyle.bottom),
        videoBleedInsetLeft: Number.parseFloat(videoBleedStyle.left),
        screensOverflowY: screensStyle.overflowY,
        viewportOverflowY: viewportStyle.overflowY,
        notClippedBottom: centerRect.bottom <= viewportRect.bottom + 2,
        screenGapTop: Math.max(0, mediaRect.top - screenRect.top),
        screenGapBottom: Math.max(0, screenRect.bottom - mediaRect.bottom),
      };
    });
    expect(screensViewportState).not.toBeNull();
    expect(screensViewportState!.screenCalibration).toBe('aperture-small-v2-aa');
    expect(screensViewportState!.screenBorderRadius).toBeGreaterThanOrEqual(11.8);
    expect(screensViewportState!.screenBorderRadius).toBeLessThanOrEqual(12.2);
    expect(Math.abs(screensViewportState!.videoBleedInsetTop)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(screensViewportState!.videoBleedInsetRight)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(screensViewportState!.videoBleedInsetBottom)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(screensViewportState!.videoBleedInsetLeft)).toBeLessThanOrEqual(0.05);
    expect(screensViewportState!.screensOverflowY).toBe('visible');
    expect(screensViewportState!.viewportOverflowY).toBe('visible');
    expect(screensViewportState!.notClippedBottom).toBe(true);
    expect(screensViewportState!.screenGapTop).toBeLessThanOrEqual(0.2);
    expect(screensViewportState!.screenGapBottom).toBeLessThanOrEqual(0.2);

    const smallApertureAlignment = await page.evaluate(async () => {
      const target = document.querySelector('.temporary-adaptive-notice__screens-item[data-temp-slider-index="1"] .device-mockup');
      const shell = target?.querySelector('.device-mockup__shell');
      const screen = target?.querySelector('.device-mockup__screen');
      const sliderItem = target?.closest('.temporary-adaptive-notice__screens-item');
      if (
        !(shell instanceof HTMLImageElement) ||
        !(screen instanceof HTMLElement) ||
        !(sliderItem instanceof HTMLElement) ||
        !shell.src
      ) {
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
            run,
            length: run.end - run.start,
          };
        })
        .filter((candidate): candidate is { run: { start: number; end: number }; length: number } => candidate !== null)
        .sort((left, right) => right.length - left.length);
      const verticalRun = verticalCandidates[0]?.run;
      if (!verticalRun) {
        return null;
      }

      const previousTransform = sliderItem.style.transform;
      sliderItem.style.transform = 'none';

      const shellRect = shell.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();

      sliderItem.style.transform = previousTransform;
      const aaAwareHoleLeft = shellRect.left + ((horizontalRun.start - 1) / canvas.width) * shellRect.width;
      const aaAwareHoleRight = shellRect.left + ((horizontalRun.end + 2) / canvas.width) * shellRect.width;
      const aaAwareHoleTop = shellRect.top + ((verticalRun.start - 1) / canvas.height) * shellRect.height;
      const aaAwareHoleBottom = shellRect.top + ((verticalRun.end + 2) / canvas.height) * shellRect.height;
      const epsilon = 0.6;
      const excessEpsilon = 1.6;
      return {
        withinX: screenRect.left <= aaAwareHoleLeft + epsilon && screenRect.right >= aaAwareHoleRight - epsilon,
        withinY: screenRect.top <= aaAwareHoleTop + epsilon && screenRect.bottom >= aaAwareHoleBottom - epsilon,
        noExcessX: screenRect.left >= aaAwareHoleLeft - excessEpsilon && screenRect.right <= aaAwareHoleRight + excessEpsilon,
        noExcessY: screenRect.top >= aaAwareHoleTop - excessEpsilon && screenRect.bottom <= aaAwareHoleBottom + excessEpsilon,
      };
    });

    expect(smallApertureAlignment).not.toBeNull();
    expect(smallApertureAlignment!.withinX).toBe(true);
    expect(smallApertureAlignment!.withinY).toBe(true);
    expect(smallApertureAlignment!.noExcessX).toBe(true);
    expect(smallApertureAlignment!.noExcessY).toBe(true);
  });

  test('1360+ shows desktop content and hides temporary screen', async ({ page }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto('/fora');

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.fora-intro-section')).toBeVisible();
  });

  test('reduced motion disables auto movement for temporary slider', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');

    const firstX = await readTrackX(page);
    await page.waitForTimeout(500);
    const secondX = await readTrackX(page);
    expect(firstX).not.toBeNull();
    expect(secondX).not.toBeNull();
    expect(Math.abs((secondX ?? 0) - (firstX ?? 0))).toBeLessThan(0.2);
  });

  test('slider arc uses only translate+rotate with fixed opacity', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');

    const transformState = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.temporary-adaptive-notice__screens-item')).slice(0, 6);
      return items.map((item) => {
        if (!(item instanceof HTMLElement)) {
          return null;
        }
        return {
          transform: item.style.transform,
          opacity: item.style.opacity,
        };
      });
    });

    expect(transformState.length).toBeGreaterThan(0);
    for (const entry of transformState) {
      expect(entry).not.toBeNull();
      expect(entry!.opacity).toBe('1');
      expect(entry!.transform).toContain('translate3d(');
      expect(entry!.transform).toContain('rotate(');
      expect(entry!.transform.includes('scale(')).toBe(false);
    }

    const arcGeometry = await page.evaluate(() => {
      const viewport = document.querySelector('.temporary-adaptive-notice__screens-viewport');
      const items = Array.from(document.querySelectorAll('.temporary-adaptive-notice__screens-item'));
      if (!(viewport instanceof HTMLElement) || items.length === 0) {
        return null;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;
      const parseTranslateY = (transform) => {
        const match = transform.match(/translate3d\(\s*0(?:px)?,\s*(-?\d+(?:\.\d+)?)px/i);
        return match ? Number.parseFloat(match[1]) : null;
      };

      const samples = [];
      for (const node of items) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        const rect = node.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const distance = itemCenterX - viewportCenter;
        const y = parseTranslateY(node.style.transform);
        if (y === null) {
          continue;
        }
        samples.push({
          distance,
          absDistance: Math.abs(distance),
          y,
        });
      }

      if (samples.length < 5) {
        return null;
      }

      const byDistance = [...samples].sort((a, b) => a.absDistance - b.absDistance);
      const center = byDistance[0];
      const left = [...samples]
        .filter((sample) => sample.distance < 0)
        .sort((a, b) => a.absDistance - b.absDistance)[0];
      const right = [...samples]
        .filter((sample) => sample.distance > 0)
        .sort((a, b) => a.absDistance - b.absDistance)[0];
      const monotonicSlice = byDistance.slice(0, 6).map((sample) => sample.y);

      return {
        centerY: center?.y ?? null,
        leftY: left?.y ?? null,
        rightY: right?.y ?? null,
        monotonicY: monotonicSlice,
      };
    });

    expect(arcGeometry).not.toBeNull();
    expect(arcGeometry!.centerY).not.toBeNull();
    expect(arcGeometry!.leftY).not.toBeNull();
    expect(arcGeometry!.rightY).not.toBeNull();

    expect(arcGeometry!.centerY!).toBeLessThanOrEqual(arcGeometry!.leftY! + 0.75);
    expect(arcGeometry!.centerY!).toBeLessThanOrEqual(arcGeometry!.rightY! + 0.75);
    expect(Math.max(arcGeometry!.leftY!, arcGeometry!.rightY!) - arcGeometry!.centerY!).toBeGreaterThan(0.2);
    expect(Math.abs(arcGeometry!.leftY! - arcGeometry!.rightY!)).toBeLessThanOrEqual(5);

    const monotonic = arcGeometry!.monotonicY;
    for (let index = 1; index < monotonic.length; index += 1) {
      expect(monotonic[index]).toBeGreaterThanOrEqual(monotonic[index - 1] - 0.75);
    }
  });

  test('tablet arc scales proportionally and avoids early plateau', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/gallery');

    const arcProfile = await page.evaluate(() => {
      const viewport = document.querySelector('.temporary-adaptive-notice__screens-viewport');
      const items = Array.from(document.querySelectorAll('.temporary-adaptive-notice__screens-item'));
      if (!(viewport instanceof HTMLElement) || items.length === 0) {
        return null;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;
      const viewportWidth = viewportRect.width;
      const parseTranslateY = (transform) => {
        const match = transform.match(/translate3d\(\s*0(?:px)?,\s*(-?\d+(?:\.\d+)?)px/i);
        return match ? Number.parseFloat(match[1]) : null;
      };

      const samples = [];
      for (const node of items) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const absDistance = Math.abs(centerX - viewportCenter);
        const y = parseTranslateY(node.style.transform);
        if (y === null) {
          continue;
        }
        samples.push({ absDistance, y });
      }

      if (samples.length < 6) {
        return null;
      }

      const focusBand = samples.filter((sample) => sample.absDistance <= viewportWidth * 0.9);
      if (focusBand.length < 6) {
        return null;
      }

      const sortedByDistance = [...focusBand].sort((a, b) => a.absDistance - b.absDistance);
      const innerEnd = Math.max(2, Math.floor(sortedByDistance.length * 0.25));
      const outerStart = Math.max(innerEnd + 1, Math.floor(sortedByDistance.length * 0.55));
      const outerEnd = Math.max(outerStart + 2, Math.floor(sortedByDistance.length * 0.9));
      const innerBand = sortedByDistance.slice(0, innerEnd).map((sample) => sample.y);
      const outerBand = sortedByDistance.slice(outerStart, outerEnd).map((sample) => sample.y);

      if (outerBand.length < 2 || innerBand.length < 2) {
        return null;
      }

      const outerSpread = Math.max(...outerBand) - Math.min(...outerBand);
      const outerMean = outerBand.reduce((sum, value) => sum + value, 0) / outerBand.length;
      const innerMean = innerBand.reduce((sum, value) => sum + value, 0) / innerBand.length;

      return {
        outerSpread,
        outerMean,
        innerMean,
        viewportWidth,
      };
    });

    expect(arcProfile).not.toBeNull();
    expect(arcProfile!.viewportWidth).toBeGreaterThanOrEqual(900);
    expect(arcProfile!.outerSpread).toBeGreaterThan(0.8);
    expect(arcProfile!.outerMean).toBeGreaterThan(arcProfile!.innerMean + 1.1);
  });

  test('mobile arc has smooth outer-quarter entry without visible circle seam', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');
    await page.waitForTimeout(180);

    const seamProfile = await page.evaluate(() => {
      const viewport = document.querySelector('.temporary-adaptive-notice__screens-viewport');
      const items = Array.from(document.querySelectorAll('.temporary-adaptive-notice__screens-item'));
      if (!(viewport instanceof HTMLElement) || items.length === 0) {
        return null;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;
      const viewportWidth = viewportRect.width;
      const parseTranslateY = (transform) => {
        const match = transform.match(/translate3d\(\s*0(?:px)?,\s*(-?\d+(?:\.\d+)?)px/i);
        return match ? Number.parseFloat(match[1]) : null;
      };
      const parseRotateDeg = (transform) => {
        const match = transform.match(/rotate\(\s*(-?\d+(?:\.\d+)?)deg\)/i);
        return match ? Number.parseFloat(match[1]) : null;
      };

      const distanceSamples = [];
      for (const node of items) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const absDistance = Math.abs(centerX - viewportCenter);
        if (absDistance <= 0) {
          continue;
        }
        const transform = node.style.transform;
        const y = parseTranslateY(transform);
        const rotate = parseRotateDeg(transform);
        if (y === null || rotate === null) {
          continue;
        }
        distanceSamples.push({
          absDistance,
          y,
          rotateAbs: Math.abs(rotate),
        });
      }

      if (distanceSamples.length < 6) {
        return null;
      }

      const focusBand = distanceSamples.filter((sample) => sample.absDistance <= viewportWidth * 1.6);
      const scopedSamples = focusBand.length >= 6 ? focusBand : distanceSamples;
      const sorted = scopedSamples.sort((a, b) => a.absDistance - b.absDistance);
      const edgeStart = Math.max(1, Math.floor(sorted.length * 0.55));
      const edgeEnd = Math.max(edgeStart + 3, Math.floor(sorted.length * 0.85));
      const edgeRange = sorted.slice(edgeStart, edgeEnd);
      if (edgeRange.length < 3) {
        return null;
      }

      let maxOuterYJump = 0;
      let maxOuterRotateJump = 0;
      for (let index = 1; index < edgeRange.length; index += 1) {
        maxOuterYJump = Math.max(maxOuterYJump, Math.abs(edgeRange[index].y - edgeRange[index - 1].y));
        maxOuterRotateJump = Math.max(
          maxOuterRotateJump,
          Math.abs(edgeRange[index].rotateAbs - edgeRange[index - 1].rotateAbs),
        );
      }

      return {
        maxOuterYJump,
        maxOuterRotateJump,
        sampleCount: edgeRange.length,
        viewportWidth,
      };
    });

    expect(seamProfile).not.toBeNull();
    expect(seamProfile!.sampleCount).toBeGreaterThanOrEqual(3);
    expect(seamProfile!.maxOuterYJump).toBeLessThan(2.8);
    expect(seamProfile!.maxOuterRotateJump).toBeLessThan(0.95);
  });

  test('drag interaction moves the track in temporary slider', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 855 });
    await page.goto('/');

    const viewport = page.locator('[data-temp-slider]');
    await expect(viewport).toBeVisible();
    const before = await readTrackX(page);

    const box = await viewport.boundingBox();
    expect(box).not.toBeNull();
    const startX = (box?.x ?? 0) + (box?.width ?? 0) * 0.6;
    const y = (box?.y ?? 0) + (box?.height ?? 0) * 0.5;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 140, y, { steps: 10 });
    await page.mouse.up();

    const after = await readTrackX(page);
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs((after ?? 0) - (before ?? 0))).toBeGreaterThan(10);
  });
});
