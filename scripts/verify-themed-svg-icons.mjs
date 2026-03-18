import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'src');

const restrictedPathPrefixes = [
  '/media/home/quotes/',
  '/media/cases/section/',
  '/media/icons/cases/',
  '/media/cases/fora/challenge/',
  '/media/cases/kissa/challenge/',
  '/media/cases/fora/process/',
  '/media/cases/kissa/process/',
  '/media/cases/fora/design-system/',
  '/media/cases/kissa/artifact-photos/',
  '/media/cases/fora/team-photo/',
];

const restrictedLegacyClassFragments = [
  'quotes-mark',
  'cases-cards-description-arrow',
  'case-card-arrow',
  'case-challenge-arrow',
  'case-process-step__arrow',
  'fora-design-system-arrow',
  'kissa-artifact-photos-arrow',
  'fora-team-photo-heart',
];

const collectFiles = async (dir, extension, acc = []) => {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(absolutePath, extension, acc);
      continue;
    }
    if (entry.isFile() && absolutePath.endsWith(extension)) {
      acc.push(absolutePath);
    }
  }
  return acc;
};

const toLineNumber = (content, index) => content.slice(0, index).split('\n').length;
const toRelativePath = (absolutePath) => path.relative(rootDir, absolutePath).replaceAll(path.sep, '/');

const astroFiles = await collectFiles(sourceDir, '.astro');
const violations = [];

for (const filePath of astroFiles) {
  const content = await readFile(filePath, 'utf8');
  const imageTags = content.matchAll(/<img\b[\s\S]*?>/gi);

  for (const match of imageTags) {
    const snippet = match[0];
    const lineNumber = toLineNumber(content, match.index ?? 0);
    const hasSvgSource = snippet.includes('.svg');
    const hasRestrictedPath = hasSvgSource && restrictedPathPrefixes.some((prefix) => snippet.includes(prefix));
    const hasRestrictedLegacyClass = restrictedLegacyClassFragments.some((fragment) => snippet.includes(fragment));

    if (!hasRestrictedPath && !hasRestrictedLegacyClass) {
      continue;
    }

    violations.push({
      file: toRelativePath(filePath),
      line: lineNumber,
      snippet: snippet.replace(/\s+/g, ' ').trim().slice(0, 220),
    });
  }
}

if (violations.length > 0) {
  console.error('verify-themed-svg-icons: found prohibited <img> usage for themed SVG glyphs:');
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`);
    console.error(`  ${violation.snippet}`);
  }
  process.exit(1);
}

console.log('verify-themed-svg-icons: OK');
