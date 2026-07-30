import { expect, test } from '@playwright/test';

const readTrackX = async (page: import('@playwright/test').Page) =>
  page.locator('[data-case-screens-loop-track]').evaluate((track) => {
    const transform = getComputedStyle(track).transform;
    return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
  });

test.describe('GoomY case', () => {
  test('keeps the 816px case grid and matches the Figma screen-loop geometry', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2048, height: 1200 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/goomy');

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
      ).slice(0, 6);

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
    expect(layout!.scrollWidth).toBe(layout!.innerWidth);
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
    await expect(
      page.locator(
        '.case-screens-loop-section__arrow--left .case-screens-loop-section__arrow-art',
      ),
    ).toHaveAttribute('src', '/media/cases/goomy/screens-loop/arrow-left.svg');
    await expect(
      page.locator(
        '.case-screens-loop-section__arrow--right .case-screens-loop-section__arrow-art',
      ),
    ).toHaveAttribute('src', '/media/cases/goomy/screens-loop/arrow-right.svg');
    expect(layout!.items[0].x).toBeCloseTo(232, 1);
    layout!.items.forEach((item, index) => {
      expect(item.x).toBeCloseTo(232 + index * 268, 1);
      expect(item.width).toBeCloseTo(244, 1);
      expect(item.height).toBeCloseTo(501, 1);
    });
  });

  test('renders the finished sections and a draggable, hover-slowed screen loop', async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('/goomy');

    await expect(page).toHaveTitle(/GoomY recipe app redesign - Vladyslav Horovyy/i);
    await expect(page.locator('.goomy-intro-section')).toBeVisible();
    await expect(page.locator('.goomy-case-challenge')).toBeVisible();
    await expect(page.locator('.case-process-section--goomy')).toBeVisible();
    await expect(page.locator('.goomy-screens-loop')).toBeVisible();
    await expect(page.locator('.goomy-design-system-section')).toBeVisible();
    await expect(page.locator('.goomy-case-switcher')).toBeVisible();
    await expect(page.locator('.fora-feature-cards-section')).toHaveCount(0);

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
      const designScene = document.querySelector(
        '.goomy-design-system-section .fora-design-system-scene',
      );
      const handoffBody = document.querySelector<HTMLElement>(
        '.goomy-design-system-section .fora-design-system-copy--styles .fora-design-system-copy-body',
      );

      return {
        challengeBottomRight: relativeRect(challengeArrows[3] ?? null, challengeScene),
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
    await expect(viewport).toHaveAttribute('data-case-screens-loop-count', '6');
    await expect(track.locator('[data-case-screens-loop-item]')).toHaveCount(12);
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
    const normalStart = await readTrackX(page);
    await page.waitForTimeout(700);
    const normalEnd = await readTrackX(page);
    const normalDistance = Math.abs(normalEnd - normalStart);

    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 160);
    await page.waitForTimeout(350);
    const hoverStart = await readTrackX(page);
    await page.waitForTimeout(700);
    const hoverEnd = await readTrackX(page);
    const hoverDistance = Math.abs(hoverEnd - hoverStart);

    expect(normalDistance).toBeGreaterThan(10);
    expect(hoverDistance).toBeGreaterThan(3);
    expect(hoverDistance).toBeLessThan(normalDistance * 0.75);

    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 240);
    await page.mouse.down();
    await page.mouse.move(bounds!.x + bounds!.width / 2 - 120, bounds!.y + 240, { steps: 8 });
    await page.mouse.up();
    await expect(viewport).toHaveAttribute('data-dragging', 'false');
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
        scrollWidth: document.documentElement.scrollWidth,
        sectionWidths: visibleSections.map((section) => section.getBoundingClientRect().width),
        designTransform:
          designScene instanceof HTMLElement ? getComputedStyle(designScene).transform : 'none',
        designHeight:
          designRoot instanceof HTMLElement ? designRoot.getBoundingClientRect().height : 0,
      };
    });

    expect(layout.scrollWidth).toBe(layout.innerWidth);
    layout.sectionWidths.forEach((width) => {
      expect(width).toBeCloseTo(350, 0);
    });
    expect(layout.designTransform).not.toBe('none');
    expect(layout.designHeight).toBeGreaterThan(300);
    expect(layout.designHeight).toBeLessThan(400);
  });
});
