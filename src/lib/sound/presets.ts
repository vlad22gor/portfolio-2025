type BaseLayerPreset = {
  attackMs: number;
  decayMs: number;
  filterFrequency: number;
  filterType: BiquadFilterType;
  gain: number;
  q: number;
  startOffsetMs?: number;
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

// One realistic lamp-switch click:
// short noisy transient + compact mechanical body.
const themeTogglePreset: LayerPreset[] = [
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

// Wooden stick-like click:
// noisy, bright contact + short woody body with tiny offset for realism.
const buttonClickPreset: LayerPreset[] = [
  {
    source: 'noise',
    filterType: 'bandpass',
    filterFrequency: 2700,
    q: 1.35,
    gain: 0.145,
    attackMs: 1,
    decayMs: 10,
    startOffsetMs: 0,
  },
  {
    source: 'noise',
    filterType: 'bandpass',
    filterFrequency: 1900,
    q: 1.0,
    gain: 0.085,
    attackMs: 1,
    decayMs: 16,
    startOffsetMs: 1,
  },
  {
    source: 'oscillator',
    oscillatorType: 'triangle',
    filterType: 'bandpass',
    filterFrequency: 2400,
    q: 1.35,
    gain: 0.072,
    attackMs: 1,
    decayMs: 13,
    startOffsetMs: 0,
    curve: [
      [0, 3500],
      [13, 1900],
    ],
  },
  {
    source: 'oscillator',
    oscillatorType: 'triangle',
    filterType: 'lowpass',
    filterFrequency: 1150,
    q: 0.85,
    gain: 0.105,
    attackMs: 1,
    decayMs: 24,
    startOffsetMs: 2,
    curve: [
      [0, 1200],
      [24, 620],
    ],
  },
  {
    source: 'oscillator',
    oscillatorType: 'sine',
    filterType: 'lowpass',
    filterFrequency: 760,
    q: 0.7,
    gain: 0.055,
    attackMs: 1,
    decayMs: 30,
    startOffsetMs: 4,
    curve: [
      [0, 880],
      [30, 430],
    ],
  },
];

export { themeTogglePreset, buttonClickPreset };
export type { LayerPreset };
