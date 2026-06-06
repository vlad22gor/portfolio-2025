import { readFile } from 'node:fs/promises';

const shouldReadSource = process.argv.includes('--source');
const source = await readFile(
  new URL(shouldReadSource ? '../src/layouts/BaseLayout.astro' : '../dist/index.html', import.meta.url),
  'utf8',
);
const expectedCoverUrl = 'https://vladhorovyy.com/media/site/site-cover.png?v=2026-06-06';

const metaContent = (attribute, value) => {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i',
  );
  const reversedPattern = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${value}["'][^>]*>`,
    'i',
  );
  return source.match(pattern)?.[1] ?? source.match(reversedPattern)?.[1] ?? null;
};

const assertMeta = (label, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual ?? 'missing'}"`);
  }
};

if (shouldReadSource) {
  const sourceExpectations = [
    "const socialCoverPath = '/media/site/site-cover.png';",
    "const socialCoverVersion = '2026-06-06';",
    'const socialCoverUrl = new URL(`${socialCoverPath}?v=${socialCoverVersion}`, siteBaseUrl).toString();',
    '<meta property="og:image" content={socialCoverUrl} />',
    '<meta name="twitter:title" content={siteTitle} />',
    '<meta name="twitter:description" content={siteDescription} />',
    '<meta name="twitter:image" content={socialCoverUrl} />',
    '<meta name="twitter:image:alt" content={socialCoverAlt} />',
  ];

  const missing = sourceExpectations.filter((expected) => !source.includes(expected));
  if (missing.length > 0) {
    throw new Error(`BaseLayout social metadata source contract is missing: ${missing.join(', ')}`);
  }
} else {
  assertMeta('og:image', metaContent('property', 'og:image'), expectedCoverUrl);
  assertMeta('twitter:image', metaContent('name', 'twitter:image'), expectedCoverUrl);
  assertMeta('twitter:title', metaContent('name', 'twitter:title'), 'Vlad Horovyy – Product Designer');
  assertMeta(
    'twitter:description',
    metaContent('name', 'twitter:description'),
    'Product designer from Kyiv crafting standout mobile apps',
  );
  assertMeta('twitter:image:alt', metaContent('name', 'twitter:image:alt'), 'Vlad Horovyy portfolio cover');
}

console.log('Social metadata looks good.');
