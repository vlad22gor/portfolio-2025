import { expect, test } from '@playwright/test';

const readLoopPhase = async (page: import('@playwright/test').Page) =>
  page.locator('[data-case-screens-loop]').evaluate((viewport) => {
    const viewportBounds = viewport.getBoundingClientRect();
    const items = Array.from(
      viewport.querySelectorAll<HTMLElement>('[data-case-screens-loop-item]'),
    );
    const positionedItems = items
      .map((item) => ({
        item,
        bounds: item.getBoundingClientRect(),
        sequence: Number(item.dataset.caseScreensLoopSequence ?? 0),
      }))
      .sort((left, right) => left.sequence - right.sequence);
    const firstVisible = positionedItems.find(({ bounds }) => {
      return bounds.right > viewportBounds.left && bounds.left < viewportBounds.right;
    });
    if (!firstVisible) return 0;
    const firstIndex = positionedItems.indexOf(firstVisible);
    const neighbour = positionedItems[firstIndex + 1] ?? positionedItems[firstIndex - 1];
    const sequenceDelta = neighbour ? neighbour.sequence - firstVisible.sequence : 1;
    const slot = neighbour
      ? (neighbour.bounds.left - firstVisible.bounds.left) / sequenceDelta
      : firstVisible.bounds.width;
    return (
      firstVisible.bounds.left -
      viewportBounds.left -
      firstVisible.sequence * slot
    );
  });

test.describe('GoomY case', () => {
  test('keeps the 816px case grid and matches the Figma screen-loop geometry', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2048, height: 1200 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/goomy');
    await expect(page.locator('[data-case-screens-loop]')).toHaveAttribute(
      'data-case-screens-loop-virtual-ready',
      'true',
    );

    const layout = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>('main.page-shell--goomy');
      const intro = document.querySelector<HTMLElement>('.goomy-intro-section');
      const section = document.querySelector<HTMLElement>('.case-screens-loop-section');
      const header = document.querySelector<HTMLElement>('.case-screens-loop-section__header');
      const badge = document.querySelector<HTMLElement>('.case-screens-loop-section__badge');
      const title = document.querySelector<HTMLElement>('.case-screens-loop-section__title');
      const body = document.querySelector<HTMLElement>('.case-screens-loop-section__body');
      const leftArrow = document.querySelector<HTMLElement>(
        '.case-screens-loop-section__arrow--left',
      );
      const rightArrow = document.querySelector<HTMLElement>(
        '.case-screens-loop-section__arrow--right',
      );
      const rail = document.querySelector<HTMLElement>('.case-screens-loop-section__rail');
      const viewport = document.querySelector<HTMLElement>('[data-case-screens-loop]');
      const items = Array.from(
        document.querySelectorAll<HTMLElement>('[data-case-screens-loop-item]'),
      )
        .filter((item) => {
          const sequence = Number(item.dataset.caseScreensLoopSequence ?? Number.NaN);
          return sequence >= 0 && sequence < 6;
        })
        .sort(
          (left, right) =>
            Number(left.dataset.caseScreensLoopSequence) -
            Number(right.dataset.caseScreensLoopSequence),
        );

      if (
        !main ||
        !intro ||
        !section ||
        !header ||
        !badge ||
        !title ||
        !body ||
        !leftArrow ||
        !rightArrow ||
        !rail ||
        !viewport ||
        items.length !== 6
      ) {
        return null;
      }

      const rect = (element: HTMLElement) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      };

      return {
        innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        gridTemplateColumns: getComputedStyle(main).gridTemplateColumns,
        main: rect(main),
        intro: rect(intro),
        section: rect(section),
        header: rect(header),
        badge: rect(badge),
        title: {
          ...rect(title),
          fontSize: getComputedStyle(title).fontSize,
          lineHeight: getComputedStyle(title).lineHeight,
        },
        body: rect(body),
        leftArrow: rect(leftArrow),
        rightArrow: rect(rightArrow),
        rail: rect(rail),
        viewport: rect(viewport),
        items: items.map(rect),
      };
    });

    expect(layout).not.toBeNull();
    expect(layout!.scrollWidth).toBe(layout!.clientWidth);
    expect(layout!.gridTemplateColumns).toBe('816px');
    expect(layout!.main.width).toBeCloseTo(816, 1);
    expect(layout!.intro.width).toBeCloseTo(816, 1);
    expect(layout!.section.width).toBeCloseTo(816, 1);
    expect(layout!.section.height).toBeCloseTo(702, 1);
    expect(layout!.header.width).toBeCloseTo(816, 1);
    expect(layout!.header.height).toBeCloseTo(153, 1);
    expect(layout!.badge.height).toBeCloseTo(22, 1);
    expect(layout!.title.fontSize).toBe('32px');
    expect(layout!.title.lineHeight).toBe('35px');
    expect(layout!.body.width).toBeCloseTo(312, 1);
    expect(layout!.body.height).toBeCloseTo(72, 1);
    expect(layout!.rail.y - layout!.section.y).toBeCloseTo(201, 1);
    expect(layout!.rail.height).toBeCloseTo(501, 1);
    expect(layout!.viewport.x).toBeCloseTo(0, 1);
    expect(layout!.viewport.width).toBeCloseTo(2048, 1);
    expect(layout!.viewport.height).toBeCloseTo(501, 1);
    expect(layout!.leftArrow.x - layout!.section.x).toBeCloseTo(138, 1);
    expect(layout!.rightArrow.x - layout!.section.x).toBeCloseTo(584, 1);
    expect(layout!.leftArrow.y - layout!.section.y).toBeCloseTo(55, 1);
    expect(layout!.rightArrow.y - layout!.section.y).toBeCloseTo(55, 1);
    expect(layout!.leftArrow.width).toBeCloseTo(94, 1);
    expect(layout!.leftArrow.height).toBeCloseTo(102, 1);
    const leftArrowArt = page.locator(
      '.case-screens-loop-section__arrow--left .case-screens-loop-section__arrow-art',
    );
    const rightArrowArt = page.locator(
      '.case-screens-loop-section__arrow--right .case-screens-loop-section__arrow-art',
    );
    await expect(leftArrowArt).toHaveAttribute(
      'style',
      /--themed-svg-icon-mask: url\("\/media\/cases\/goomy\/screens-loop\/arrow-left\.svg"\)/,
    );
    await expect(rightArrowArt).toHaveAttribute(
      'style',
      /--themed-svg-icon-mask: url\("\/media\/cases\/goomy\/screens-loop\/arrow-right\.svg"\)/,
    );
    await expect(page.locator('.case-screens-loop-section__arrow-art[src]')).toHaveCount(0);

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'light';
    });
    const screensLoopBadge = page.locator('.case-screens-loop-section__badge');
    await expect(screensLoopBadge).toHaveAttribute('data-badge-type', 'default');
    await expect(screensLoopBadge).toHaveCSS('background-color', 'rgb(192, 189, 109)');
    await expect(leftArrowArt).toHaveCSS('background-color', 'rgb(192, 189, 109)');
    await expect(rightArrowArt).toHaveCSS('background-color', 'rgb(192, 189, 109)');

    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
    });
    await expect(screensLoopBadge).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(screensLoopBadge).toHaveCSS('border-top-style', 'solid');
    await expect(leftArrowArt).toHaveCSS('background-color', 'rgb(121, 176, 226)');
    await expect(rightArrowArt).toHaveCSS('background-color', 'rgb(121, 176, 226)');
    expect(layout!.items[0].x).toBeCloseTo(-572, 1);
    layout!.items.forEach((item, index) => {
      expect(item.x).toBeCloseTo(-572 + index * 268, 1);
      expect(item.width).toBeCloseTo(244, 1);
      expect(item.height).toBeCloseTo(501, 1);
    });
    expect(layout!.items[2].x).toBeLessThanOrEqual(0);
    expect(layout!.items[2].x + layout!.items[2].width).toBeGreaterThan(0);
  });

  test('renders the finished sections and a draggable, hover-slowed screen loop', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('/goomy');

    await expect(page).toHaveTitle(/GoomY recipe app redesign - Vladyslav Horovyy/i);
    await expect(page.locator('.goomy-intro-section')).toBeVisible();
    await expect(page.locator('.goomy-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--goomy')).toBeVisible();
    await expect(page.locator('.goomy-feature-cards')).toBeVisible();
    await expect(page.locator('.goomy-screens-loop')).toBeVisible();
    await expect(page.locator('.goomy-design-system-section')).toBeVisible();
    await expect(page.locator('.goomy-case-switcher')).toBeVisible();

    const featureCards = page.locator('.goomy-feature-cards .fora-feature-card');
    await expect(featureCards).toHaveCount(3);
    await expect(page.locator('.goomy-feature-cards')).toHaveAttribute(
      'aria-label',
      'GoomY feature cards',
    );
    await expect(featureCards.nth(0).locator('video')).toHaveAttribute(
      'src',
      '/media/cases/goomy/flows/goomy-onboarding-v1.webm',
    );
    await expect(featureCards.nth(0).locator('video')).toHaveAttribute(
      'poster',
      '/media/cases/goomy/flows/goomy-onboarding-v1-poster.png',
    );
    await expect(featureCards.nth(1).locator('video')).toHaveAttribute(
      'src',
      '/media/cases/goomy/flows/goomy-paywall-activation-v1.webm',
    );
    await expect(featureCards.nth(2).locator('video')).toHaveAttribute(
      'src',
      '/media/cases/goomy/flows/goomy-recipe-cooking-v1.webm',
    );
    await expect(featureCards.nth(2).locator('video')).toHaveAttribute(
      'poster',
      '/media/cases/goomy/flows/goomy-recipe-cooking-v1-poster.png',
    );

    const updatedFigmaGeometry = await page.evaluate(() => {
      const relativeRect = (
        element: Element | null,
        parent: Element | null,
      ): { x: number; y: number; width: number; height: number } | null => {
        if (!(element instanceof HTMLElement) || !(parent instanceof HTMLElement)) {
          return null;
        }
        const elementRect = element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        return {
          x: elementRect.x - parentRect.x,
          y: elementRect.y - parentRect.y,
          width: elementRect.width,
          height: elementRect.height,
        };
      };

      const challengeScene = document.querySelector(
        '.goomy-case-challenge .case-challenge-scene-wrap--desktop .case-challenge-scene',
      );
      const challengeArrows = document.querySelectorAll(
        '.goomy-case-challenge .case-challenge-scene-wrap--desktop .case-challenge-arrow',
      );
      const challengeNotes = document.querySelectorAll(
        '.goomy-case-challenge .case-challenge-scene-wrap--desktop .case-challenge-note',
      );
      const designScene = document.querySelector(
        '.goomy-design-system-section .fora-design-system-scene',
      );
      const handoffBody = document.querySelector<HTMLElement>(
        '.goomy-design-system-section .fora-design-system-copy--styles .fora-design-system-copy-body',
      );

      return {
        challengeBottomRight: relativeRect(challengeArrows[3] ?? null, challengeScene),
        challengeBottomRightText: relativeRect(challengeNotes[3] ?? null, challengeScene),
        challengeBottomRightTransform:
          challengeArrows[3] instanceof HTMLElement
            ? getComputedStyle(challengeArrows[3]).transform
            : 'none',
        challengeBottomRightMask:
          challengeArrows[3] instanceof HTMLElement
            ? getComputedStyle(challengeArrows[3]).maskImage
            : '',
        designTop: relativeRect(
          document.querySelector(
            '.goomy-design-system-section .fora-design-system-arrow--top',
          ),
          designScene,
        ),
        designBottomLeft: relativeRect(
          document.querySelector(
            '.goomy-design-system-section .fora-design-system-arrow--bottom-left',
          ),
          designScene,
        ),
        handoffText: handoffBody?.innerText ?? '',
        handoffWhiteSpace: handoffBody ? getComputedStyle(handoffBody).whiteSpace : '',
      };
    });

    expect(updatedFigmaGeometry.challengeBottomRight).toEqual({
      x: 540,
      y: 366,
      width: 67,
      height: 40,
    });
    expect(updatedFigmaGeometry.challengeBottomRightText).toEqual({
      x: 621,
      y: 351,
      width: 184,
      height: 44,
    });
    expect(updatedFigmaGeometry.challengeBottomRightTransform).toBe('none');
    expect(updatedFigmaGeometry.challengeBottomRightMask).toContain(
      '/media/cases/goomy/challenge/arrow-active-controls@3x.png',
    );
    expect(updatedFigmaGeometry.designTop).toEqual({
      x: 237,
      y: 132,
      width: 166,
      height: 59,
    });
    expect(updatedFigmaGeometry.designBottomLeft).toEqual({
      x: 254,
      y: 645,
      width: 109,
      height: 90,
    });
    expect(updatedFigmaGeometry.handoffWhiteSpace).toBe('pre-line');
    expect(updatedFigmaGeometry.handoffText).toContain(
      'Specs, DESIGN.md and\ntokens enabled accurate React Native implementation',
    );

    const viewport = page.locator('[data-case-screens-loop]');
    const track = page.locator('[data-case-screens-loop-track]');
    await viewport.scrollIntoViewIfNeeded();
    await expect(viewport).toHaveAttribute('data-case-screens-loop-count', '31');
    await expect(viewport).toHaveAttribute('data-case-screens-loop-visual-buffer-slots', '2');
    await expect(viewport).toHaveAttribute('data-case-screens-loop-decode-buffer-slots', '4');
    await expect(viewport).toHaveAttribute('data-case-screens-loop-virtual-ready', 'true');
    await expect(viewport).toHaveAttribute(
      'data-case-screens-loop-engine',
      'waapi-compositor',
    );
    await expect(track.locator('[data-case-screens-loop-item]')).toHaveCount(14);

    const virtualization = await viewport.evaluate((element) => {
      const trackElement = element.querySelector<HTMLElement>('[data-case-screens-loop-track]');
      const items = Array.from(
        element.querySelectorAll<HTMLElement>('[data-case-screens-loop-item]'),
      );
      return {
        poolSize: Number(element.dataset.caseScreensLoopPoolSize ?? 0),
        logicalCount: Number(element.dataset.caseScreensLoopCount ?? 0),
        trackWidth: trackElement?.getBoundingClientRect().width ?? 0,
        sequences: items.map((item) => Number(item.dataset.caseScreensLoopSequence ?? 0)),
      };
    });
    expect(virtualization.poolSize).toBe(14);
    expect(virtualization.poolSize).toBeLessThan(virtualization.logicalCount);
    expect(virtualization.trackWidth).toBeLessThan(4000);
    expect(new Set(virtualization.sequences).size).toBe(virtualization.poolSize);

    const screenSequence = await viewport.locator('[data-case-screens-loop-manifest]').evaluate(
      (manifest) => JSON.parse(manifest.textContent || '[]'),
    );
    expect(screenSequence.map((screen) => screen.group)).toEqual([
      ...Array(15).fill('onboarding'),
      ...Array(16).fill('core'),
    ]);
    expect(
      screenSequence
        .map((screen, index) => (screen.src.includes('/recipe-') ? index : -1))
        .filter((index) => index >= 0),
    ).toEqual([16, 19, 22, 25, 28]);

    const screenAssetDimensions = await page.evaluate(
      async (sources) => {
        const dimensions = [];
        for (const source of sources) {
          const response = await fetch(source);
          if (!response.ok) throw new Error(`Failed to load ${source}: ${response.status}`);
          const bitmap = await createImageBitmap(await response.blob());
          dimensions.push({ width: bitmap.width, height: bitmap.height });
          bitmap.close();
        }
        return dimensions;
      },
      screenSequence.map((screen) => screen.src),
    );
    expect(screenAssetDimensions).toHaveLength(31);
    screenAssetDimensions.forEach((image) => {
      expect(image.width).toBe(662);
      expect(image.height).toBe(1439);
    });

    await expect(viewport).toHaveAttribute('data-case-screens-loop-decode-ready', 'true', {
      timeout: 15_000,
    });
    const decodeWindow = await viewport.evaluate((element) => {
      const prepared = Number(element.getAttribute('data-case-screens-loop-prepared-count') ?? 0);
      const required = Number(
        element.getAttribute('data-case-screens-loop-initial-required-count') ?? 0,
      );
      const rootBounds = element.getBoundingClientRect();
      const visibleImages = Array.from(
        element.querySelectorAll<HTMLImageElement>('.device-mockup__media'),
      ).filter((image) => {
        const bounds = image.getBoundingClientRect();
        return bounds.right > rootBounds.left && bounds.left < rootBounds.right;
      });
      return {
        prepared,
        required,
        visibleCount: visibleImages.length,
        visibleReady: visibleImages.every(
          (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
        ),
      };
    });
    expect(decodeWindow.required).toBeGreaterThanOrEqual(10);
    expect(decodeWindow.prepared).toBeGreaterThanOrEqual(decodeWindow.required);
    expect(decodeWindow.visibleCount).toBeGreaterThan(0);
    expect(decodeWindow.visibleReady).toBe(true);

    await page.locator('.goomy-design-system-section').scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const screenImages = Array.from(
              document.querySelectorAll<HTMLImageElement>(
                '.goomy-screens-loop .device-mockup__screen .device-mockup__media',
              ),
            ).slice(0, 6);
            const designImages = Array.from(
              document.querySelectorAll<HTMLImageElement>('.goomy-design-system-section > div > img'),
            );
            return [...screenImages, ...designImages].every(
              (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
            );
          }),
        { message: 'GoomY case rasters should load at their intrinsic dimensions' },
      )
      .toBe(true);

    const rasterContract = await page.evaluate(() => {
      const screenImages = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          '.goomy-screens-loop .device-mockup__screen .device-mockup__media',
        ),
      ).slice(0, 6);
      const designImages = Array.from(
        document.querySelectorAll<HTMLImageElement>('.goomy-design-system-section > div > img'),
      );
      return {
        screenImages: screenImages.map((image) => ({
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: image.getBoundingClientRect().width,
          renderedHeight: image.getBoundingClientRect().height,
        })),
        designImages: designImages.map((image) => ({
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: image.getBoundingClientRect().width,
          renderedHeight: image.getBoundingClientRect().height,
        })),
      };
    });

    expect(rasterContract.screenImages).toHaveLength(6);
    expect(rasterContract.designImages).toHaveLength(4);
    [...rasterContract.screenImages, ...rasterContract.designImages].forEach((image) => {
      expect(image.naturalWidth).toBeGreaterThanOrEqual(image.renderedWidth * 3);
      expect(image.naturalHeight).toBeGreaterThanOrEqual(image.renderedHeight * 3);
    });

    await viewport.scrollIntoViewIfNeeded();
    const bounds = await viewport.boundingBox();
    expect(bounds).not.toBeNull();
    const outsideY =
      bounds!.y > 24 ? 8 : Math.min(1092, bounds!.y + bounds!.height + 24);
    await page.mouse.move(1400, outsideY);
    await page.waitForTimeout(250);
    const normalStart = await readLoopPhase(page);
    await page.waitForTimeout(700);
    const normalEnd = await readLoopPhase(page);
    const normalDistance = Math.abs(normalEnd - normalStart);

    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 160);
    await page.waitForTimeout(350);
    const hoverStart = await readLoopPhase(page);
    await page.waitForTimeout(700);
    const hoverEnd = await readLoopPhase(page);
    const hoverDistance = Math.abs(hoverEnd - hoverStart);

    expect(normalDistance).toBeGreaterThan(10);
    expect(hoverDistance).toBeGreaterThan(3);
    expect(hoverDistance).toBeLessThan(normalDistance * 0.75);

    const recycleCountBeforeDrag = Number(
      (await viewport.getAttribute('data-case-screens-loop-recycle-count')) ?? 0,
    );
    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 240);
    await page.mouse.down();
    await page.mouse.move(bounds!.x + bounds!.width / 2 - 420, bounds!.y + 240, { steps: 12 });
    await page.mouse.up();
    await expect(viewport).toHaveAttribute('data-dragging', 'false');
    await expect
      .poll(async () => Number((await viewport.getAttribute('data-case-screens-loop-recycle-count')) ?? 0))
      .toBeGreaterThan(recycleCountBeforeDrag);
    await expect(viewport).toHaveAttribute('data-case-screens-loop-recycle-miss-count', '0');
    await expect(track.locator('[data-case-screens-loop-item]')).toHaveCount(14);
    await expect
      .poll(() =>
        track.locator('[data-case-screens-loop-item]').evaluateAll((items) =>
          items.map((item) => Number((item as HTMLElement).dataset.caseScreensLoopCell ?? -1)),
        ),
      )
      .toEqual(Array.from({ length: 14 }, (_, index) => index));
  });

  test('keeps all mobile sections inside the viewport and scales the design-system scene', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/goomy');

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.fora-intro-screens-slider')).toBeVisible();
    await expect(page.locator('.case-challenge-scene-wrap--mobile')).toBeVisible();
    await expect(page.locator('.goomy-feature-cards')).toBeVisible();
    await expect(page.locator('.goomy-screens-loop')).toBeVisible();
    await expect(page.locator('.goomy-design-system-section')).toBeVisible();

    const layout = await page.evaluate(() => {
      const designRoot = document.querySelector('.goomy-design-system-section');
      const designScene = designRoot?.querySelector('.fora-design-system-scene');
      const visibleSections = Array.from(
        document.querySelectorAll<HTMLElement>('main.page-shell--goomy > section'),
      ).filter((section) => getComputedStyle(section).display !== 'none');
      return {
        innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        sectionWidths: visibleSections.map((section) => section.getBoundingClientRect().width),
        designTransform:
          designScene instanceof HTMLElement ? getComputedStyle(designScene).transform : 'none',
        designHeight:
          designRoot instanceof HTMLElement ? designRoot.getBoundingClientRect().height : 0,
      };
    });

    expect(layout.scrollWidth).toBe(layout.clientWidth);
    layout.sectionWidths.forEach((width) => {
      expect(width).toBeCloseTo(350, 0);
    });
    expect(layout.designTransform).not.toBe('none');
    expect(layout.designHeight).toBeGreaterThan(300);
    expect(layout.designHeight).toBeLessThan(400);
  });
});
