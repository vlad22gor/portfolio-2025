import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const ROUTES = ['/', '/cases', '/gallery', '/fora', '/kissa'];
const VIEWPORT = { width: 1360, height: 2200 };
const OUTPUT_PATH = path.resolve('tasks/manifests/render-size-manifest-desktop.json');

const normalizeMediaPath = (source, origin) => {
  if (!source) return null;
  try {
    const url = new URL(source, origin);
    if (!url.pathname.startsWith('/media/')) return null;
    return url.pathname;
  } catch {
    return null;
  }
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  const assets = new Map();

  for (const route of ROUTES) {
    const url = new URL(route, BASE_URL).toString();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });

    const routeRecords = await page.evaluate(() => {
      const records = [];
      const origin = window.location.origin;

      const normalize = (source) => {
        if (!source) return null;
        try {
          const resolved = new URL(source, origin);
          if (!resolved.pathname.startsWith('/media/')) return null;
          return resolved.pathname;
        } catch {
          return null;
        }
      };

      for (const img of Array.from(document.images)) {
        const source = img.currentSrc || img.getAttribute('src') || '';
        const mediaPath = normalize(source);
        if (!mediaPath) continue;
        const rect = img.getBoundingClientRect();
        const renderedWidth = img.offsetWidth || rect.width;
        const renderedHeight = img.offsetHeight || rect.height;
        if (renderedWidth <= 0 || renderedHeight <= 0) continue;
        records.push({
          path: mediaPath,
          kind: 'image',
          renderedWidth,
          renderedHeight,
          route: window.location.pathname,
        });
      }

      for (const video of Array.from(document.querySelectorAll('video'))) {
        const poster = video.getAttribute('poster') || '';
        const mediaPath = normalize(poster);
        if (!mediaPath) continue;
        const rect = video.getBoundingClientRect();
        const renderedWidth = video.offsetWidth || rect.width;
        const renderedHeight = video.offsetHeight || rect.height;
        if (renderedWidth <= 0 || renderedHeight <= 0) continue;
        records.push({
          path: mediaPath,
          kind: 'poster',
          renderedWidth,
          renderedHeight,
          route: window.location.pathname,
        });
      }

      return records;
    });

    for (const record of routeRecords) {
      const mediaPath = normalizeMediaPath(record.path, BASE_URL);
      if (!mediaPath) continue;

      const existing = assets.get(mediaPath);
      if (!existing) {
        assets.set(mediaPath, {
          path: mediaPath,
          maxRenderedWidth: Number(record.renderedWidth.toFixed(3)),
          maxRenderedHeight: Number(record.renderedHeight.toFixed(3)),
          samples: [record],
        });
        continue;
      }

      existing.maxRenderedWidth = Math.max(existing.maxRenderedWidth, Number(record.renderedWidth.toFixed(3)));
      existing.maxRenderedHeight = Math.max(existing.maxRenderedHeight, Number(record.renderedHeight.toFixed(3)));
      existing.samples.push(record);
    }
  }

  await browser.close();

  const output = {
    generatedAt: new Date().toISOString(),
    baseURL: BASE_URL,
    viewport: VIEWPORT,
    routes: ROUTES,
    assets: Array.from(assets.values()).sort((a, b) => a.path.localeCompare(b.path)),
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(`[collect-render-sizes] wrote ${output.assets.length} assets -> ${OUTPUT_PATH}`);
};

main().catch((error) => {
  console.error('[collect-render-sizes] failed:', error);
  process.exit(1);
});
