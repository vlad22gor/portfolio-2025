type WindowStore = Window & Record<string, unknown>;

const hasWindow = () => typeof window !== 'undefined';

export const getWindowRuntime = <T>(key: string): T | null => {
  if (!hasWindow()) {
    return null;
  }
  const value = (window as WindowStore)[key];
  return (value ?? null) as T | null;
};

export const getOrCreateWindowRuntime = <T>(key: string, factory: () => T): T | null => {
  if (!hasWindow()) {
    return null;
  }

  const store = window as WindowStore;
  if (store[key] == null) {
    store[key] = factory();
  }

  return store[key] as T;
};
