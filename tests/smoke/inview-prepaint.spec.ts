import { expect, test, type Page } from '@playwright/test';

type EarlySample = {
  label: string;
  exists: boolean;
  readyState: string;
  opacity: number | null;
  translateY: number | null;
};

const samplePaintEntries = async (page: Page, selector: string, key: string) => {
  await page.addInitScript(
    ({ targetSelector, storageKey }) => {
      const store = window as typeof window & Record<string, unknown>;
      store[storageKey] = [];

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

      const pushSample = (label: string) => {
        const target = document.querySelector(targetSelector);
        const samples = store[storageKey] as Array<Record<string, unknown>>;
        if (!(target instanceof HTMLElement)) {
          samples.push({
            label,
            exists: false,
            readyState: document.readyState,
            opacity: null,
            translateY: null,
          });
          return;
        }
        const computed = window.getComputedStyle(target);
        const opacity = Number.parseFloat(computed.opacity);
        samples.push({
          label,
          exists: true,
          readyState: document.readyState,
          opacity: Number.isFinite(opacity) ? opacity : null,
          translateY: resolveTranslateY(computed.transform || 'none'),
        });
      };

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint' || entry.name === 'first-contentful-paint') {
            pushSample(entry.name);
          }
        }
      });
      observer.observe({ type: 'paint', buffered: true });

      pushSample('init-script');
      document.addEventListener('DOMContentLoaded', () => pushSample('domcontentloaded'));
      window.addEventListener('load', () => pushSample('load'));
    },
    { targetSelector: selector, storageKey: key },
  );
};

const readPaintSamples = async (page: Page, key: string): Promise<EarlySample[]> =>
  page.evaluate((storageKey) => {
    const store = window as typeof window & Record<string, unknown>;
    const samples = store[storageKey];
    return Array.isArray(samples) ? (samples as EarlySample[]) : [];
  }, key);

const assertPrepaintInitialState = (samples: EarlySample[], expectedTranslateY: number) => {
  const paintSamples = samples.filter(
    (sample) => sample.label === 'first-paint' || sample.label === 'first-contentful-paint',
  );
  expect(paintSamples.length).toBeGreaterThan(0);

  const paintSamplesWithNode = paintSamples.filter((sample) => sample.exists);
  expect(paintSamplesWithNode.length).toBeGreaterThan(0);

  paintSamplesWithNode.forEach((sample) => {
    expect(sample.opacity).not.toBeNull();
    expect(sample.translateY).not.toBeNull();
    expect(sample.opacity ?? 1).toBeLessThanOrEqual(0.01);
    expect(Math.abs((sample.translateY ?? 0) - expectedTranslateY)).toBeLessThanOrEqual(1);
  });
};

const expectAnimationFinalState = async (page: Page, selector: string) => {
  await expect
    .poll(
      () =>
        page.evaluate((targetSelector) => {
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

          const target = document.querySelector(targetSelector);
          if (!(target instanceof HTMLElement)) {
            return false;
          }
          const computed = window.getComputedStyle(target);
          const opacity = Number.parseFloat(computed.opacity);
          const translateY = resolveTranslateY(computed.transform || 'none');
          if (!Number.isFinite(opacity) || translateY === null) {
            return false;
          }
          return opacity >= 0.99 && Math.abs(translateY) <= 1;
        }, selector),
      { timeout: 6000 },
    )
    .toBe(true);
};

test.describe('InView pre-paint anti-flash', () => {
  test.use({ viewport: { width: 1360, height: 900 } });

  test('/cases applies initial appear state on paint frames', async ({ page }) => {
    const selector = '.cases-cards-list [data-motion-stage-item][data-motion-stagger-index="0"]';
    const storageKey = '__inviewPrepaintCases';
    await samplePaintEntries(page, selector, storageKey);

    await page.goto('/cases', { waitUntil: 'load' });

    const samples = await readPaintSamples(page, storageKey);
    assertPrepaintInitialState(samples, 50);
    await expectAnimationFinalState(page, selector);
  });

  test('/fora applies initial appear state on paint frames', async ({ page }) => {
    const selector = '.fora-intro-section [data-motion-stage-item][data-motion-stagger-index="0"]';
    const storageKey = '__inviewPrepaintFora';
    await samplePaintEntries(page, selector, storageKey);

    await page.goto('/fora', { waitUntil: 'load' });

    const samples = await readPaintSamples(page, storageKey);
    assertPrepaintInitialState(samples, 50);
    await expectAnimationFinalState(page, selector);
  });
});
