#!/usr/bin/env node
import { spawn } from "node:child_process";
import { access, mkdir, readdir, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MEDIA_ROOT = path.join(ROOT, "public", "media");
const MIN_VALID_POSTER_BYTES = 24 * 1024;

const ffmpegArgs = (inputPath, outputPath, mode) => {
  if (mode === "thumbnail") {
    return [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      inputPath,
      "-vf",
      "thumbnail=120",
      "-frames:v",
      "1",
      outputPath,
    ];
  }

  return [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    inputPath,
    "-frames:v",
    "1",
    outputPath,
  ];
};

const ensureFfmpeg = async () => {
  await new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ["-version"]);
    proc.on("error", () => {
      reject(
        new Error(
          "ffmpeg не найден в PATH. Установи ffmpeg (например, brew install ffmpeg), чтобы автогенерация постеров работала.",
        ),
      );
    });
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg завершился с кодом ${code}`));
    });
  });
};

const runFfmpeg = (inputPath, outputPath, mode) =>
  new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", ffmpegArgs(inputPath, outputPath, mode), {
      stdio: "inherit",
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

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

const resolvePosterPath = (videoPath) => {
  const relToMedia = path.relative(MEDIA_ROOT, videoPath);
  const withPosterDir = relToMedia.includes(`${path.sep}flows${path.sep}`)
    ? relToMedia.replace(`${path.sep}flows${path.sep}`, `${path.sep}posters${path.sep}`)
    : relToMedia;
  const posterRel = withPosterDir.replace(/\.webm$/i, ".png");
  return path.join(MEDIA_ROOT, posterRel);
};

const shouldRegeneratePoster = async (videoPath, posterPath) => {
  const videoStats = await stat(videoPath);

  try {
    const posterStats = await stat(posterPath);
    if (posterStats.mtimeMs < videoStats.mtimeMs) {
      return true;
    }
    if (posterStats.size < MIN_VALID_POSTER_BYTES) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
};

const relativeFromRoot = (filePath) => path.relative(ROOT, filePath);

const generatePoster = async (videoPath, posterPath) => {
  await mkdir(path.dirname(posterPath), { recursive: true });
  await runFfmpeg(videoPath, posterPath, "first");
  const generated = await stat(posterPath);
  if (generated.size >= MIN_VALID_POSTER_BYTES) {
    return { mode: "first", size: generated.size };
  }

  await runFfmpeg(videoPath, posterPath, "thumbnail");
  const regenerated = await stat(posterPath);
  return { mode: "thumbnail", size: regenerated.size };
};

const main = async () => {
  try {
    await ensureFfmpeg();
  } catch (error) {
    console.error(`[posters] ${error.message}`);
    process.exit(1);
  }

  try {
    await access(MEDIA_ROOT, fsConstants.R_OK);
  } catch {
    console.log("[posters] Папка public/media не найдена, пропускаю.");
    return;
  }

  const allFiles = await walk(MEDIA_ROOT);
  const videos = allFiles.filter(
    (filePath) =>
      filePath.toLowerCase().endsWith(".webm") && filePath.includes(`${path.sep}flows${path.sep}`),
  );

  if (!videos.length) {
    console.log("[posters] .webm файлы не найдены.");
    return;
  }

  let generatedCount = 0;
  let skippedCount = 0;

  for (const videoPath of videos) {
    const posterPath = resolvePosterPath(videoPath);
    const needsRegenerate = await shouldRegeneratePoster(videoPath, posterPath);
    if (!needsRegenerate) {
      skippedCount += 1;
      continue;
    }

    const { mode, size } = await generatePoster(videoPath, posterPath);
    generatedCount += 1;
    console.log(
      `[posters] ${relativeFromRoot(videoPath)} -> ${relativeFromRoot(posterPath)} (${mode}, ${size} bytes)`,
    );
  }

  console.log(`[posters] Готово: сгенерировано ${generatedCount}, пропущено ${skippedCount}.`);
};

await main();
