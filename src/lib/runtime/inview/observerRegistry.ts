export type ObserverStop = () => void;

export interface InViewObserverRegistry {
  register: (element: Element, stop: ObserverStop) => void;
  cleanupDisconnected: () => void;
  stopAll: () => void;
}

export const createObserverRegistry = (): InViewObserverRegistry => {
  const observers = new Map<Element, ObserverStop>();

  const register = (element: Element, stop: ObserverStop) => {
    const existingStop = observers.get(element);
    if (typeof existingStop === 'function') {
      existingStop();
    }
    observers.set(element, stop);
  };

  const cleanupDisconnected = () => {
    for (const [element, stop] of observers.entries()) {
      if (document.contains(element)) {
        continue;
      }
      stop();
      observers.delete(element);
    }
  };

  const stopAll = () => {
    observers.forEach((stop) => stop());
    observers.clear();
  };

  return {
    register,
    cleanupDisconnected,
    stopAll,
  };
};
