import { buttonClickPreset, themeTogglePreset } from './presets';
import type { LayerPreset } from './presets';

type ThemeToggleSoundRuntime = {
  context: AudioContext | null;
  masterGain: GainNode | null;
  compressor: DynamicsCompressorNode | null;
  noiseBuffer: AudioBuffer | null;
  supported: boolean;
  isPrimed: boolean;
  prewarmBound: boolean;
  needsExtendedLeadTime: boolean;
  warmupPromise: Promise<void> | null;
};

declare global {
  interface Window {
    __themeToggleSoundRuntime?: ThemeToggleSoundRuntime;
    webkitAudioContext?: typeof AudioContext;
  }
}

const runtimeKey = '__themeToggleSoundRuntime';
const minGain = 0.0001;
const masterGainValue = 0.38;
const defaultLeadTimeSeconds = 0.006;
const extendedLeadTimeSeconds = 0.026;
const warmupDurationSeconds = 0.024;

const createRuntime = (): ThemeToggleSoundRuntime => ({
  context: null,
  masterGain: null,
  compressor: null,
  noiseBuffer: null,
  supported: typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext) != null,
  isPrimed: false,
  prewarmBound: false,
  needsExtendedLeadTime: false,
  warmupPromise: null,
});

const installThemeToggleSoundRuntime = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window[runtimeKey]) {
    window[runtimeKey] = createRuntime();
  }

  const runtime = window[runtimeKey];
  if (!runtime || runtime.prewarmBound) {
    return;
  }

  runtime.prewarmBound = true;

  const unbindPrewarm = () => {
    document.removeEventListener('pointerdown', onFirstGesture, prewarmOptions);
    document.removeEventListener('touchstart', onFirstGesture, prewarmOptions);
    document.removeEventListener('keydown', onFirstGesture, prewarmKeydownOptions);
  };

  const onFirstGesture = () => {
    unbindPrewarm();
    void primeSoundRuntime();
  };

  const prewarmOptions: AddEventListenerOptions = {
    capture: true,
    passive: true,
  };
  const prewarmKeydownOptions: AddEventListenerOptions = {
    capture: true,
  };

  document.addEventListener('pointerdown', onFirstGesture, prewarmOptions);
  document.addEventListener('touchstart', onFirstGesture, prewarmOptions);
  document.addEventListener('keydown', onFirstGesture, prewarmKeydownOptions);
};

const getRuntime = (): ThemeToggleSoundRuntime | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  installThemeToggleSoundRuntime();
  return window[runtimeKey] ?? null;
};

const ensureContext = async (runtime: ThemeToggleSoundRuntime): Promise<AudioContext | null> => {
  if (!runtime.supported) {
    return null;
  }

  if (runtime.context?.state === 'closed') {
    runtime.context = null;
    runtime.masterGain = null;
    runtime.compressor = null;
    runtime.noiseBuffer = null;
    runtime.isPrimed = false;
    runtime.needsExtendedLeadTime = true;
  }

  let didCreateContext = false;
  let didResumeContext = false;

  if (!runtime.context) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      runtime.supported = false;
      return null;
    }

    try {
      runtime.context = new AudioContextCtor();
      runtime.masterGain = runtime.context.createGain();
      runtime.compressor = runtime.context.createDynamicsCompressor();
      runtime.masterGain.gain.value = masterGainValue;
      runtime.compressor.threshold.value = -22;
      runtime.compressor.knee.value = 18;
      runtime.compressor.ratio.value = 3.5;
      runtime.compressor.attack.value = 0.002;
      runtime.compressor.release.value = 0.07;
      runtime.masterGain.connect(runtime.compressor);
      runtime.compressor.connect(runtime.context.destination);
      didCreateContext = true;
    } catch {
      return null;
    }
  }

  if (runtime.context.state === 'suspended') {
    try {
      await runtime.context.resume();
      didResumeContext = true;
    } catch {
      return null;
    }
  }

  if (didCreateContext || didResumeContext) {
    runtime.needsExtendedLeadTime = true;
  }

  return runtime.context;
};

const runSilentWarmup = (context: AudioContext, destination: AudioNode) =>
  new Promise<void>((resolve) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime + 0.001;
    const stopAt = startAt + warmupDurationSeconds;

    gain.gain.setValueAtTime(minGain, startAt);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, startAt);

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
      resolve();
    });

    oscillator.start(startAt);
    oscillator.stop(stopAt);
  });

const primeSoundRuntime = async () => {
  const runtime = getRuntime();
  if (!runtime || runtime.isPrimed) {
    return;
  }

  if (runtime.warmupPromise) {
    await runtime.warmupPromise;
    return;
  }

  runtime.warmupPromise = (async () => {
    const context = await ensureContext(runtime);
    if (!context || !runtime.masterGain) {
      return;
    }

    await runSilentWarmup(context, runtime.masterGain as AudioNode);
    runtime.isPrimed = true;
    runtime.needsExtendedLeadTime = false;
  })().finally(() => {
    runtime.warmupPromise = null;
  });

  await runtime.warmupPromise;
};

const getNoiseBuffer = (context: AudioContext, runtime: ThemeToggleSoundRuntime) => {
  if (runtime.noiseBuffer && runtime.noiseBuffer.sampleRate === context.sampleRate) {
    return runtime.noiseBuffer;
  }

  const durationSeconds = 0.09;
  const length = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }

  runtime.noiseBuffer = buffer;
  return buffer;
};

const scheduleLayer = (
  context: AudioContext,
  runtime: ThemeToggleSoundRuntime,
  destination: AudioNode,
  startAt: number,
  preset: LayerPreset,
) => {
  const gainHumanize = 0.985 + Math.random() * 0.04;
  const freqHumanize = 0.985 + Math.random() * 0.03;
  const layerStartAt = startAt + Math.max(0, (preset.startOffsetMs ?? 0) / 1000);

  const filter = context.createBiquadFilter();
  filter.type = preset.filterType;
  filter.frequency.value = Math.max(80, preset.filterFrequency * freqHumanize);
  filter.Q.value = preset.q;

  const envelope = context.createGain();
  const attackSeconds = Math.max(0.001, preset.attackMs / 1000);
  const decaySeconds = Math.max(0.01, preset.decayMs / 1000);
  const stopAt = layerStartAt + attackSeconds + decaySeconds + 0.03;

  envelope.gain.setValueAtTime(minGain, layerStartAt);
  envelope.gain.linearRampToValueAtTime(
    Math.max(minGain, preset.gain * gainHumanize),
    layerStartAt + attackSeconds,
  );
  envelope.gain.exponentialRampToValueAtTime(minGain, layerStartAt + attackSeconds + decaySeconds);

  let source: OscillatorNode | AudioBufferSourceNode | null = null;
  if (preset.source === 'oscillator') {
    if (preset.curve.length === 0) {
      return;
    }

    const oscillator = context.createOscillator();
    oscillator.type = preset.oscillatorType;
    oscillator.frequency.setValueAtTime(Math.max(16, preset.curve[0][1] * freqHumanize), layerStartAt);
    for (let i = 1; i < preset.curve.length; i += 1) {
      const [timeMs, frequency] = preset.curve[i];
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(16, frequency * freqHumanize),
        layerStartAt + timeMs / 1000,
      );
    }
    source = oscillator;
  } else {
    const noise = context.createBufferSource();
    noise.buffer = getNoiseBuffer(context, runtime);
    noise.loop = false;
    source = noise;
  }

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(destination);

  source.start(layerStartAt);
  source.stop(stopAt);
  source.addEventListener('ended', () => {
    source?.disconnect();
    filter.disconnect();
    envelope.disconnect();
  });
};

const playPreset = async (preset: LayerPreset[]) => {
  const runtime = getRuntime();
  if (!runtime) {
    return;
  }

  const context = await ensureContext(runtime);
  if (!context || !runtime.masterGain) {
    return;
  }

  const leadTime = runtime.needsExtendedLeadTime || !runtime.isPrimed ? extendedLeadTimeSeconds : defaultLeadTimeSeconds;
  const startAt = context.currentTime + leadTime;
  runtime.needsExtendedLeadTime = false;
  runtime.isPrimed = true;
  preset.forEach((layer) => {
    scheduleLayer(context, runtime, runtime.masterGain as AudioNode, startAt, layer);
  });
};

const playThemeToggleSound = async () => {
  await playPreset(themeTogglePreset);
};

const playButtonClickSound = async () => {
  await playPreset(buttonClickPreset);
};

export { installThemeToggleSoundRuntime, playThemeToggleSound, playButtonClickSound };
