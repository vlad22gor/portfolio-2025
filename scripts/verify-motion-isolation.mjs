#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const caseMediaRoot = path.join(root, 'public', 'media', 'cases');
const verifiedMotionRoots = [
  path.join(caseMediaRoot, 'goomy', 'flows'),
];
const packagePath = path.join(root, 'package.json');
const forbiddenAuthoringPaths = [
  'src/pages/goomy-onboarding-motion.astro',
  'src/pages/goomy-paywall-activation-flow.astro',
  'src/components/goomy/GoomYOnboardingMotion.tsx',
  'src/components/goomy/GoomYPaywallActivationFlow.tsx',
  'src/styles/goomy-onboarding-motion.css',
  'src/styles/goomy-paywall-activation-flow.css',
];
const forbiddenSourcePatterns = [
  { label: 'DialKit import', pattern: /from\s+['"]dialkit(?:\/[^'"]*)?['"]/ },
  { label: 'authoring production flag', pattern: /\bproductionEnabled\b/ },
  { label: 'DialKit authoring timeline', pattern: /\buseDialTimeline\b/ },
  { label: 'Motion Lab source import', pattern: /(?:from\s+['"][^'"]*motion-lab|Documents\/Design\/motion-lab)/ },
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  if (!(await exists(directory))) return [];
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(entryPath));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

const issues = [];
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
if (packageJson.dependencies?.dialkit || packageJson.devDependencies?.dialkit) {
  issues.push('package.json still contains the authoring-only dialkit dependency.');
}

for (const relativePath of forbiddenAuthoringPaths) {
  if (await exists(path.join(root, relativePath))) {
    issues.push(`Forbidden authoring source remains: ${relativePath}`);
  }
}

for (const sourcePath of await walk(sourceRoot)) {
  if (!/\.(?:astro|css|js|jsx|mjs|ts|tsx)$/.test(sourcePath)) continue;
  const source = await readFile(sourcePath, 'utf8');
  for (const forbidden of forbiddenSourcePatterns) {
    if (forbidden.pattern.test(source)) {
      issues.push(
        `${forbidden.label} in ${path.relative(root, sourcePath)}`,
      );
    }
  }
}

const caseMediaFiles = await walk(caseMediaRoot);
for (const filePath of caseMediaFiles) {
  const relativePath = path.relative(root, filePath);
  if (/[/\\](?:frames?|raw-frames?)[/\\]/i.test(filePath) || /frame-\d{6}\.png$/i.test(filePath)) {
    issues.push(`Raw capture frame is forbidden in production: ${relativePath}`);
  }
}

const verifiedMotionFiles = (
  await Promise.all(verifiedMotionRoots.map((directory) => walk(directory)))
).flat();
const videos = verifiedMotionFiles.filter((filePath) => filePath.endsWith('.webm'));
for (const videoPath of videos) {
  const stem = videoPath.slice(0, -'.webm'.length);
  const posterPath = `${stem}-poster.png`;
  const manifestPath = `${stem}.manifest.json`;
  for (const [role, requiredPath] of [
    ['poster', posterPath],
    ['artifact manifest', manifestPath],
  ]) {
    if (!(await exists(requiredPath))) {
      issues.push(`Missing ${role} for ${path.relative(root, videoPath)}.`);
    }
  }
  if (!(await exists(manifestPath))) continue;

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    issues.push(`Invalid manifest JSON ${path.relative(root, manifestPath)}: ${error.message}`);
    continue;
  }
  if (manifest.verification?.status !== 'verified' || manifest.source?.dirty !== false) {
    issues.push(`Manifest is not verified from a clean source: ${path.relative(root, manifestPath)}`);
  }
  const artifactByRole = new Map(
    (manifest.artifacts ?? []).map((artifact) => [artifact.role, artifact]),
  );
  for (const [role, requiredPath] of [
    ['video-primary', videoPath],
    ['poster', posterPath],
  ]) {
    const artifact = artifactByRole.get(role);
    if (!artifact) {
      issues.push(`Manifest is missing ${role}: ${path.relative(root, manifestPath)}`);
      continue;
    }
    if (!(await exists(requiredPath))) continue;
    const [actualHash, actualStats] = await Promise.all([
      sha256(requiredPath),
      stat(requiredPath),
    ]);
    if (artifact.sha256 !== actualHash || artifact.bytes !== actualStats.size) {
      issues.push(`Manifest hash/size mismatch for ${path.relative(root, requiredPath)}`);
    }
  }
}

if (issues.length > 0) {
  console.error(`[verify:motion-isolation] Failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `[verify:motion-isolation] OK: no authoring source; ${videos.length} verified video set(s).`,
);
