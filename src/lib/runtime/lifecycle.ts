export type Cleanup = () => void;

type RafHandle = number;
type TimeoutHandle = ReturnType<typeof globalThis.setTimeout>;
type IntervalHandle = ReturnType<typeof globalThis.setInterval>;

export interface Lifecycle {
  addCleanup: (cleanup: Cleanup) => Cleanup;
  on: (
    target: EventTarget | null | undefined,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ) => Cleanup;
  setTimeout: (callback: () => void, delayMs: number) => TimeoutHandle;
  clearTimeout: (handle: TimeoutHandle) => void;
  setInterval: (callback: () => void, delayMs: number) => IntervalHandle;
  clearInterval: (handle: IntervalHandle) => void;
  requestAnimationFrame: (callback: FrameRequestCallback) => RafHandle;
  cancelAnimationFrame: (handle: RafHandle) => void;
  trackObserver: <T extends { disconnect: () => void }>(observer: T | null | undefined) => T | null;
  onMediaQueryChange: (
    query: string | MediaQueryList,
    handler: (event: MediaQueryListEvent | MediaQueryList) => void,
  ) => Cleanup;
  onFontsLoadingDone: (handler: () => void) => Cleanup;
  dispose: () => void;
  isDisposed: () => boolean;
}

const rafFallbackMap = new Map<number, TimeoutHandle>();
let rafFallbackSeq = 0;

const requestRaf = (callback: FrameRequestCallback): RafHandle => {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }
  rafFallbackSeq += 1;
  const handle = rafFallbackSeq;
  const timeout = globalThis.setTimeout(() => {
    rafFallbackMap.delete(handle);
    callback(Date.now());
  }, 16);
  rafFallbackMap.set(handle, timeout);
  return handle;
};

const cancelRaf = (handle: RafHandle) => {
  if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(handle);
    return;
  }
  const timeout = rafFallbackMap.get(handle);
  if (timeout == null) {
    return;
  }
  globalThis.clearTimeout(timeout);
  rafFallbackMap.delete(handle);
};

export const createLifecycle = (): Lifecycle => {
  const cleanups = new Set<Cleanup>();
  const timeoutHandles = new Set<TimeoutHandle>();
  const intervalHandles = new Set<IntervalHandle>();
  const rafHandles = new Set<RafHandle>();
  let disposed = false;

  const addCleanup = (cleanup: Cleanup) => {
    if (disposed) {
      cleanup();
      return cleanup;
    }
    cleanups.add(cleanup);
    return cleanup;
  };

  const on: Lifecycle['on'] = (target, type, listener, options) => {
    if (!target) {
      return () => {};
    }

    target.addEventListener(type, listener, options);
    const off = () => {
      target.removeEventListener(type, listener, options);
    };
    addCleanup(off);
    return off;
  };

  const setTimeoutTracked: Lifecycle['setTimeout'] = (callback, delayMs) => {
    const handle = globalThis.setTimeout(() => {
      timeoutHandles.delete(handle);
      callback();
    }, delayMs);
    timeoutHandles.add(handle);
    return handle;
  };

  const clearTimeoutTracked: Lifecycle['clearTimeout'] = (handle) => {
    globalThis.clearTimeout(handle);
    timeoutHandles.delete(handle);
  };

  const setIntervalTracked: Lifecycle['setInterval'] = (callback, delayMs) => {
    const handle = globalThis.setInterval(callback, delayMs);
    intervalHandles.add(handle);
    return handle;
  };

  const clearIntervalTracked: Lifecycle['clearInterval'] = (handle) => {
    globalThis.clearInterval(handle);
    intervalHandles.delete(handle);
  };

  const requestAnimationFrameTracked: Lifecycle['requestAnimationFrame'] = (callback) => {
    const handle = requestRaf((timestamp) => {
      rafHandles.delete(handle);
      callback(timestamp);
    });
    rafHandles.add(handle);
    return handle;
  };

  const cancelAnimationFrameTracked: Lifecycle['cancelAnimationFrame'] = (handle) => {
    cancelRaf(handle);
    rafHandles.delete(handle);
  };

  const trackObserver: Lifecycle['trackObserver'] = (observer) => {
    if (!observer) {
      return null;
    }
    addCleanup(() => observer.disconnect());
    return observer;
  };

  const onMediaQueryChange: Lifecycle['onMediaQueryChange'] = (query, handler) => {
    const mediaQuery =
      typeof query === 'string'
        ? typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia(query)
          : null
        : query;

    if (!mediaQuery) {
      return () => {};
    }

    const listener = (event: MediaQueryListEvent) => {
      handler(event);
    };

    let remove: Cleanup;
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
      remove = () => {
        mediaQuery.removeEventListener('change', listener);
      };
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(listener);
      remove = () => {
        mediaQuery.removeListener(listener);
      };
    } else {
      remove = () => {};
    }

    addCleanup(remove);
    return remove;
  };

  const onFontsLoadingDone: Lifecycle['onFontsLoadingDone'] = (handler) => {
    if (typeof document === 'undefined' || !document.fonts) {
      return () => {};
    }

    let cancelled = false;
    const fonts = document.fonts;
    let removeEventListener: Cleanup = () => {};

    fonts.ready
      .then(() => {
        if (!cancelled) {
          handler();
        }
      })
      .catch(() => {
        // Ignore font loading promise errors to keep runtime stable.
      });

    if (typeof fonts.addEventListener === 'function') {
      const onDone = () => {
        if (!cancelled) {
          handler();
        }
      };
      fonts.addEventListener('loadingdone', onDone);
      removeEventListener = () => {
        fonts.removeEventListener('loadingdone', onDone);
      };
    }

    const cleanup = () => {
      cancelled = true;
      removeEventListener();
    };
    addCleanup(cleanup);
    return cleanup;
  };

  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;

    for (const handle of timeoutHandles) {
      globalThis.clearTimeout(handle);
    }
    timeoutHandles.clear();

    for (const handle of intervalHandles) {
      globalThis.clearInterval(handle);
    }
    intervalHandles.clear();

    for (const handle of rafHandles) {
      cancelRaf(handle);
    }
    rafHandles.clear();

    for (const cleanup of cleanups) {
      cleanup();
    }
    cleanups.clear();
  };

  const isDisposed = () => disposed;

  return {
    addCleanup,
    on,
    setTimeout: setTimeoutTracked,
    clearTimeout: clearTimeoutTracked,
    setInterval: setIntervalTracked,
    clearInterval: clearIntervalTracked,
    requestAnimationFrame: requestAnimationFrameTracked,
    cancelAnimationFrame: cancelAnimationFrameTracked,
    trackObserver,
    onMediaQueryChange,
    onFontsLoadingDone,
    dispose,
    isDisposed,
  };
};
