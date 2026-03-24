export interface RafScheduler {
  schedule: () => void;
  cancel: () => void;
  isScheduled: () => boolean;
}

export interface RafLoop {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
}

const requestRaf = (callback: FrameRequestCallback) => {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback);
  }
  return globalThis.setTimeout(() => callback(Date.now()), 16) as unknown as number;
};

const cancelRaf = (handle: number) => {
  if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(handle);
    return;
  }
  globalThis.clearTimeout(handle);
};

export const createRafScheduler = (task: () => void): RafScheduler => {
  let rafId = 0;

  const run = () => {
    rafId = 0;
    task();
  };

  return {
    schedule() {
      if (rafId !== 0) {
        return;
      }
      rafId = requestRaf(run);
    },
    cancel() {
      if (rafId === 0) {
        return;
      }
      cancelRaf(rafId);
      rafId = 0;
    },
    isScheduled() {
      return rafId !== 0;
    },
  };
};

export const createRafLoop = (step: (deltaMs: number, timestamp: number) => boolean | void): RafLoop => {
  let rafId = 0;
  let lastTs = 0;

  const tick = (timestamp: number) => {
    if (rafId === 0) {
      return;
    }
    const deltaMs = lastTs > 0 ? timestamp - lastTs : 16.67;
    lastTs = timestamp;
    const keepRunning = step(deltaMs, timestamp);
    if (keepRunning === false) {
      rafId = 0;
      lastTs = 0;
      return;
    }
    rafId = requestRaf(tick);
  };

  return {
    start() {
      if (rafId !== 0) {
        return;
      }
      lastTs = 0;
      rafId = requestRaf(tick);
    },
    stop() {
      if (rafId === 0) {
        return;
      }
      cancelRaf(rafId);
      rafId = 0;
      lastTs = 0;
    },
    isRunning() {
      return rafId !== 0;
    },
  };
};

type Debounced<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

export const createDebounce = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number,
): Debounced<TArgs> => {
  const safeDelay = Math.max(0, Number.isFinite(delayMs) ? delayMs : 0);
  let timeoutHandle: ReturnType<typeof globalThis.setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const cancel = () => {
    if (timeoutHandle == null) {
      return;
    }
    globalThis.clearTimeout(timeoutHandle);
    timeoutHandle = null;
  };

  const flush = () => {
    if (!lastArgs) {
      cancel();
      return;
    }
    const args = lastArgs;
    lastArgs = null;
    cancel();
    fn(...args);
  };

  const debounced = ((...args: TArgs) => {
    lastArgs = args;
    cancel();
    timeoutHandle = globalThis.setTimeout(() => {
      flush();
    }, safeDelay);
  }) as Debounced<TArgs>;

  debounced.cancel = () => {
    lastArgs = null;
    cancel();
  };
  debounced.flush = flush;
  debounced.pending = () => timeoutHandle != null;

  return debounced;
};
