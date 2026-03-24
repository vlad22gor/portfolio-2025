export interface RouteFlags {
  pathname: string;
  isHomeRoute: boolean;
  isCasesRoute: boolean;
  isGalleryRoute: boolean;
  isCaseDetailRoute: boolean;
}

export type AstroBeforeSwapEvent = Event & {
  newDocument?: Document;
};

const hasDocument = () => typeof document !== 'undefined';
const hasWindow = () => typeof window !== 'undefined';

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/';
  }
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const readRouteDatasetFlag = (key: keyof DOMStringMap) => {
  if (!hasDocument()) {
    return false;
  }
  return document.body?.dataset?.[key] === 'true';
};

export const getRouteFlags = (): RouteFlags => {
  const pathname = normalizePathname(hasWindow() ? window.location.pathname : '/');
  const isHomeRoute = readRouteDatasetFlag('routeHome') || pathname === '/';
  const isCasesRoute = readRouteDatasetFlag('routeCases') || pathname === '/cases';
  const isGalleryRoute = readRouteDatasetFlag('routeGallery') || pathname === '/gallery';
  const isCaseDetailRoute =
    readRouteDatasetFlag('routeCaseDetail') || pathname === '/fora' || pathname === '/kissa';

  return {
    pathname,
    isHomeRoute,
    isCasesRoute,
    isGalleryRoute,
    isCaseDetailRoute,
  };
};

export const onAstroPageLoad = (handler: () => void) => {
  if (!hasDocument()) {
    return () => {};
  }
  const listener = () => handler();
  document.addEventListener('astro:page-load', listener);
  return () => {
    document.removeEventListener('astro:page-load', listener);
  };
};

export const onAstroBeforeSwap = (handler: (event: AstroBeforeSwapEvent) => void) => {
  if (!hasDocument()) {
    return () => {};
  }
  const listener = (event: Event) => {
    handler(event as AstroBeforeSwapEvent);
  };
  document.addEventListener('astro:before-swap', listener);
  return () => {
    document.removeEventListener('astro:before-swap', listener);
  };
};

export const onDomReady = (handler: () => void) => {
  if (!hasDocument()) {
    return () => {};
  }

  if (document.readyState === 'loading') {
    let active = true;
    const listener = () => {
      if (!active) {
        return;
      }
      active = false;
      handler();
    };
    document.addEventListener('DOMContentLoaded', listener, { once: true });
    return () => {
      active = false;
      document.removeEventListener('DOMContentLoaded', listener);
    };
  }

  handler();
  return () => {};
};
