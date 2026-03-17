import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const MEDIA_ROOT = path.resolve('public/media');
const MANIFEST_PATH = path.resolve(process.env.RENDER_SIZE_MANIFEST ?? 'tasks/manifests/render-size-manifest-desktop.json');
const MAP_PATH = path.resolve(process.env.MEDIA_PATH_MAP ?? 'tasks/manifests/raster-path-map.json');
const RASTER_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
};

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

const runFfmpeg = (args) => {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'pipe' });
};

const ensureDir = async (filePath) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const relMediaPath = (absolutePath) => `/media/${path.relative(MEDIA_ROOT, absolutePath).replaceAll(path.sep, '/')}`;

const main = async () => {
  const manifestRaw = await readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const manifestMap = new Map((manifest.assets ?? []).map((entry) => [entry.path, entry]));

  const allFiles = await walk(MEDIA_ROOT);
  const rasterFiles = allFiles.filter((filePath) => RASTER_EXTENSIONS.has(path.extname(filePath).toLowerCase()));

  const replacements = {};
  const report = {
    generatedAt: new Date().toISOString(),
    manifest: MANIFEST_PATH,
    optimized: [],
    skipped: [],
    replacements,
  };

  for (const inputPath of rasterFiles) {
    const originalStats = await stat(inputPath);
    const originalSize = originalStats.size;
    const originalDims = getImageSize(inputPath);
    const mediaPath = relMediaPath(inputPath);
    const ext = path.extname(inputPath).toLowerCase();
    const isPoster = mediaPath.includes('/posters/');

    const manifestEntry = manifestMap.get(mediaPath);
    const requiredWidth = manifestEntry ? Math.ceil(Number(manifestEntry.maxRenderedWidth) * 3) : 0;
    const requiredHeight = manifestEntry ? Math.ceil(Number(manifestEntry.maxRenderedHeight) * 3) : 0;

    let targetWidth = originalDims.width;
    let targetHeight = originalDims.height;
    let resized = false;

    if (requiredWidth > 0 && requiredHeight > 0) {
      const scale = Math.max(requiredWidth / originalDims.width, requiredHeight / originalDims.height);
      if (scale < 1) {
        targetWidth = Math.max(1, Math.ceil(originalDims.width * scale));
        targetHeight = Math.max(1, Math.ceil(originalDims.height * scale));
        resized = targetWidth !== originalDims.width || targetHeight !== originalDims.height;
      }
    }

    const scaleFilter = resized ? `scale=${targetWidth}:${targetHeight}:flags=lanczos` : null;
    const tempPath = path.join(os.tmpdir(), `asset-opt-${process.pid}-${Math.random().toString(16).slice(2)}${isPoster ? ext : '.webp'}`);

    try {
      if (isPoster) {
        const ffmpegArgs = ['-i', inputPath];
        if (scaleFilter) ffmpegArgs.push('-vf', scaleFilter);
        ffmpegArgs.push('-c:v', 'png', '-compression_level', '9', '-pred', 'mixed', tempPath);
        runFfmpeg(ffmpegArgs);

        const candidateStats = await stat(tempPath);
        if (candidateStats.size < originalSize) {
          await ensureDir(inputPath);
          await rename(tempPath, inputPath);
          report.optimized.push({
            from: mediaPath,
            to: mediaPath,
            originalSize,
            optimizedSize: candidateStats.size,
            resized,
            originalDims,
            targetDims: { width: targetWidth, height: targetHeight },
            reason: 'poster-png-recompress',
          });
        } else {
          await rm(tempPath, { force: true });
          report.skipped.push({
            path: mediaPath,
            reason: 'poster-not-smaller',
            originalSize,
            candidateSize: candidateStats.size,
          });
        }
        continue;
      }

      const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const outputMediaPath = mediaPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

      const ffmpegArgs = ['-i', inputPath];
      if (scaleFilter) ffmpegArgs.push('-vf', scaleFilter);
      ffmpegArgs.push(
        '-c:v',
        'libwebp',
        '-lossless',
        '1',
        '-compression_level',
        '6',
        '-q:v',
        '100',
        '-preset',
        'picture',
        tempPath,
      );
      runFfmpeg(ffmpegArgs);

      const candidateStats = await stat(tempPath);
      if (candidateStats.size >= originalSize) {
        await rm(tempPath, { force: true });
        report.skipped.push({
          path: mediaPath,
          reason: 'webp-not-smaller',
          originalSize,
          candidateSize: candidateStats.size,
        });
        continue;
      }

      await ensureDir(outputPath);
      await rename(tempPath, outputPath);
      await rm(inputPath, { force: true });
      replacements[mediaPath] = outputMediaPath;

      report.optimized.push({
        from: mediaPath,
        to: outputMediaPath,
        originalSize,
        optimizedSize: candidateStats.size,
        resized,
        originalDims,
        targetDims: { width: targetWidth, height: targetHeight },
        reason: 'webp-lossless',
      });
    } catch (error) {
      await rm(tempPath, { force: true });
      report.skipped.push({
        path: mediaPath,
        reason: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await mkdir(path.dirname(MAP_PATH), { recursive: true });
  await writeFile(MAP_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[optimize-raster-assets] optimized: ${report.optimized.length}, skipped: ${report.skipped.length}`);
  console.log(`[optimize-raster-assets] path map: ${MAP_PATH}`);
};

main().catch((error) => {
  console.error('[optimize-raster-assets] failed:', error);
  process.exit(1);
});
