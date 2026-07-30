import { useEffect, useRef, type CSSProperties } from 'react';
import {
  DialRoot,
  DialTimeline,
  useDialKit,
  useDialTimeline,
  type TimelineConfig,
} from 'dialkit';
import 'dialkit/styles.css';
import '../../styles/goomy-paywall-activation-flow.css';

const SCREEN_WIDTH = 402;
const SCREEN_HEIGHT = 874;
const SOURCE_SCALE = 3;
const SOURCE_WIDTH = SCREEN_WIDTH * SOURCE_SCALE;
const SOURCE_HEIGHT = SCREEN_HEIGHT * SOURCE_SCALE;
const PAYWALL_HEIGHT = 2993;
const PAYWALL_SOURCE_HEIGHT = PAYWALL_HEIGHT * SOURCE_SCALE;
const PAYWALL_MAX_SCROLL = PAYWALL_HEIGHT - SCREEN_HEIGHT;
const ASSET_ROOT = '/media/goomy/paywall-activation-flow';
const NATIVE_PUSH_EASE = [0.32, 0.72, 0, 1] as const;
const CONFETTI_START = 19.42;
const CONFETTI_FADE_IN_DURATION = 0.06;
const CONFETTI_MOTION_DURATION = 1;
const CONFETTI_FADE_OUT_DURATION = 0.36;

const PAYWALL_SLIDES = [1, 2, 3, 4].map((number) => ({
  src: `${ASSET_ROOT}/paywall-${number}@3x.png`,
  alt: `GoomY paywall hero ${number} of 4`,
}));

const RECIPE_CARDS = [
  {
    src: `${ASSET_ROOT}/card-blue@3x.png`,
    alt: 'Creamy Cod Fillet with Spinach recipe card',
    surface: '#b9cdec',
    titleColor: '#1152b7',
    title: 'Creamy Cod Fillet',
    titleLastLine: 'with Spinach',
    description: 'Serve warm with fresh herbs',
  },
  {
    src: `${ASSET_ROOT}/card-lime@3x.png`,
    alt: 'Sesame Salmon Rice Bowl recipe card',
    surface: null,
    titleColor: null,
    title: null,
    titleLastLine: null,
    description: null,
  },
  {
    src: `${ASSET_ROOT}/card-yellow@3x.png`,
    alt: 'Creamy Spicy Chicken Pasta recipe card',
    surface: '#f8dd76',
    titleColor: '#85361d',
    title: 'Creamy Spicy',
    titleLastLine: 'Chicken Pasta',
    description: 'Serve hot with basil and extra parmesan',
  },
] as const;

const RECIPE_DRUM_CARDS = [
  RECIPE_CARDS[0],
  RECIPE_CARDS[1],
  RECIPE_CARDS[2],
  RECIPE_CARDS[0],
] as const;

const CONFETTI_COLORS = ['#dce568', '#f28cdc', '#99c9f5', '#efcfbd'] as const;

const CONFETTI_PARTICLES = Array.from({ length: 120 }, (_, index) => {
  const pseudoRandom = (salt: number) => {
    const value = Math.sin((index + 1) * (salt + 17.31)) * 43758.5453;
    return value - Math.floor(value);
  };

  return {
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: 24 + pseudoRandom(1) * 354,
    widthVariance: 0.78 + pseudoRandom(2) * 0.44,
    aspectVariance: 0.82 + pseudoRandom(3) * 0.36,
    drift: (pseudoRandom(4) - 0.5) * 180,
    swayAmplitude: 8 + pseudoRandom(5) * 22,
    travel: 136 + pseudoRandom(6) * 118,
    spin: (pseudoRandom(7) - 0.5) * 520,
    delayUnit: pseudoRandom(8),
    fall: 72 + pseudoRandom(9) * 60,
    mass: 0.75 + pseudoRandom(10) * 0.5,
    drag: 1.2 + pseudoRandom(11) * 1.2,
    flutterPhase: pseudoRandom(12) * Math.PI * 2,
    flutterCycles: 1.15 + pseudoRandom(13) * 1.5,
    orientationSkew: 0.72 + pseudoRandom(14) * 0.5,
  };
});

const TIMELINE_CONFIG = {
  paywallSlider: {
    at: 0,
    from: { position: 0 },
    transition: {
      type: 'easing',
      duration: 2,
      ease: [0, 0, 1, 1],
    },
    steps: [
      {
        duration: 2,
        to: { position: 0 },
        transition: { type: 'easing', duration: 2, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { position: 1 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: [0.65, 0, 0.35, 1],
        },
      },
      {
        duration: 2,
        to: { position: 1 },
        transition: { type: 'easing', duration: 2, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { position: 2 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: [0.65, 0, 0.35, 1],
        },
      },
      {
        duration: 2,
        to: { position: 2 },
        transition: { type: 'easing', duration: 2, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { position: 3 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: [0.65, 0, 0.35, 1],
        },
      },
      {
        duration: 2,
        to: { position: 3 },
        transition: { type: 'easing', duration: 2, ease: [0, 0, 1, 1] },
      },
    ],
  },
  paywallScroll: {
    at: 10.16,
    from: { offset: 0 },
    transition: {
      type: 'easing',
      duration: 0.95,
      ease: [0.22, 0.61, 0.36, 1],
    },
    steps: [
      {
        duration: 0.95,
        to: { offset: 480 },
        transition: {
          type: 'easing',
          duration: 0.95,
          ease: [0.22, 0.61, 0.36, 1],
        },
      },
      {
        duration: 0.38,
        to: { offset: 480 },
        transition: { type: 'easing', duration: 0.38, ease: [0, 0, 1, 1] },
      },
      {
        duration: 1.05,
        to: { offset: 1040 },
        transition: {
          type: 'easing',
          duration: 1.05,
          ease: [0.22, 0.61, 0.36, 1],
        },
      },
      {
        duration: 0.34,
        to: { offset: 1040 },
        transition: { type: 'easing', duration: 0.34, ease: [0, 0, 1, 1] },
      },
      {
        duration: 1,
        to: { offset: 1590 },
        transition: {
          type: 'easing',
          duration: 1,
          ease: [0.22, 0.61, 0.36, 1],
        },
      },
      {
        duration: 0.32,
        to: { offset: 1590 },
        transition: { type: 'easing', duration: 0.32, ease: [0, 0, 1, 1] },
      },
      {
        duration: 1.1,
        to: { offset: 2120 },
        transition: {
          type: 'easing',
          duration: 1.1,
          ease: [0.22, 0.61, 0.36, 1],
        },
      },
    ],
  },
  screens: {
    at: 0,
    from: { phase: 0 },
    transition: {
      type: 'easing',
      duration: 0.72,
      ease: NATIVE_PUSH_EASE,
    },
    steps: [
      {
        duration: 16.12,
        to: { phase: 0 },
        transition: { type: 'easing', duration: 16.12, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { phase: 1 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: NATIVE_PUSH_EASE,
        },
      },
      {
        duration: 3.68,
        to: { phase: 1 },
        transition: { type: 'easing', duration: 3.68, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { phase: 2 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: NATIVE_PUSH_EASE,
        },
      },
      {
        duration: 3.42,
        to: { phase: 2 },
        transition: { type: 'easing', duration: 3.42, ease: [0, 0, 1, 1] },
      },
      {
        duration: 0.72,
        to: { phase: 3 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: NATIVE_PUSH_EASE,
        },
      },
      {
        duration: 2.2,
        to: { phase: 3 },
        transition: { type: 'easing', duration: 2.2, ease: [0, 0, 1, 1] },
      },
    ],
  },
  paywallTap: {
    at: 15.82,
    from: { scale: 1 },
    transition: {
      type: 'easing',
      duration: 0.14,
      ease: [0.32, 0, 0.67, 0],
    },
    steps: [
      {
        duration: 0.14,
        to: { scale: 0.96 },
        transition: {
          type: 'easing',
          duration: 0.14,
          ease: [0.32, 0, 0.67, 0],
        },
      },
      {
        duration: 0.16,
        to: { scale: 1 },
        transition: {
          type: 'easing',
          duration: 0.16,
          ease: [0.33, 1, 0.68, 1],
        },
      },
    ],
  },
  holdTap: {
    at: 17.58,
    from: { scale: 1 },
    transition: {
      type: 'easing',
      duration: 0.14,
      ease: [0.32, 0, 0.67, 0],
    },
    steps: [
      {
        duration: 0.14,
        to: { scale: 0.96 },
        transition: {
          type: 'easing',
          duration: 0.14,
          ease: [0.32, 0, 0.67, 0],
        },
      },
      {
        duration: 0.16,
        to: { scale: 1 },
        transition: {
          type: 'easing',
          duration: 0.16,
          ease: [0.33, 1, 0.68, 1],
        },
      },
    ],
  },
  holdButton: {
    at: 17.58,
    from: { state: 0, progress: 0 },
    transition: {
      type: 'easing',
      duration: 0.12,
      ease: [0.32, 0, 0.67, 0],
    },
    steps: [
      {
        duration: 0.12,
        to: { state: 1, progress: 0 },
        transition: {
          type: 'easing',
          duration: 0.12,
          ease: [0.32, 0, 0.67, 0],
        },
      },
      {
        duration: 1.6,
        to: { state: 1, progress: 1 },
        transition: {
          type: 'easing',
          duration: 1.6,
          ease: [0, 0, 1, 1],
        },
      },
      {
        duration: 0.12,
        to: { state: 2, progress: 1 },
        transition: {
          type: 'easing',
          duration: 0.12,
          ease: [0.33, 1, 0.68, 1],
        },
      },
    ],
  },
  confetti: {
    at: CONFETTI_START,
    from: { progress: 0, opacity: 0 },
    transition: {
      type: 'easing',
      duration: CONFETTI_FADE_IN_DURATION,
      ease: [0, 0, 1, 1],
    },
    steps: [
      {
        duration: 1.42,
        to: { progress: 0, opacity: 1 },
        transition: {
          type: 'easing',
          duration: 1.42,
          ease: [0, 0, 1, 1],
        },
      },
      {
        duration: CONFETTI_MOTION_DURATION,
        to: { progress: 1, opacity: 1 },
        transition: {
          type: 'easing',
          duration: CONFETTI_MOTION_DURATION,
          ease: [0, 0, 1, 1],
        },
      },
      {
        duration: CONFETTI_FADE_OUT_DURATION,
        to: { progress: 1, opacity: 0 },
        transition: {
          type: 'easing',
          duration: CONFETTI_FADE_OUT_DURATION,
          ease: [0.4, 0, 1, 1],
        },
      },
    ],
  },
  recipeCarousel: {
    at: 22.52,
    from: { position: 1 },
    transition: {
      type: 'easing',
      duration: 0.72,
      ease: NATIVE_PUSH_EASE,
    },
    steps: [
      {
        duration: 0.72,
        to: { position: 2 },
        transition: {
          type: 'easing',
          duration: 0.72,
          ease: NATIVE_PUSH_EASE,
        },
      },
      {
        duration: 1.2,
        to: { position: 2 },
        transition: { type: 'easing', duration: 1.2, ease: [0, 0, 1, 1] },
      },
    ],
  },
  recipeTap: {
    at: 24.44,
    from: { scale: 1 },
    transition: {
      type: 'easing',
      duration: 0.14,
      ease: [0.32, 0, 0.67, 0],
    },
    steps: [
      {
        duration: 0.14,
        to: { scale: 0.95 },
        transition: {
          type: 'easing',
          duration: 0.14,
          ease: [0.32, 0, 0.67, 0],
        },
      },
      {
        duration: 0.18,
        to: { scale: 1 },
        transition: {
          type: 'easing',
          duration: 0.18,
          ease: [0.33, 1, 0.68, 1],
        },
      },
    ],
  },
  loopGuard: {
    at: 28.4,
    from: { value: 0 },
    transition: {
      type: 'easing',
      duration: 0.01,
      ease: [0, 0, 1, 1],
    },
    steps: [
      {
        duration: 0.05,
        to: { value: 1 },
        transition: { type: 'easing', duration: 0.05, ease: [0, 0, 1, 1] },
      },
    ],
  },
} satisfies TimelineConfig;

type GoomYPaywallActivationFlowProps = {
  captureMode?: boolean;
  initialTime?: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getConfettiMotionProgress(
  progress: number,
  apexProgress: number,
  riseSpeed: number,
  turnaroundSlowdown: number,
  fallSpeed: number,
) {
  const safeProgress = clamp(progress);
  const safeApex = clamp(apexProgress, 0.2, 0.8);
  const riseWeight = 1 / Math.max(riseSpeed, 0.01);
  const turnaroundWeight = Math.max(turnaroundSlowdown, 0);
  const fallWeight = 1 / Math.max(fallSpeed, 0.01);
  const totalWeight = riseWeight + turnaroundWeight + fallWeight;
  const riseEnd = riseWeight / totalWeight;
  const fallStart = (riseWeight + turnaroundWeight) / totalWeight;
  const turnaroundSpan = Math.min(
    turnaroundWeight * 0.07,
    safeApex * 0.12,
    (1 - safeApex) * 0.12,
  );
  const riseTarget = safeApex - turnaroundSpan;
  const fallStartProgress = safeApex + turnaroundSpan;

  if (safeProgress < riseEnd) {
    const phaseProgress = riseEnd <= 0 ? 1 : safeProgress / riseEnd;
    const easedProgress = 1 - (1 - phaseProgress) ** 2.2;
    return riseTarget * easedProgress;
  }

  if (safeProgress < fallStart && fallStart > riseEnd) {
    const phaseProgress =
      (safeProgress - riseEnd) / (fallStart - riseEnd);
    const easedProgress =
      phaseProgress * phaseProgress * (3 - 2 * phaseProgress);
    return (
      riseTarget +
      (fallStartProgress - riseTarget) * easedProgress
    );
  }

  const phaseProgress =
    fallStart >= 1
      ? 1
      : clamp((safeProgress - fallStart) / (1 - fallStart));
  return (
    fallStartProgress +
    (1 - fallStartProgress) * phaseProgress * phaseProgress
  );
}

function getNativePushStyle(
  phase: number,
  index: number,
  pushParallax: number,
  pushDimOpacity: number,
) {
  const delta = phase - index;
  const isIncoming = delta >= -1 && delta < 0;
  const isCurrentOrOutgoing = delta >= 0 && delta <= 1;

  if (!isIncoming && !isCurrentOrOutgoing) {
    return {
      opacity: 0,
      transform: `translate3d(${SCREEN_WIDTH}px, 0, 0)`,
      zIndex: 0,
      '--goomy-push-dim-opacity': 0,
    } as CSSProperties;
  }

  if (isIncoming) {
    const progress = clamp(delta + 1);
    return {
      opacity: 1,
      transform: `translate3d(${(1 - progress) * SCREEN_WIDTH}px, 0, 0)`,
      zIndex: 30,
      '--goomy-push-dim-opacity': 0,
    } as CSSProperties;
  }

  return {
    opacity: 1,
    transform: `translate3d(${-clamp(delta) * SCREEN_WIDTH * pushParallax}px, 0, 0)`,
    zIndex: 20,
    '--goomy-push-dim-opacity': clamp(delta) * pushDimOpacity,
  } as CSSProperties;
}

function getIndicatorWeights(position: number, count: number) {
  const current = clamp(position, 0, count - 1);
  return Array.from({ length: count }, (_, index) =>
    clamp(1 - Math.abs(current - index)),
  );
}

function getPhaseLabel(phase: number) {
  if (phase < 0.5) return 'Paywall';
  if (phase < 1.5) return 'Hold to commit';
  if (phase < 2.5) return 'Choose recipe';
  return 'Success';
}

export default function GoomYPaywallActivationFlow({
  captureMode = false,
  initialTime,
}: GoomYPaywallActivationFlowProps) {
  const browserSearch = new URLSearchParams(window.location.search);
  const browserTimeValue = browserSearch.get('time');
  const browserTime =
    browserTimeValue === null ? Number.NaN : Number(browserTimeValue);
  const effectiveCaptureMode =
    captureMode || browserSearch.get('capture') === '1';
  const effectiveInitialTime =
    initialTime ?? (Number.isFinite(browserTime) ? browserTime : undefined);
  const initialTimeApplied = useRef(false);

  const visual = useDialKit(
    'GoomY activation flow',
    {
      navigation: {
        pushParallax: [0.28, 0.12, 0.5, 0.01],
        pushDimOpacity: [0.12, 0, 0.24, 0.01],
      },
      paywall: {
        headerFadeThreshold: [44, 8, 120, 1],
      },
      carousel: {
        drumSideOffset: [332, 240, 390, 1],
        drumArcDepth: [15, -120, 180, 1],
        drumSlotAngle: [20, 20, 70, 0.5],
        drumTilt: [5, 0, 30, 0.5],
        pressScale: [0.95, 0.9, 1, 0.005],
      },
      celebration: {
        confettiTravel: [1.5, 0.65, 1.5, 0.01],
        emitterOffset: [36, 20, 64, 1],
        returnDepth: [1, 0.6, 1.6, 0.01],
        particleCount: [90, 44, 120, 1],
        emissionSpread: [0.29, 0.18, 0.72, 0.01],
        paperWidth: [4.5, 3, 12, 0.1],
        paperAspect: [2.55, 0.7, 3, 0.05],
        paperFlutter: [0.4, 0.4, 1.6, 0.01],
        paperSpin: [0.97, 0.5, 1.4, 0.01],
        riseSpeed: [0.45, 0.45, 2.2, 0.05],
        turnaroundSlowdown: [0.19, 0, 1, 0.01],
        fallSpeed: [0.45, 0.45, 2.2, 0.05],
      },
    },
    {
      id: 'goomy-paywall-activation-visual-v9',
      persist: true,
    },
  );

  // TODO(production): DialKit's clip.current values are the scrubbable authoring preview.
  // Replace them with equivalent real Motion animations using the tuned timeline
  // timings and transitions, then remove useDialTimeline and <DialTimeline />.
  const timeline = useDialTimeline(
    'GoomY paywall → activation',
    TIMELINE_CONFIG,
    {
      id: 'goomy-paywall-activation-flow-v5',
      persist: true,
      autoplay: true,
      loop: true,
    },
  );

  useEffect(() => {
    if (
      initialTimeApplied.current ||
      !Number.isFinite(effectiveInitialTime)
    ) {
      return;
    }

    initialTimeApplied.current = true;
    timeline.pause();
    timeline.seek(effectiveInitialTime ?? 0);
  }, [effectiveInitialTime, timeline]);

  const screenPhase = Number(timeline.screens.current.phase);
  const heroPosition = clamp(
    Number(timeline.paywallSlider.current.position),
    0,
    3,
  );
  const scrollOffset = clamp(
    Number(timeline.paywallScroll.current.offset),
    0,
    PAYWALL_MAX_SCROLL,
  );
  const paywallHeaderProgress = clamp(
    scrollOffset / visual.paywall.headerFadeThreshold,
  );
  const screenStyles = [0, 1, 2, 3].map((index) =>
    getNativePushStyle(
      screenPhase,
      index,
      visual.navigation.pushParallax,
      visual.navigation.pushDimOpacity,
    ),
  );
  const indicatorWeights = getIndicatorWeights(heroPosition, 4);
  const holdState = clamp(Number(timeline.holdButton.current.state), 0, 2);
  const holdProgress = clamp(
    Number(timeline.holdButton.current.progress),
  );
  const committedOpacity = clamp(holdState - 1);
  const idleLabelOpacity = 1 - clamp(holdState);
  const holdingLabelOpacity =
    holdState <= 1 ? clamp(holdState) : 1 - clamp(holdState - 1);
  const holdFill =
    holdState <= 1
      ? holdProgress * 90
      : 90 + clamp(holdState - 1) * 10;
  const confettiProgress = clamp(
    (timeline.time - CONFETTI_START - CONFETTI_FADE_IN_DURATION) /
      CONFETTI_MOTION_DURATION,
  );
  // Ballistic visibility follows the canonical playhead instead of persisted
  // clip values. A stale DialKit step must not suppress or finish the burst.
  const recipePosition = clamp(
    Number(timeline.recipeCarousel.current.position),
    1,
    2,
  );
  const timelineRecipeTapScale = clamp(
    Number(timeline.recipeTap.current.scale),
    0.8,
    1,
  );
  const recipeTapScale =
    1 -
    (1 - visual.carousel.pressScale) *
      ((1 - timelineRecipeTapScale) / (1 - 0.95));

  return (
    <main
      className={`goomy-flow-authoring${effectiveCaptureMode ? ' is-capture' : ''}`}
    >
      {!effectiveCaptureMode && (
        <header className="goomy-flow-meta">
          <p>GoomY / Paywall → Activation</p>
          <span>
            {getPhaseLabel(screenPhase)} · {timeline.time.toFixed(2)}s
          </span>
        </header>
      )}

      <div
        className="goomy-flow-phone"
        aria-label={`GoomY activation flow: ${getPhaseLabel(screenPhase)}`}
      >
        <section
          className="goomy-flow-screen goomy-flow-paywall"
          style={screenStyles[0]}
          aria-hidden={screenStyles[0].opacity === 0}
        >
          <div
            className="goomy-paywall-scroll-canvas"
            style={{
              transform: `translate3d(0, ${-scrollOffset}px, 0)`,
            }}
          >
            <img
              className="goomy-paywall-long-image"
              src={`${ASSET_ROOT}/paywall-full@3x.png`}
              alt="GoomY premium paywall"
              width={SOURCE_WIDTH}
              height={PAYWALL_SOURCE_HEIGHT}
              draggable={false}
            />

            <div className="goomy-paywall-hero-window" aria-hidden="true">
              <div
                className="goomy-paywall-hero-track"
                style={{
                  width: `${PAYWALL_SLIDES.length * SCREEN_WIDTH}px`,
                  transform: `translate3d(${-heroPosition * SCREEN_WIDTH}px, 0, 0)`,
                }}
              >
                {PAYWALL_SLIDES.map((slide) => (
                  <div className="goomy-paywall-hero-slide" key={slide.src}>
                    <img
                      src={slide.src}
                      alt=""
                      width={SOURCE_WIDTH}
                      height={SOURCE_HEIGHT}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              <div className="goomy-paywall-page-indicator">
                {indicatorWeights.map((weight, index) => (
                  <span
                    key={index}
                    style={{
                      width: `${6 + weight * 12}px`,
                      backgroundColor: `rgba(0, 0, 0, ${0.25 + weight * 0.65})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="goomy-paywall-fixed-header" aria-hidden="true">
            <div
              className="goomy-paywall-header-underlap"
              style={{ opacity: paywallHeaderProgress }}
            />
            <div className="goomy-paywall-header-row">
              <div className="goomy-paywall-header-slot is-leading">
                <span className="goomy-paywall-back-control">
                  <img
                    src={`${ASSET_ROOT}/arrow-left.svg`}
                    alt=""
                    width={18.499}
                    height={13.64}
                    draggable={false}
                  />
                </span>
              </div>
              <div className="goomy-paywall-brand-slot">
                <img
                  src={`${ASSET_ROOT}/goomy-logo.png`}
                  alt=""
                  width={490}
                  height={201}
                  draggable={false}
                />
              </div>
              <div className="goomy-paywall-header-slot is-trailing">
                <span className="goomy-paywall-restore-control">Restore</span>
              </div>
            </div>
          </div>

          <div className="goomy-paywall-fixed-footer" aria-hidden="true">
            <p>No payment due now</p>
            <div
              className="goomy-paywall-primary-action"
              style={{
                transform: `scale(${Number(timeline.paywallTap.current.scale)})`,
              }}
            >
              Start my free trial
            </div>
          </div>
        </section>

        <section
          className="goomy-flow-screen goomy-flow-hold"
          style={screenStyles[1]}
          aria-hidden={screenStyles[1].opacity === 0}
        >
          <img
            className="goomy-flow-full-screen-image goomy-hold-content-image"
            src={`${ASSET_ROOT}/hold-idle@3x.png`}
            alt="GoomY commitment screen"
            width={SOURCE_WIDTH}
            height={SOURCE_HEIGHT}
            draggable={false}
          />
          <div className="goomy-hold-fixed-footer" aria-hidden="true">
            <p>Hold the button to commit</p>
            <div
              className="goomy-hold-button-live"
              style={{
                transform: `scale(${Number(timeline.holdTap.current.scale)})`,
              }}
            >
              <span
                className="goomy-hold-button-progress"
                style={{ width: `${holdFill}%` }}
              />
              <span
                className="goomy-hold-button-label"
                style={{ opacity: idleLabelOpacity }}
              >
                Hold to commit
              </span>
              <span
                className="goomy-hold-button-label"
                style={{ opacity: holdingLabelOpacity }}
              >
                Keep holding...
              </span>
              <span
                className="goomy-hold-button-label"
                style={{ opacity: committedOpacity }}
              >
                Committed!
              </span>
            </div>
          </div>
          <div
            className="goomy-confetti-emitter"
            data-confetti-count={Math.round(
              visual.celebration.particleCount,
            )}
            data-confetti-travel={visual.celebration.confettiTravel}
            data-confetti-rise-speed={visual.celebration.riseSpeed}
            data-confetti-turnaround={
              visual.celebration.turnaroundSlowdown
            }
            data-confetti-fall-speed={visual.celebration.fallSpeed}
            data-confetti-progress={confettiProgress.toFixed(3)}
            style={{
              transform: `translate3d(0, ${visual.celebration.emitterOffset}px, 0)`,
            }}
            aria-hidden="true"
          >
            {CONFETTI_PARTICLES.slice(
              0,
              Math.round(visual.celebration.particleCount),
            ).map((particle, index) => {
              const delay =
                particle.delayUnit *
                visual.celebration.emissionSpread;
              const localProgress = clamp(
                (confettiProgress - delay) / (1 - delay),
              );
              const travelHeight =
                particle.travel *
                visual.celebration.confettiTravel;
              const returnDistance =
                particle.fall *
                particle.mass *
                visual.celebration.returnDepth;
              const apexProgress =
                (2 * travelHeight) /
                (4 * travelHeight + returnDistance);
              const motionProgress = getConfettiMotionProgress(
                localProgress,
                apexProgress,
                visual.celebration.riseSpeed,
                visual.celebration.turnaroundSlowdown,
                visual.celebration.fallSpeed,
              );
              const smoothProgress =
                localProgress *
                localProgress *
                (3 - 2 * localProgress);
              const dragProgress =
                (1 - Math.exp(-particle.drag * motionProgress)) /
                (1 - Math.exp(-particle.drag));
              const orientationEnvelope =
                clamp(localProgress / 0.18) ** 2 *
                (3 - 2 * clamp(localProgress / 0.18));
              const flutterAngle =
                particle.flutterPhase +
                dragProgress *
                  particle.flutterCycles *
                  Math.PI *
                  2;
              const sway =
                (Math.sin(flutterAngle) -
                  Math.sin(particle.flutterPhase)) *
                particle.swayAmplitude *
                visual.celebration.paperFlutter *
                orientationEnvelope;
              const x =
                particle.drift * dragProgress + sway;
              const lift =
                -4 *
                travelHeight *
                motionProgress *
                (1 - motionProgress);
              const gravity =
                returnDistance *
                motionProgress *
                motionProgress;
              const verticalFlutter =
                Math.cos(flutterAngle) *
                particle.swayAmplitude *
                0.28 *
                visual.celebration.paperFlutter *
                orientationEnvelope *
                (1 - motionProgress * 0.35);
              const y = lift + gravity + verticalFlutter;
              const rotateZ =
                particle.spin *
                  smoothProgress *
                  visual.celebration.paperSpin +
                Math.sin(flutterAngle) *
                  18 *
                  orientationEnvelope;
              const rotateX =
                Math.sin(flutterAngle) *
                50 *
                visual.celebration.paperFlutter *
                orientationEnvelope;
              const rotateY =
                Math.cos(
                  flutterAngle * particle.orientationSkew,
                ) *
                32 *
                visual.celebration.paperFlutter *
                orientationEnvelope;

              return (
                <span
                  key={index}
                  style={{
                    left: `${particle.left}px`,
                    width: `${
                      visual.celebration.paperWidth *
                      particle.widthVariance
                    }px`,
                    height: `${
                      visual.celebration.paperWidth *
                      visual.celebration.paperAspect *
                      particle.aspectVariance
                    }px`,
                    backgroundColor: particle.color,
                    transform:
                      `perspective(220px) translate3d(${x}px, ${y}px, 0) ` +
                      `rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) ` +
                      `rotateY(${rotateY}deg)`,
                  }}
                />
              );
            })}
          </div>
        </section>

        <section
          className="goomy-flow-screen goomy-flow-recipe"
          style={screenStyles[2]}
          aria-hidden={screenStyles[2].opacity === 0}
        >
          <img
            className="goomy-flow-full-screen-image"
            src={`${ASSET_ROOT}/choose-recipe@3x.png`}
            alt="GoomY choose a recipe screen"
            width={SOURCE_WIDTH}
            height={SOURCE_HEIGHT}
            draggable={false}
          />
          <div
            className="goomy-recipe-carousel-window"
            data-drum-side-offset={visual.carousel.drumSideOffset}
            data-drum-arc-depth={visual.carousel.drumArcDepth}
            data-drum-slot-angle={visual.carousel.drumSlotAngle}
          >
            {RECIPE_DRUM_CARDS.map((card, index) => {
              const drumDelta = index - recipePosition;
              const slotAngle =
                (visual.carousel.drumSlotAngle * Math.PI) / 180;
              const drumAngle = drumDelta * slotAngle;
              const sideSin = Math.sin(slotAngle);
              const sideRise = 1 - Math.cos(slotAngle);
              const x =
                53 +
                (visual.carousel.drumSideOffset *
                  Math.sin(drumAngle)) /
                  sideSin;
              const y =
                (visual.carousel.drumArcDepth *
                  (1 - Math.cos(drumAngle))) /
                  sideRise;
              const rotation =
                drumDelta * visual.carousel.drumTilt;
              const isYellow = index === 2;

              return (
                <div
                  className="goomy-recipe-card"
                  key={`${card.src}-${index}`}
                  data-card-index={index}
                  data-recipe-index={index % RECIPE_CARDS.length}
                  data-drum-delta={drumDelta}
                  data-drum-angle={drumAngle}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${isYellow ? recipeTapScale : 1})`,
                    zIndex:
                      100 -
                      Math.round(
                        Math.min(Math.abs(drumDelta), 4) * 20,
                      ),
                    '--goomy-recipe-card-surface':
                      card.surface ?? 'transparent',
                    '--goomy-recipe-card-title':
                      card.titleColor ?? 'currentColor',
                  } as CSSProperties}
                >
                  <img
                    src={card.src}
                    alt={card.alt}
                    width={888}
                    height={1323}
                    draggable={false}
                  />
                  {card.title && (
                    <div
                      className="goomy-recipe-card-content-fix"
                      aria-hidden="true"
                    >
                      <strong>{card.title}</strong>
                      <em>{card.titleLastLine}</em>
                      <p>{card.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
            <p>Tap the recipe you like</p>
          </div>
        </section>

        <section
          className="goomy-flow-screen goomy-flow-success"
          style={screenStyles[3]}
          aria-hidden={screenStyles[3].opacity === 0}
        >
          <img
            className="goomy-flow-full-screen-image"
            src={`${ASSET_ROOT}/success@3x.png`}
            alt="GoomY recipe saved successfully"
            width={SOURCE_WIDTH}
            height={SOURCE_HEIGHT}
            draggable={false}
          />
        </section>

        <div className="goomy-flow-static-status-bar" aria-hidden="true">
          <img
            src={`${ASSET_ROOT}/status-bar-icons@3x.png`}
            alt=""
            width={SOURCE_WIDTH}
            height={186}
            decoding="sync"
            fetchPriority="high"
            draggable={false}
          />
        </div>
      </div>

      {!effectiveCaptureMode && (
        <>
          <DialRoot
            position="top-right"
            defaultOpen
            theme="dark"
            productionEnabled
          />
          <DialTimeline
            defaultOpen
            defaultVisible
            theme="dark"
            productionEnabled
          />
        </>
      )}
    </main>
  );
}
