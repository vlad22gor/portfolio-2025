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
    await page.addInitScript(() => {
      const runtimeWindow = window as typeof window & {
        __homeHeroCtaEarlySamples?: Array<{
          label: string;
          exists: boolean;
          heroAppearState: string | null;
          computedOpacity: number | null;
          computedTransform: string | null;
          translateY: number | null;
        }>;
      };

      const resolveTranslateY = (transform: string) => {
        if (!transform || transform === 'none') {
          return 0;
        }
        if (transform.startsWith('matrix3d(') && transform.endsWith(')')) {
          const values = transform
            .slice('matrix3d('.length, -1)
            .split(',')
            .map((value) => Number.parseFloat(value.trim()));
          return Number.isFinite(values[13]) ? values[13] : null;
        }
        if (transform.startsWith('matrix(') && transform.endsWith(')')) {
          const values = transform
            .slice('matrix('.length, -1)
            .split(',')
            .map((value) => Number.parseFloat(value.trim()));
          return Number.isFinite(values[5]) ? values[5] : null;
        }
        return null;
      };

      runtimeWindow.__homeHeroCtaEarlySamples = [];
      const sample = (label: string) => {
        const node = document.querySelector('.home-hero-cta [data-home-hero-cta-stage="text"]');
        const hero = document.querySelector('.home-hero');
        if (!(node instanceof HTMLElement)) {
          runtimeWindow.__homeHeroCtaEarlySamples?.push({
            label,
            exists: false,
            heroAppearState: hero instanceof HTMLElement ? hero.getAttribute('data-home-hero-appear') : null,
            computedOpacity: null,
            computedTransform: null,
            translateY: null,
          });
          return;
        }

        const computedStyle = window.getComputedStyle(node);
        const opacity = Number.parseFloat(computedStyle.opacity);
        const transform = computedStyle.transform || 'none';
        runtimeWindow.__homeHeroCtaEarlySamples?.push({
          label,
          exists: true,
          heroAppearState: hero instanceof HTMLElement ? hero.getAttribute('data-home-hero-appear') : null,
          computedOpacity: Number.isFinite(opacity) ? opacity : null,
          computedTransform: transform,
          translateY: resolveTranslateY(transform),
        });
      };

      document.addEventListener('DOMContentLoaded', () => {
        sample('domcontentloaded');
        requestAnimationFrame(() => {
          sample('raf-1');
          requestAnimationFrame(() => {
            sample('raf-2');
          });
        });
      });
    });

    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page).toHaveTitle(/Vlad Horovyy – Product Designer/i);

    const earlySamples = await page.evaluate(() => {
      const runtimeWindow = window as typeof window & {
        __homeHeroCtaEarlySamples?: Array<{
          label: string;
          exists: boolean;
          heroAppearState: string | null;
          computedOpacity: number | null;
          computedTransform: string | null;
          translateY: number | null;
        }>;
      };
      return runtimeWindow.__homeHeroCtaEarlySamples ?? [];
    });
    const earlyFlashGuard = earlySamples.some((sample) => {
      if (!sample.exists || sample.computedOpacity === null || sample.translateY === null) {
        return false;
      }
      const hasHeroPrepaintState = sample.heroAppearState === 'pending' || sample.heroAppearState === 'running';
      const opacityInitial = sample.computedOpacity <= 0.01;
      const transformInitial = Math.abs(sample.translateY - 25) <= 1;
      return hasHeroPrepaintState && opacityInitial && transformInitial;
    });
    expect(earlyFlashGuard).toBe(true);

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
    await expect(cta).toBeInViewport();
    await expect
      .poll(() => page.evaluate(() => {
        const target = document.querySelector('.home-hero-cta');
        if (!(target instanceof HTMLElement)) {
          return false;
        }
        const rect = target.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      }), {
        timeout: 3000,
      })
      .toBe(true);

    await expect
      .poll(() => page.evaluate(readHomeHeroCtaState), {
        timeout: 5000,
      })
      .toMatchObject({
        mode: 'inview',
        motionInview: 'appear-v1',
        motionInviewAnimated: 'true',
      });
  });
});
