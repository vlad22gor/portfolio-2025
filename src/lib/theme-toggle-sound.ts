type BaseLayerPreset = {
  attackMs: number;
  decayMs: number;
  filterFrequency: number;
  filterType: BiquadFilterType;
  gain: number;
  q: number;
};

type OscillatorLayerPreset = BaseLayerPreset & {
  source: 'oscillator';
  curve: Array<[number, number]>;
  oscillatorType: OscillatorType;
};

type NoiseLayerPreset = BaseLayerPreset & {
  source: 'noise';
};

type LayerPreset = OscillatorLayerPreset | NoiseLayerPreset;

type ThemeToggleSoundRuntime = {
  context: AudioContext | null;
  masterGain: GainNode | null;
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
const masterGainValue = 0.68;

// One realistic lamp-switch click:
// short noisy transient + compact mechanical body.
const togglePreset: LayerPreset[] = [
  {
    source: 'noise',
    filterType: 'bandpass',
    filterFrequency: 2800,
    q: 1.0,
    gain: 0.12,
    attackMs: 1,
    decayMs: 22,
  },
  {
    source: 'oscillator',
    oscillatorType: 'triangle',
    filterType: 'bandpass',
    filterFrequency: 1800,
    q: 1.2,
    gain: 0.058,
    attackMs: 1,
    decayMs: 16,
    curve: [
      [0, 2620],
      [16, 1660],
    ],
  },
  {
    source: 'oscillator',
    oscillatorType: 'triangle',
    filterType: 'lowpass',
    filterFrequency: 1000,
    q: 0.78,
    gain: 0.105,
    attackMs: 1,
    decayMs: 28,
    curve: [
      [0, 640],
      [28, 430],
    ],
  },
  {
    source: 'oscillator',
    oscillatorType: 'sine',
    filterType: 'lowpass',
    filterFrequency: 760,
    q: 0.64,
    gain: 0.046,
    attackMs: 1,
    decayMs: 36,
    curve: [
      [0, 330],
      [36, 248],
    ],
  },
];

const createRuntime = (): ThemeToggleSoundRuntime => ({
  context: null,
  masterGain: null,
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
      runtime.masterGain.gain.value = masterGainValue;
      runtime.masterGain.connect(runtime.context.destination);
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
  const gainHumanize = 0.97 + Math.random() * 0.12;
  const freqHumanize = 0.97 + Math.random() * 0.06;

  const filter = context.createBiquadFilter();
  filter.type = preset.filterType;
  filter.frequency.value = Math.max(80, preset.filterFrequency * freqHumanize);
  filter.Q.value = preset.q;

  const envelope = context.createGain();
  const attackSeconds = Math.max(0.001, preset.attackMs / 1000);
  const decaySeconds = Math.max(0.01, preset.decayMs / 1000);
  const stopAt = startAt + attackSeconds + decaySeconds + 0.03;

  envelope.gain.setValueAtTime(minGain, startAt);
  envelope.gain.linearRampToValueAtTime(Math.max(minGain, preset.gain * gainHumanize), startAt + attackSeconds);
  envelope.gain.exponentialRampToValueAtTime(minGain, startAt + attackSeconds + decaySeconds);

  let source: OscillatorNode | AudioBufferSourceNode | null = null;
  if (preset.source === 'oscillator') {
    if (preset.curve.length === 0) {
      return;
    }

    const oscillator = context.createOscillator();
    oscillator.type = preset.oscillatorType;
    oscillator.frequency.setValueAtTime(Math.max(16, preset.curve[0][1] * freqHumanize), startAt);
    for (let i = 1; i < preset.curve.length; i += 1) {
      const [timeMs, frequency] = preset.curve[i];
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(16, frequency * freqHumanize),
        startAt + timeMs / 1000,
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

  source.start(startAt);
  source.stop(stopAt);
  source.addEventListener('ended', () => {
    source?.disconnect();
    filter.disconnect();
    envelope.disconnect();
  });
};

const playThemeToggleSound = async () => {
  const runtime = getRuntime();
  if (!runtime) {
    return;
  }

  const context = await ensureContext(runtime);
  if (!context || !runtime.masterGain) {
    return;
  }

  const startAt = context.currentTime + 0.005;
  togglePreset.forEach((layer) => {
    scheduleLayer(context, runtime, runtime.masterGain as AudioNode, startAt, layer);
  });
};

export { installThemeToggleSoundRuntime, playThemeToggleSound };
