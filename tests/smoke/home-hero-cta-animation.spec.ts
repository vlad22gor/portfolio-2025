import { expect, test } from '@playwright/test';

const readHomeHeroCtaState = () => {
  const cta = document.querySelector('.home-hero-cta');
  if (!(cta instanceof HTMLElement)) {
    return null;
  }

  const rect = cta.getBoundingClientRect();
  return {
    mode: cta.dataset.homeHeroCtaMode ?? null,
    runtimeGuard: cta.dataset.homeHeroCtaRuntimeGuard ?? null,
    motionInview: cta.getAttribute('data-motion-inview'),
    motionInviewAnimated: cta.getAttribute('data-motion-inview-animated'),
    top: rect.top,
    bottom: rect.bottom,
    viewportHeight: window.innerHeight,
  };
};

test.describe('Home hero CTA animation', () => {
  test('continues hero stagger when CTA is initially inside viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    await expect(page.locator('.home-hero-cta')).toBeVisible();
    await expect
      .poll(() => page.evaluate(readHomeHeroCtaState), {
        timeout: 3000,
      })
      .toMatchObject({
        mode: 'hero-local-stagger',
      });

    const timeline = await page.evaluate(async () => {
      const hero = document.querySelector('.home-hero');
      const cta = document.querySelector('.home-hero-cta');
      const lastLabel = document.querySelector('.home-hero-line:last-child');
      const ctaText = document.querySelector('.home-hero-cta [data-home-hero-cta-stage="text"]');
      const ctaButton = document.querySelector('.home-hero-cta [data-home-hero-cta-stage="button"]');
      const runtime = window.__homeHeroAppearRuntime;

      if (
        !(hero instanceof HTMLElement) ||
        !(cta instanceof HTMLElement) ||
        !(lastLabel instanceof HTMLElement) ||
        !(ctaText instanceof HTMLElement) ||
        !(ctaButton instanceof HTMLElement) ||
        !runtime ||
        typeof runtime.mount !== 'function'
      ) {
        return null;
      }

      const readOpacity = (element: HTMLElement) => {
        const value = Number.parseFloat(getComputedStyle(element).opacity);
        return Number.isFinite(value) ? value : 1;
      };

      const markers: Record<string, number | null> = {
        lastLabel: null,
        ctaText: null,
        ctaButton: null,
      };

      const previousOpacity = {
        lastLabel: readOpacity(lastLabel),
        ctaText: readOpacity(ctaText),
        ctaButton: readOpacity(ctaButton),
      };

      hero.removeAttribute('data-home-hero-appear-mounted');
      hero.dataset.homeHeroAppear = 'pending';
      cta.removeAttribute('data-home-hero-cta-runtime-guard');
      cta.removeAttribute('data-home-hero-cta-mode');
      cta.removeAttribute('data-home-hero-cta-animated');
      cta.removeAttribute('data-motion-inview');
      cta.removeAttribute('data-motion-inview-bound');
      cta.removeAttribute('data-motion-inview-animated');

      Array.from(hero.querySelectorAll('.home-hero-line, .home-hero-asset, [data-home-hero-cta-stage]')).forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        node.style.opacity = '';
        node.style.transform = '';
      });

      runtime.mount();

      const startedAt = performance.now();

      return await new Promise<{
        mode: string | null;
        motionInview: string | null;
        markers: Record<string, number | null>;
      }>((resolve) => {
        const tick = () => {
          const currentLastLabel = readOpacity(lastLabel);
          const currentCtaText = readOpacity(ctaText);
          const currentCtaButton = readOpacity(ctaButton);
          const elapsed = performance.now() - startedAt;

          if (markers.lastLabel === null && previousOpacity.lastLabel <= 0.02 && currentLastLabel > 0.02) {
            markers.lastLabel = elapsed;
          }
          if (markers.ctaText === null && previousOpacity.ctaText <= 0.02 && currentCtaText > 0.02) {
            markers.ctaText = elapsed;
          }
          if (markers.ctaButton === null && previousOpacity.ctaButton <= 0.02 && currentCtaButton > 0.02) {
            markers.ctaButton = elapsed;
          }

          previousOpacity.lastLabel = currentLastLabel;
          previousOpacity.ctaText = currentCtaText;
          previousOpacity.ctaButton = currentCtaButton;

          const allCaptured = Object.values(markers).every((value) => typeof value === 'number');
          if (allCaptured || elapsed > 2600) {
            resolve({
              mode: cta.dataset.homeHeroCtaMode ?? null,
              motionInview: cta.getAttribute('data-motion-inview'),
              markers,
            });
            return;
          }

          window.requestAnimationFrame(tick);
        };

        window.requestAnimationFrame(tick);
      });
    });

    expect(timeline).not.toBeNull();
    expect(timeline!.mode).toBe('hero-local-stagger');
    expect(timeline!.motionInview).toBeNull();
    expect(timeline!.markers.lastLabel).not.toBeNull();
    expect(timeline!.markers.ctaText).not.toBeNull();
    expect(timeline!.markers.ctaButton).not.toBeNull();
    expect((timeline!.markers.ctaText ?? 0) - (timeline!.markers.lastLabel ?? 0)).toBeGreaterThanOrEqual(40);
    expect((timeline!.markers.ctaButton ?? 0) - (timeline!.markers.ctaText ?? 0)).toBeGreaterThanOrEqual(40);
  });

  test('falls back to inView when CTA is initially outside viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 760 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    await expect
      .poll(() => page.evaluate(readHomeHeroCtaState), {
        timeout: 3000,
      })
      .toMatchObject({
        mode: 'inview',
        runtimeGuard: 'true',
        motionInview: 'appear-v1',
        motionInviewAnimated: null,
      });

    const stateSnapshot = await page.evaluate(readHomeHeroCtaState);
    expect(stateSnapshot).not.toBeNull();
    expect(stateSnapshot!.top).toBeGreaterThanOrEqual(stateSnapshot!.viewportHeight);

    const cta = page.locator('.home-hero-cta');
    await cta.scrollIntoViewIfNeeded();

    await expect
      .poll(() => page.evaluate(readHomeHeroCtaState), {
        timeout: 3000,
      })
      .toMatchObject({
        mode: 'inview',
        motionInview: 'appear-v1',
        motionInviewAnimated: 'true',
      });
  });
});
