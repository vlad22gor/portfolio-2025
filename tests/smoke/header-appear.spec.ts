import { expect, test } from '@playwright/test';

test.describe('Site header appear', () => {
  test('plays top-down appear on first load and does not replay on soft-nav', async ({ page }) => {
    await page.addInitScript(() => {
      const runtimeWindow = window as typeof window & {
        __headerEarlySamples?: Array<{
          label: string;
          exists: boolean;
          headerAppearState: string | null;
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

      runtimeWindow.__headerEarlySamples = [];
      const sample = (label: string) => {
        const node = document.querySelector('.site-header-inner');
        if (!(node instanceof HTMLElement)) {
          runtimeWindow.__headerEarlySamples?.push({
            label,
            exists: false,
            headerAppearState: null,
            computedOpacity: null,
            computedTransform: null,
            translateY: null,
          });
          return;
        }

        const computedStyle = window.getComputedStyle(node);
        const opacity = Number.parseFloat(computedStyle.opacity);
        const transform = computedStyle.transform || 'none';
        runtimeWindow.__headerEarlySamples?.push({
          label,
          exists: true,
          headerAppearState: node.getAttribute('data-header-appear'),
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

    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    const header = page.locator('.site-header-inner');
    await expect(header).toHaveAttribute('data-header-appear', /^(pending|running|done)$/);

    const earlySamples = await page.evaluate(() => {
      const runtimeWindow = window as typeof window & {
        __headerEarlySamples?: Array<{
          label: string;
          exists: boolean;
          headerAppearState: string | null;
          computedOpacity: number | null;
          computedTransform: string | null;
          translateY: number | null;
        }>;
      };
      return runtimeWindow.__headerEarlySamples ?? [];
    });
    const earlyFlashGuard = earlySamples.some((sample) => {
      if (!sample.exists || sample.computedOpacity === null || sample.translateY === null) {
        return false;
      }
      const opacityInitial = sample.computedOpacity <= 0.01;
      const transformInitial = Math.abs(sample.translateY + 50) <= 1;
      return opacityInitial && transformInitial;
    });
    expect(earlyFlashGuard).toBe(true);

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const node = document.querySelector('.site-header-inner');
            if (!(node instanceof HTMLElement)) {
              return null;
            }
            return {
              headerAppearState: node.getAttribute('data-header-appear'),
              inlineOpacity: node.style.opacity || null,
              inlineTransform: node.style.transform || null,
            };
          }),
        { timeout: 4000 },
      )
      .toMatchObject({
        headerAppearState: 'done',
      });

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const node = document.querySelector('.site-header-inner');
            if (!(node instanceof HTMLElement)) {
              return null;
            }
            return {
              inlineOpacity: node.style.opacity || null,
              inlineTransform: node.style.transform || null,
            };
          }),
        { timeout: 3000 },
      )
      .toMatchObject({
        inlineOpacity: '1',
        inlineTransform: 'translate3d(0px, 0px, 0px)',
      });

    await page.evaluate(() => {
      const node = document.querySelector('.site-header-inner');
      if (!(node instanceof HTMLElement)) {
        return;
      }

      node.dataset.headerAppearSentinel = 'persisted';
      const events: Array<{
        label: string;
        headerAppearState: string | null;
        inlineOpacity: string | null;
        inlineTransform: string | null;
      }> = [];

      const capture = (label: string) => {
        events.push({
          label,
          headerAppearState: node.getAttribute('data-header-appear'),
          inlineOpacity: node.style.opacity || null,
          inlineTransform: node.style.transform || null,
        });
      };

      const observer = new MutationObserver(() => {
        capture('mutation');
      });
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['style', 'data-header-appear'],
      });

      const handlePageLoad = () => {
        capture('astro:page-load');
      };

      capture('audit-start');
      document.addEventListener('astro:page-load', handlePageLoad);

      (window as any).__headerAppearAudit = {
        stop() {
          capture('audit-stop');
          observer.disconnect();
          document.removeEventListener('astro:page-load', handlePageLoad);
          return events;
        },
      };
    });

    await page.click('.site-desktop-shell a[data-nav-id="gallery"]');
    await page.waitForURL('**/gallery');

    await page.click('.site-desktop-shell a[data-nav-id="home"]');
    await page.waitForURL('**/');

    const audit = await page.evaluate(() => {
      const runtime = (window as any).__headerAppearAudit;
      const events = runtime && typeof runtime.stop === 'function' ? runtime.stop() : [];
      const node = document.querySelector('.site-header-inner');
      if (!(node instanceof HTMLElement)) {
        return null;
      }

      return {
        events,
        sentinel: node.dataset.headerAppearSentinel ?? null,
        headerAppearState: node.getAttribute('data-header-appear'),
      };
    });

    expect(audit).not.toBeNull();
    expect(audit!.sentinel).toBe('persisted');
    expect(audit!.headerAppearState).toBe('done');

    const replayedInitialState = audit!.events.some((event: {
      headerAppearState: string | null;
      inlineOpacity: string | null;
      inlineTransform: string | null;
    }) => {
      const hasInitialOpacity = event.inlineOpacity === '0';
      const hasInitialTransform = (event.inlineTransform ?? '').includes('-50px');
      const hasNonFinalState = event.headerAppearState === 'pending' || event.headerAppearState === 'running';
      return hasInitialOpacity || hasInitialTransform || hasNonFinalState;
    });

    expect(replayedInitialState).toBe(false);
  });
});
