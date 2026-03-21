import { WebHaptics } from 'web-haptics';
import type { HapticInput } from 'web-haptics';

type HapticsRuntime = {
  instance: WebHaptics | null;
  supported: boolean;
};

declare global {
  interface Window {
    __webHapticsRuntime?: HapticsRuntime;
  }
}

const runtimeKey = '__webHapticsRuntime';

const createRuntime = (): HapticsRuntime => ({
  instance: null,
  supported: typeof window !== 'undefined' && WebHaptics.isSupported,
});

const getRuntime = (): HapticsRuntime | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window[runtimeKey]) {
    window[runtimeKey] = createRuntime();
  }

  return window[runtimeKey] ?? null;
};

const ensureInstance = (): WebHaptics | null => {
  const runtime = getRuntime();
  if (!runtime || !runtime.supported) {
    return null;
  }

  if (runtime.instance) {
    return runtime.instance;
  }

  try {
    runtime.instance = new WebHaptics();
  } catch {
    runtime.instance = null;
    runtime.supported = false;
  }

  return runtime.instance;
};

const installHapticsRuntime = () => {
  void ensureInstance();
};

const playHaptic = async (pattern: HapticInput = 'medium') => {
  const instance = ensureInstance();
  if (!instance) {
    return;
  }

  try {
    await instance.trigger(pattern);
  } catch {
    // Keep haptics non-blocking for core interactions.
  }
};

const playLightTapHaptic = async () => {
  await playHaptic('light');
};

export { installHapticsRuntime, playHaptic, playLightTapHaptic };
