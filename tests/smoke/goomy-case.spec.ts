import { expect, test } from '@playwright/test';

const readTrackX = async (page: import('@playwright/test').Page) =>
  page.locator('[data-case-screens-loop-track]').evaluate((track) => {
    const transform = getComputedStyle(track).transform;
    return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
  });

test.describe('GoomY case', () => {
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
