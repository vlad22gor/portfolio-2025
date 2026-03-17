import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAP_PATH = path.resolve(process.env.MEDIA_PATH_MAP ?? 'tasks/manifests/raster-path-map.json');
const TARGET_DIRS = [path.resolve('src'), path.resolve('tests')];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.astro']);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue;
    files.push(fullPath);
  }
  return files;
};

const main = async () => {
  const raw = await readFile(MAP_PATH, 'utf8');
  const map = JSON.parse(raw);

  const replacements = Object.entries(map.replacements ?? {})
    .filter(([from, to]) => from && to && from !== to)
    .sort((a, b) => b[0].length - a[0].length);

  if (replacements.length === 0) {
    console.log('[rewrite-media-paths] no replacements found, skipping.');
    return;
  }

  const files = [];
  for (const dir of TARGET_DIRS) {
    try {
      const meta = await stat(dir);
      if (!meta.isDirectory()) continue;
      files.push(...(await walk(dir)));
    } catch {
      // ignore
    }
  }

  let changedFiles = 0;
  let replacementsCount = 0;

  for (const filePath of files) {
    let content = await readFile(filePath, 'utf8');
    let nextContent = content;

    for (const [from, to] of replacements) {
      if (!nextContent.includes(from)) continue;
      const parts = nextContent.split(from);
      const count = parts.length - 1;
      if (count <= 0) continue;
      nextContent = parts.join(to);
      replacementsCount += count;
    }

    if (nextContent !== content) {
      await writeFile(filePath, nextContent, 'utf8');
      changedFiles += 1;
    }
  }

  console.log(`[rewrite-media-paths] changed ${changedFiles} files, applied ${replacementsCount} replacements.`);
};

main().catch((error) => {
  console.error('[rewrite-media-paths] failed:', error);
  process.exit(1);
});
