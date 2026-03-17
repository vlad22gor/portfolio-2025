#!/usr/bin/env node
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MEDIA_ROOT = path.join(ROOT, 'public', 'media');
const MIN_VALID_POSTER_BYTES = 24 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const walk = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const relativeFromRoot = (filePath) => path.relative(ROOT, filePath);

const resolvePosterPath = (videoPath) => {
  const relToMedia = path.relative(MEDIA_ROOT, videoPath);
  const flowSegment = `${path.sep}flows${path.sep}`;

  if (!relToMedia.includes(flowSegment)) {
    return null;
  }

  const withPosterDir = relToMedia.replace(flowSegment, `${path.sep}posters${path.sep}`);
  const posterRel = withPosterDir.replace(/\.webm$/i, '.png');
  return path.join(MEDIA_ROOT, posterRel);
};

const readPngMetadata = async (posterPath) => {
  const buffer = await readFile(posterPath);

  if (buffer.length < 24) {
    return { valid: false, reason: 'file is too small to be a PNG' };
  }

  const signature = buffer.subarray(0, 8);
  if (!signature.equals(PNG_SIGNATURE)) {
    return { valid: false, reason: 'invalid PNG signature' };
  }

  const ihdrName = buffer.toString('ascii', 12, 16);
  if (ihdrName !== 'IHDR') {
    return { valid: false, reason: 'missing IHDR chunk' };
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width === 0 || height === 0) {
    return { valid: false, reason: 'invalid PNG dimensions' };
  }

  return { valid: true, width, height };
};

const main = async () => {
  try {
    await access(MEDIA_ROOT, fsConstants.R_OK);
  } catch {
    console.error('[verify:posters] Папка public/media не найдена.');
    process.exit(1);
  }

  const allFiles = await walk(MEDIA_ROOT);
  const flowVideos = allFiles.filter(
    (filePath) =>
      filePath.toLowerCase().endsWith('.webm') &&
      filePath.includes(`${path.sep}flows${path.sep}`),
  );

  if (!flowVideos.length) {
    console.log('[verify:posters] flow-видео (.webm в /flows/) не найдены. Нечего проверять.');
    return;
  }

  const issues = [];
  const checked = [];

  for (const videoPath of flowVideos) {
    const posterPath = resolvePosterPath(videoPath);
    if (!posterPath) {
      issues.push(`Невозможно вычислить poster-путь для: ${relativeFromRoot(videoPath)}`);
      continue;
    }

    let posterStats;
    try {
      posterStats = await stat(posterPath);
    } catch {
      issues.push(
        `Отсутствует poster для ${relativeFromRoot(videoPath)} (ожидается ${relativeFromRoot(posterPath)})`,
      );
      continue;
    }

    if (posterStats.size < MIN_VALID_POSTER_BYTES) {
      issues.push(
        `Слишком маленький poster (${posterStats.size} bytes) для ${relativeFromRoot(videoPath)} -> ${relativeFromRoot(posterPath)}`,
      );
      continue;
    }

    const pngMetadata = await readPngMetadata(posterPath);
    if (!pngMetadata.valid) {
      issues.push(
        `Невалидный PNG poster для ${relativeFromRoot(videoPath)} -> ${relativeFromRoot(posterPath)} (${pngMetadata.reason})`,
      );
      continue;
    }

    checked.push({
      videoPath: relativeFromRoot(videoPath),
      posterPath: relativeFromRoot(posterPath),
      size: posterStats.size,
      width: pngMetadata.width,
      height: pngMetadata.height,
    });
  }

  if (issues.length) {
    console.error(`[verify:posters] Ошибки (${issues.length}):`);
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
    process.exit(1);
  }

  console.log(`[verify:posters] OK: проверено ${checked.length} video/poster пар.`);
  for (const item of checked) {
    console.log(
      `  - ${item.videoPath} -> ${item.posterPath} (${item.width}x${item.height}, ${item.size} bytes)`,
    );
  }
};

await main();
