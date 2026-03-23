#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { access, mkdir, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const VARIANTS = [
  {
    input: 'public/media/gallery/illustrations/coin-wheel.webm',
    output: 'public/media/gallery/illustrations/coin-wheel.mov',
  },
  {
    input: 'public/media/gallery/illustrations/loader-light.webm',
    output: 'public/media/gallery/illustrations/loader-light.mov',
  },
  {
    input: 'public/media/cases/section/loader_light.webm',
    output: 'public/media/cases/section/loader_light.mov',
  },
];

const run = (args) =>
  new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

const ensureFfmpegAvailable = async () => {
  await run(['-hide_banner', '-loglevel', 'error', '-version']);
};

const ensureHevcVideotoolboxEncoder = async () => {
  await new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', ['-hide_banner', '-encoders'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg -encoders failed (${code}): ${stderr.trim()}`));
        return;
      }
      if (!stdout.includes('hevc_videotoolbox')) {
        reject(new Error('Encoder hevc_videotoolbox is not available in ffmpeg build.'));
        return;
      }
      resolve();
    });
  });
};

const resolveFromRoot = (relativePath) => path.join(ROOT, relativePath);
const relativeFromRoot = (filePath) => path.relative(ROOT, filePath);

const shouldGenerate = async (inputPath, outputPath) => {
  const inputStats = await stat(inputPath);
  try {
    const outputStats = await stat(outputPath);
    if (outputStats.size <= 0) {
      return true;
    }
    return outputStats.mtimeMs < inputStats.mtimeMs;
  } catch {
    return true;
  }
};

const generateVariant = async (inputPath, outputPath) => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await run([
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-c:v',
    'libvpx-vp9',
    '-i',
    inputPath,
    '-an',
    '-c:v',
    'hevc_videotoolbox',
    '-alpha_quality',
    '0.75',
    '-tag:v',
    'hvc1',
    '-movflags',
    '+faststart',
    outputPath,
  ]);
};

const main = async () => {
  if (process.platform !== 'darwin') {
    console.log('[transparent-mov] Non-macOS host detected, skipping MOV generation.');
    return;
  }

  await ensureFfmpegAvailable();
  await ensureHevcVideotoolboxEncoder();

  let generatedCount = 0;
  let skippedCount = 0;

  for (const variant of VARIANTS) {
    const inputPath = resolveFromRoot(variant.input);
    const outputPath = resolveFromRoot(variant.output);
    await access(inputPath, fsConstants.R_OK);

    const needsGeneration = await shouldGenerate(inputPath, outputPath);
    if (!needsGeneration) {
      skippedCount += 1;
      continue;
    }

    await generateVariant(inputPath, outputPath);
    generatedCount += 1;
    console.log(
      `[transparent-mov] ${relativeFromRoot(inputPath)} -> ${relativeFromRoot(outputPath)}`,
    );
  }

  console.log(
    `[transparent-mov] Done: generated ${generatedCount}, skipped ${skippedCount}.`,
  );
};

await main();
