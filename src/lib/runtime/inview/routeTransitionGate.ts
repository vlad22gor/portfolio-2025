export const CASE_SWITCHER_INTRO_SYNC_MARKER_KEY = '__case-switcher-intro-sync';
export const ROUTE_TRANSITION_ATTRIBUTE = 'data-astro-transition';

export interface RouteTransitionGate {
  hasFreshIntroSyncMarker: () => boolean;
  clearIntroSyncMarker: () => void;
  waitForRouteTransitionEnd: () => Promise<void>;
  shouldAwaitCaseSwitcherIntro: (target: EventTarget | null, prefersReducedMotion: boolean) => boolean;
}

export interface CreateRouteTransitionGateOptions {
  markerMaxAgeMs?: number;
  transitionWaitMaxMs?: number;
  transitionStartWaitMaxMs?: number;
  transitionInactiveStableMs?: number;
}

export const createRouteTransitionGate = (
  options: CreateRouteTransitionGateOptions = {},
): RouteTransitionGate => {
  const markerMaxAgeMs = options.markerMaxAgeMs ?? 5000;
  const transitionWaitMaxMs = options.transitionWaitMaxMs ?? 1500;
  const transitionStartWaitMaxMs = options.transitionStartWaitMaxMs ?? 250;
  const transitionInactiveStableMs = options.transitionInactiveStableMs ?? 80;

  const clearIntroSyncMarker = () => {
    try {
      window.sessionStorage.removeItem(CASE_SWITCHER_INTRO_SYNC_MARKER_KEY);
    } catch {
      // Ignore storage access errors.
    }
  };

  const hasFreshIntroSyncMarker = () => {
    try {
      const raw = window.sessionStorage.getItem(CASE_SWITCHER_INTRO_SYNC_MARKER_KEY);
      if (!raw) {
        return false;
      }
      const timestamp = Number.parseInt(raw, 10);
      if (!Number.isFinite(timestamp)) {
        clearIntroSyncMarker();
        return false;
      }
      if (Date.now() - timestamp > markerMaxAgeMs) {
        clearIntroSyncMarker();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const waitForRouteTransitionEnd = () =>
    new Promise<void>((resolve) => {
      const startedAt = performance.now();
      let sawActiveTransition = document.documentElement.hasAttribute(ROUTE_TRANSITION_ATTRIBUTE);
      let inactiveSince: number | null = sawActiveTransition ? null : startedAt;

      const poll = () => {
        const transitionActive = document.documentElement.hasAttribute(ROUTE_TRANSITION_ATTRIBUTE);
        if (transitionActive) {
          sawActiveTransition = true;
          inactiveSince = null;
        } else if (inactiveSince === null) {
          inactiveSince = performance.now();
        }

        const now = performance.now();
        const elapsed = now - startedAt;
        const reachedGlobalTimeout = elapsed >= transitionWaitMaxMs;

        if (sawActiveTransition) {
          const stableInactive = inactiveSince !== null && now - inactiveSince >= transitionInactiveStableMs;
          if (stableInactive || reachedGlobalTimeout) {
            resolve();
            return;
          }
        } else if (elapsed >= transitionStartWaitMaxMs || reachedGlobalTimeout) {
          resolve();
          return;
        }

        window.requestAnimationFrame(poll);
      };

      window.requestAnimationFrame(poll);
    });

  const shouldAwaitCaseSwitcherIntro = (target: EventTarget | null, prefersReducedMotion: boolean) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    if (target.dataset.motionAwaitRouteTransition !== 'case-switcher-intro') {
      return false;
    }
    if (prefersReducedMotion) {
      return false;
    }
    return hasFreshIntroSyncMarker();
  };

  return {
    hasFreshIntroSyncMarker,
    clearIntroSyncMarker,
    waitForRouteTransitionEnd,
    shouldAwaitCaseSwitcherIntro,
  };
};
