# Portfolio 2025 Vibecode

Astro + Tailwind static portfolio scaffold for migration from Framer.

## Stack
- Astro (SSG)
- Tailwind CSS v4
- GitHub Pages via GitHub Actions

## Route contract
- `/`
- `/cases`
- `/gallery`
- `/fora`
- `/kissa`

## Local development
```bash
npm install
npm run dev
```

`npm run dev` автоматически запускает генерацию постеров из `flows/*.webm` в `posters/*.png`.

### Agentation (dev-only)
```bash
# 1) Start Agentation MCP server in another terminal
npx -y agentation-mcp server

# 2) Run Astro with Agentation toolbar enabled
npm run dev:annotate
```

Env contract:
- `PUBLIC_AGENTATION_ENABLED` (default `false`)
- `PUBLIC_AGENTATION_ENDPOINT` (default `http://localhost:4747`)

Dev helper:
- `Alt + Shift + B` toggles Agentation `Block page interactions` for faster UX checks.

## Production build
```bash
npm run build
npm run preview
```

## Media poster pipeline
- Generate (локально / predev / prebuild):
```bash
npm run generate:posters
```
- Verify (CI gate):
```bash
npm run verify:posters
```

## Smoke tests
```bash
npm run test:smoke
```

## Deployment
- Workflow: `.github/workflows/deploy.yml`
- Branch trigger: `main`
- Artifact: `dist/`
- Custom domain: `public/CNAME`

## Engineering notes
- Client Router stability playbook: `docs/astro-client-router-stability.md`
- Scallop shape requirements: `docs/scallop-shape-requirements.md`

## Content model
Case content is centralized in `src/data/cases.ts` and reused by:
- case cards
- dynamic case pages (`src/pages/[slug].astro`)

Case detail composition (data-driven) lives in:
- `src/data/case-details/<slug>.ts`
- renderer: `src/components/case-details/CaseDetailSections.astro`

## Media strategy
- Current placeholders live in `public/media/`
- Replace placeholders with optimized assets (WebP/AVIF preferred)
- Keep heavy media under explicit performance budgets

## Cloudflare switch trigger
Stay on GitHub Pages by default. Reconsider Cloudflare Pages when:
- you consistently approach GitHub Pages traffic/build soft limits
- you need edge logic (Functions/Workers)
- you need stricter global caching/perf control
