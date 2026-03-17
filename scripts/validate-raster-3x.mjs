import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:fs';
import { execFileSync } from 'node:child_process';

const MANIFEST_PATH = path.resolve(process.env.RENDER_SIZE_MANIFEST ?? 'tasks/manifests/render-size-manifest-desktop.json');
const RASTER_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const getImageSize = (absolutePath) => {
  const output = execFileSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'default=nokey=1:noprint_wrappers=1',
    absolutePath,
  ], { encoding: 'utf8' }).trim().split(/\s+/);

  if (output.length < 2) {
    throw new Error(`ffprobe returned invalid output for ${absolutePath}`);
  }

  return {
    width: Number(output[0]),
    height: Number(output[1]),
  };
};

const main = async () => {
  const raw = await readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);
  const failures = [];
  let checked = 0;

  for (const entry of manifest.assets ?? []) {
    const ext = path.extname(entry.path).toLowerCase();
    if (!RASTER_EXTENSIONS.has(ext)) continue;

    const absolutePath = path.resolve(`public${entry.path}`);
    try {
      await access(absolutePath, constants.R_OK);
    } catch {
      failures.push({
        path: entry.path,
        reason: 'missing-file',
      });
      continue;
    }

    const natural = getImageSize(absolutePath);
    const requiredWidth = Math.ceil(Number(entry.maxRenderedWidth) * 3);
    const requiredHeight = Math.ceil(Number(entry.maxRenderedHeight) * 3);

    checked += 1;

    if (natural.width < requiredWidth || natural.height < requiredHeight) {
      failures.push({
        path: entry.path,
        reason: 'below-3x-threshold',
        naturalWidth: natural.width,
        naturalHeight: natural.height,
        requiredWidth,
        requiredHeight,
      });
    }
  }

  if (failures.length > 0) {
    console.error(`[validate-raster-3x] FAILED: ${failures.length} issues (checked ${checked} raster assets).`);
    for (const item of failures) {
      console.error(`- ${item.path}: ${item.reason}${item.requiredWidth ? ` (natural ${item.naturalWidth}x${item.naturalHeight}, required ${item.requiredWidth}x${item.requiredHeight})` : ''}`);
    }
    process.exit(1);
  }

  console.log(`[validate-raster-3x] OK: checked ${checked} raster assets from manifest ${MANIFEST_PATH}`);
};

main().catch((error) => {
  console.error('[validate-raster-3x] failed:', error);
  process.exit(1);
});
