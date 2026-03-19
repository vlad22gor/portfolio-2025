import { buttonClickPreset, themeTogglePreset } from './presets';
import type { LayerPreset } from './presets';

type ThemeToggleSoundRuntime = {
  context: AudioContext | null;
  masterGain: GainNode | null;
  compressor: DynamicsCompressorNode | null;
  noiseBuffer: AudioBuffer | null;
  supported: boolean;
};

declare global {
  interface Window {
    __themeToggleSoundRuntime?: ThemeToggleSoundRuntime;
    webkitAudioContext?: typeof AudioContext;
  }
}

const runtimeKey = '__themeToggleSoundRuntime';
const minGain = 0.0001;
const masterGainValue = 0.52;

const createRuntime = (): ThemeToggleSoundRuntime => ({
  context: null,
  masterGain: null,
  compressor: null,
  noiseBuffer: null,
  supported: typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext) != null,
});

const installThemeToggleSoundRuntime = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window[runtimeKey]) {
    window[runtimeKey] = createRuntime();
  }
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
  }

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
    } catch {
      return null;
    }
  }

  if (runtime.context.state === 'suspended') {
    try {
      await runtime.context.resume();
    } catch {
      return null;
    }
  }

  return runtime.context;
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

  const startAt = context.currentTime + 0.005;
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
