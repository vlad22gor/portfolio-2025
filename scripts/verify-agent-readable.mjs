import { readdir, readFile, stat } from 'node:fs/promises';

const shouldReadSource = process.argv.includes('--source');
const root = new URL('..', import.meta.url);
const contentRoot = new URL(shouldReadSource ? './public/' : './dist/', root);

const requiredFiles = [
  'llms.txt',
  'llms-full.txt',
  'agent-profile.md',
  'fora.md',
  'kissa.md',
  'gallery.md',
];

const expectedPublicFacts = [
  'Vladyslav Horovyy',
  'Product designer from Kyiv crafting standout mobile apps',
  'mobile B2C app',
  '0-to-1 product design',
  'craft-heavy product polish',
  '5+ years',
  '700K MAU',
  'Fozzy Group',
  'MVP',
];

const forbiddenPublicFragments = [
  'Fit score',
  'Outreach score',
  'Apply priority score',
  'tracker',
  'google.com/spreadsheets',
  'compensation target',
  'salary expectations',
  '4000 USD',
  'service account',
  'Manual review',
  'Vacancies/',
  'job-search',
  'career-search',
  'public/private boundary',
  'Public/Private Boundary',
  'legal/contract',
  'contract preferences',
  'contact strategy',
  'source strategy',
  'specific vacancies',
  'recruiter notes',
  'recruiter/contact notes',
  'internal decision criteria',
  'pay preferences',
  'active opportunities',
  'outreach strategy',
  'speeded up flow times',
  'socioligy',
];

const forbiddenDistFragments = [
  'AgentationToolbar',
  'agentation-dev-root',
  'PUBLIC_AGENTATION_ENABLED',
  'PUBLIC_AGENTATION_ENDPOINT',
  'localhost:4747',
];

const forbiddenMarkdownNoiseFragments = [
  'class=',
  'data-',
  '_astro',
  'device-mockup',
  'transition:name',
  'aria-hidden',
  'loading=',
  'fetchpriority=',
  '/media/gallery/screens/',
  '/media/gallery/flows/',
  '/media/cases/',
];

const readText = async (path) => readFile(new URL(path, contentRoot), 'utf8');

const assertIncludes = (label, source, fragment) => {
  if (!source.includes(fragment)) {
    throw new Error(`${label}: expected to include "${fragment}"`);
  }
};

const assertNotIncludes = (label, source, fragment) => {
  if (source.includes(fragment)) {
    throw new Error(`${label}: must not include private/internal fragment "${fragment}"`);
  }
};

const metaContent = (source, attribute, value) => {
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

const titleText = (source) => source.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;

const wordCount = (source) => source.trim().split(/\s+/).filter(Boolean).length;

const jsonLdItems = (source) => {
  const scripts = [...source.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`Invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};

const collectTextFiles = async (directory) => {
  const textExtensions = new Set(['.html', '.js', '.css', '.txt', '.md', '.json', '.xml']);
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      if (entry.isDirectory()) {
        return collectTextFiles(entryUrl);
      }
      const pathname = entryUrl.pathname.toLowerCase();
      return [...textExtensions].some((extension) => pathname.endsWith(extension)) ? [entryUrl] : [];
    }),
  );
  return nested.flat();
};

const assertEqual = (label, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${actual ?? 'missing'}"`);
  }
};

for (const file of requiredFiles) {
  const fileStat = await stat(new URL(file, contentRoot)).catch(() => null);
  if (!fileStat?.isFile()) {
    throw new Error(`${file} is missing from ${shouldReadSource ? 'public' : 'dist'}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(async (file) => [file, await readText(file)])));
const robotsTxt = await readText('robots.txt');
const sitemapXml = await readText('sitemap.xml');

if (!shouldReadSource) {
  for (const file of requiredFiles) {
    const publicContent = await readFile(new URL(`./public/${file}`, root), 'utf8');
    if (files[file] !== publicContent) {
      throw new Error(`${file}: dist content differs from public source; run npm run build after generating agent-readable files`);
    }
  }
}

const combinedPublicText = Object.entries(files)
  .map(([file, content]) => `\n# ${file}\n${content}`)
  .join('\n');
const llmsTxtLineCount = files['llms.txt'].trim().split(/\n/).length;

if (llmsTxtLineCount > 250) {
  throw new Error(`llms.txt: expected <= 250 lines, got ${llmsTxtLineCount}`);
}

for (const fact of expectedPublicFacts) {
  assertIncludes('agent-readable public content', combinedPublicText, fact);
}

for (const fragment of forbiddenPublicFragments) {
  assertNotIncludes('agent-readable public content', combinedPublicText, fragment);
}

for (const fragment of forbiddenMarkdownNoiseFragments) {
  assertNotIncludes('agent-readable public content', combinedPublicText, fragment);
}

assertIncludes('llms.txt', files['llms.txt'], 'https://vladhorovyy.com/agent-profile.md');
assertIncludes('llms.txt', files['llms.txt'], 'https://vladhorovyy.com/llms-full.txt');
assertIncludes('llms.txt', files['llms.txt'], 'https://vladhorovyy.com/fora.md');
assertIncludes('llms.txt', files['llms.txt'], 'https://vladhorovyy.com/kissa.md');
assertIncludes('llms.txt', files['llms.txt'], 'https://vladhorovyy.com/gallery.md');
assertIncludes('robots.txt', robotsTxt, 'https://vladhorovyy.com/llms.txt');
for (const file of requiredFiles) {
  assertIncludes('sitemap.xml', sitemapXml, `https://vladhorovyy.com/${file}`);
}
assertIncludes('llms-full.txt', files['llms-full.txt'], 'Founder/CEO-Ready Summary');
const llmsFullWordCount = wordCount(files['llms-full.txt']);
if (llmsFullWordCount < 1500 || llmsFullWordCount > 3000) {
  throw new Error(`llms-full.txt: expected 1500-3000 words, got ${llmsFullWordCount}`);
}
assertIncludes('agent-profile.md', files['agent-profile.md'], 'Vlad Horovyy');
assertIncludes('agent-profile.md', files['agent-profile.md'], 'Do not position Vladyslav as a frontend engineer');
assertIncludes('fora.md', files['fora.md'], 'rating from 3.0 to 4.6');
assertIncludes('kissa.md', files['kissa.md'], 'reduced flow time by 50%');
assertIncludes('kissa.md', files['kissa.md'], 'reduced tap error rate by 80%');
assertIncludes('gallery.md', files['gallery.md'], 'only when that is explicitly stated');

if (!shouldReadSource) {
  const distTextFiles = await collectTextFiles(contentRoot);
  for (const fileUrl of distTextFiles) {
    const content = await readFile(fileUrl, 'utf8').catch(() => '');
    for (const fragment of forbiddenDistFragments) {
      assertNotIncludes(fileUrl.pathname, content, fragment);
    }
  }

  const distPages = {
    home: {
      path: 'index.html',
      title: 'Vladyslav Horovyy - Product Designer',
      description:
        'Product designer from Kyiv crafting standout mobile apps with product thinking, visual craft, 3D, motion, and AI-assisted workflows.',
      jsonLdType: 'ProfilePage',
    },
    fora: {
      path: 'fora/index.html',
      title: 'Fora app redesign - Vladyslav Horovyy',
      description:
        'Fora grocery app redesign case study: rating improved from 3.0 to 4.6, revenue increased by 5%, and orders increased by 15%.',
      jsonLdType: 'CreativeWork',
    },
    kissa: {
      path: 'kissa/index.html',
      title: 'Kissa.AI self-checkout terminal redesign - Vladyslav Horovyy',
      description:
        'Kissa.AI self-checkout terminal redesign case study: faster flow, higher self-checkout adoption, and fewer tap errors.',
      jsonLdType: 'CreativeWork',
    },
    gallery: {
      path: 'gallery/index.html',
      title: 'Gallery - Vladyslav Horovyy',
      description:
        'Selected mobile interface, 3D, motion, and visual design experiments by product designer Vladyslav Horovyy.',
      jsonLdType: null,
    },
  };

  for (const [route, expected] of Object.entries(distPages)) {
    const page = await readFile(new URL(expected.path, contentRoot), 'utf8');
    for (const fragment of forbiddenPublicFragments) {
      assertNotIncludes(`${route} HTML`, page, fragment);
    }
    assertEqual(`${route} title`, titleText(page), expected.title);
    assertEqual(`${route} meta description`, metaContent(page, 'name', 'description'), expected.description);
    assertEqual(`${route} og:title`, metaContent(page, 'property', 'og:title'), expected.title);
    assertEqual(`${route} og:description`, metaContent(page, 'property', 'og:description'), expected.description);
    assertEqual(`${route} twitter:title`, metaContent(page, 'name', 'twitter:title'), expected.title);
    assertEqual(`${route} twitter:description`, metaContent(page, 'name', 'twitter:description'), expected.description);
    assertIncludes(`${route} head llms alternate`, page, 'rel="alternate" type="text/plain" href="https://vladhorovyy.com/llms.txt"');
    assertIncludes(
      `${route} head agent-profile alternate`,
      page,
      'rel="alternate" type="text/markdown" href="https://vladhorovyy.com/agent-profile.md"',
    );

    if (expected.jsonLdType) {
      const jsonLd = jsonLdItems(page);
      const item = jsonLd.find((current) => current['@type'] === expected.jsonLdType);
      if (!item) {
        throw new Error(`${route} JSON-LD: expected ${expected.jsonLdType}`);
      }
      assertEqual(`${route} JSON-LD context`, item['@context'], 'https://schema.org');

      if (expected.jsonLdType === 'ProfilePage') {
        assertEqual(`${route} JSON-LD name`, item.name, 'Vladyslav Horovyy');
        assertEqual(`${route} JSON-LD mainEntity.name`, item.mainEntity?.name, 'Vladyslav Horovyy');
        assertIncludes(`${route} JSON-LD knowsAbout`, JSON.stringify(item), 'mobile B2C app design');
      }

      if (expected.jsonLdType === 'CreativeWork') {
        assertEqual(`${route} JSON-LD headline`, item.headline, expected.title);
        assertEqual(`${route} JSON-LD abstract`, item.abstract, expected.description);
        assertEqual(`${route} JSON-LD author.name`, item.author?.name, 'Vladyslav Horovyy');
        assertEqual(`${route} JSON-LD mainEntityOfPage`, item.mainEntityOfPage, `https://vladhorovyy.com/${route}`);
        assertIncludes(`${route} JSON-LD keywords`, JSON.stringify(item.keywords), route === 'fora' ? 'mobile B2C app' : '0-to-1 product design');
        assertIncludes(`${route} JSON-LD about`, JSON.stringify(item.about), route === 'fora' ? 'craft-heavy product polish' : 'AI-enabled self-service');
      }
    }
  }
}

console.log(`Agent-readable ${shouldReadSource ? 'source' : 'dist'} contract looks good.`);
