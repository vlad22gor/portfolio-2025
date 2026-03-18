import type { CaseDetailSection } from './case-details';
import { getCaseDetailConfig } from './case-details';
import { GALLERY_ROWS, type GalleryRowItem } from './gallery';

export type CriticalMediaKind = 'image' | 'video' | 'poster' | 'shell';

export interface CriticalMediaAsset {
  href: string;
  kind: CriticalMediaKind;
}

export type CriticalRouteId = 'home' | 'cases' | 'gallery' | 'fora' | 'kissa';

type GalleryDeviceCard = Extract<GalleryRowItem, { type: 'phone' | 'tablet' }>;

const PHONE_SHELL_SRC = '/media/gallery/device-shells/phone-shell.webp';
const TABLET_SHELL_SRC = '/media/gallery/device-shells/tablet-shell.webp';

const toUniqueAssets = (assets: CriticalMediaAsset[]): CriticalMediaAsset[] => {
  const seen = new Set<string>();
  const result: CriticalMediaAsset[] = [];

  for (const asset of assets) {
    if (!asset.href || asset.href.length === 0) {
      continue;
    }
    const key = `${asset.kind}|${asset.href}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(asset);
  }

  return result;
};

const getShellSrcByDevice = (device: GalleryDeviceCard['type']) =>
  device === 'tablet' ? TABLET_SHELL_SRC : PHONE_SHELL_SRC;

const isGalleryDeviceCard = (item: GalleryRowItem): item is GalleryDeviceCard =>
  item.type === 'phone' || item.type === 'tablet';

const buildGalleryCriticalAssets = (): CriticalMediaAsset[] => {
  const assets: CriticalMediaAsset[] = [];

  for (const [rowIndex, row] of GALLERY_ROWS.entries()) {
    if (rowIndex > 1) {
      continue;
    }

    for (const item of row.items) {
      if (!isGalleryDeviceCard(item)) {
        continue;
      }

      assets.push({ href: getShellSrcByDevice(item.type), kind: 'shell' });

      if (item.screen.kind === 'video') {
        assets.push({ href: item.screen.src, kind: 'video' });
        if (item.screen.poster) {
          assets.push({ href: item.screen.poster, kind: 'poster' });
        }
      } else {
        assets.push({ href: item.screen.src, kind: 'image' });
      }
    }
  }

  return toUniqueAssets(assets);
};

const collectCaseSectionCriticalAssets = (section: CaseDetailSection): CriticalMediaAsset[] => {
  if (section.type === 'introScreens') {
    const shellSrc = section.variant === 'tablet' ? TABLET_SHELL_SRC : PHONE_SHELL_SRC;
    return toUniqueAssets([
      { href: shellSrc, kind: 'shell' },
      ...section.screens.map((screen) => ({ href: screen.src, kind: 'image' as const })),
    ]);
  }

  if (section.type === 'challenge') {
    const shellSrc = section.data.device === 'tablet' ? TABLET_SHELL_SRC : PHONE_SHELL_SRC;
    return [
      { href: shellSrc, kind: 'shell' },
      { href: section.data.screen.src, kind: 'image' },
    ];
  }

  return [];
};

const buildCaseDetailCriticalAssets = (slug: 'fora' | 'kissa'): CriticalMediaAsset[] => {
  const config = getCaseDetailConfig(slug);
  if (!config) {
    return [];
  }

  return toUniqueAssets(config.sections.flatMap((section) => collectCaseSectionCriticalAssets(section)));
};

const CRITICAL_MEDIA_BY_ROUTE: Record<CriticalRouteId, CriticalMediaAsset[]> = {
  home: [],
  cases: [],
  gallery: buildGalleryCriticalAssets(),
  fora: buildCaseDetailCriticalAssets('fora'),
  kissa: buildCaseDetailCriticalAssets('kissa'),
};

export const CRITICAL_ROUTE_IDS: CriticalRouteId[] = ['home', 'cases', 'gallery', 'fora', 'kissa'];

export function getCriticalMediaForRoute(routeId: CriticalRouteId): CriticalMediaAsset[] {
  return [...CRITICAL_MEDIA_BY_ROUTE[routeId]];
}

export function getCriticalMediaByRoute(): Record<CriticalRouteId, CriticalMediaAsset[]> {
  return CRITICAL_ROUTE_IDS.reduce((acc, routeId) => {
    acc[routeId] = getCriticalMediaForRoute(routeId);
    return acc;
  }, {} as Record<CriticalRouteId, CriticalMediaAsset[]>);
}

export function getAllCriticalMedia(): CriticalMediaAsset[] {
  return toUniqueAssets(CRITICAL_ROUTE_IDS.flatMap((routeId) => getCriticalMediaForRoute(routeId)));
}

const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === '/') {
    return '/';
  }
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

export function resolveCriticalRouteIdFromPath(pathname: string): CriticalRouteId {
  const normalized = normalizePathname(pathname);
  if (normalized === '/gallery') {
    return 'gallery';
  }
  if (normalized === '/cases') {
    return 'cases';
  }
  if (normalized === '/fora') {
    return 'fora';
  }
  if (normalized === '/kissa') {
    return 'kissa';
  }
  return 'home';
}
