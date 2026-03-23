import { WebHaptics } from 'web-haptics';
import type { HapticInput } from 'web-haptics';

type HapticsRuntime = {
  instance: WebHaptics | null;
};

declare global {
  interface Window {
    __webHapticsRuntime?: HapticsRuntime;
  }
}

const runtimeKey = '__webHapticsRuntime';

const createRuntime = (): HapticsRuntime => ({
  instance: null,
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
  if (!runtime) {
    return null;
  }

  if (runtime.instance) {
    return runtime.instance;
  }

  try {
    runtime.instance = new WebHaptics();
  } catch {
    runtime.instance = null;
  }

  return runtime.instance;
};

const isDevelopment = import.meta.env.DEV;

type HapticPath = 'vibrate' | 'switch-fallback' | 'unsupported';

const logHapticPath = (path: HapticPath) => {
  if (!isDevelopment || typeof console === 'undefined') {
    return;
  }
  console.debug(`[haptics] path=${path}`);
};

const canUseVibrationApi = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const canUseSwitchFallback = () =>
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

const triggerSwitchFallback = () => {
  if (!canUseSwitchFallback()) {
    return false;
  }

  const container = document.body ?? document.documentElement;
  if (!container) {
    return false;
  }

  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  label.dataset.hapticsSwitchFallback = 'true';
  label.style.position = 'fixed';
  label.style.left = '0';
  label.style.bottom = '0';
  label.style.width = '1px';
  label.style.height = '1px';
  label.style.opacity = '0';
  label.style.pointerEvents = 'none';
  label.style.overflow = 'hidden';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  label.appendChild(input);

  container.appendChild(label);

  try {
    label.click();
    return true;
  } finally {
    label.remove();
  }
};

const installHapticsRuntime = () => {
  void ensureInstance();
};

const playHaptic = async (pattern: HapticInput = 'medium') => {
  if (!canUseVibrationApi()) {
    try {
      const triggered = triggerSwitchFallback();
      logHapticPath(triggered ? 'switch-fallback' : 'unsupported');
    } catch {
      logHapticPath('unsupported');
    }
    return;
  }

  const instance = ensureInstance();
  if (!instance) {
    logHapticPath('unsupported');
    return;
  }

  try {
    await instance.trigger(pattern);
    logHapticPath('vibrate');
  } catch {
    // Keep haptics non-blocking for core interactions.
    logHapticPath('unsupported');
  }
};

const playLightTapHaptic = async () => {
  await playHaptic('light');
};

export { installHapticsRuntime, playHaptic, playLightTapHaptic };
