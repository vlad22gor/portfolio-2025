import { useEffect, useMemo, useRef } from 'react';
import {
  DialRoot,
  DialTimeline,
  useDialKit,
  useDialTimeline,
  type TimelineConfig,
} from 'dialkit';
import 'dialkit/styles.css';
import '../../styles/goomy-onboarding-motion.css';

const SCREEN_WIDTH = 402;
const SCREEN_HEIGHT = 874;
const SOURCE_SCALE = 3;
const SOURCE_WIDTH = SCREEN_WIDTH * SOURCE_SCALE;
const SOURCE_HEIGHT = SCREEN_HEIGHT * SOURCE_SCALE;
const STATUS_BAR_HEIGHT = 62;
const FOOTER_TOP = 722;
const INDICATOR_TOP = 754;

const SLIDES = [
  {
    src: '/media/goomy/onboarding-animation/slide-1.png',
    alt: 'GoomY onboarding welcome screen',
  },
  {
    src: '/media/goomy/onboarding-animation/slide-2.png',
    alt: 'GoomY onboarding meal planning screen',
  },
  {
    src: '/media/goomy/onboarding-animation/slide-3.png',
    alt: 'GoomY onboarding recipe collections screen',
  },
  {
    src: '/media/goomy/onboarding-animation/slide-1.png',
    alt: '',
    duplicate: true,
  },
] as const;

const TIMELINE_CONFIG = {
  slider: {
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
    ],
  },
} satisfies TimelineConfig;

type GoomYOnboardingMotionProps = {
  captureMode?: boolean;
  initialTime?: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getIndicatorWeights(position: number) {
  if (position <= 1) {
    return [1 - position, position, 0];
  }

  if (position <= 2) {
    return [0, 2 - position, position - 1];
  }

  return [position - 2, 0, 3 - position];
}

function getThirdSlideWeight(position: number) {
  if (position <= 1) {
    return 0;
  }

  if (position <= 2) {
    return position - 1;
  }

  return 3 - position;
}

function getCurrentSlide(position: number) {
  if (position < 0.5 || position >= 2.5) {
    return 1;
  }

  return position < 1.5 ? 2 : 3;
}

/**
 * Authoring scene for the three-screen GoomY onboarding loop.
 * DialKit owns the deterministic playhead so every frame can be scrubbed.
 */
export default function GoomYOnboardingMotion({
  captureMode = false,
  initialTime,
}: GoomYOnboardingMotionProps) {
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
    'GoomY presentation',
    {
      transition: {
        crossfade: [0, 0, 1, 0.01],
        restingScale: [1, 0.94, 1.04, 0.001],
      },
      viewport: {
        footerFadeHeight: [30, 0, 64, 1],
        phoneShadow: [32, 0, 80, 1],
      },
    },
    {
      id: 'goomy-onboarding-presentation',
      persist: true,
    },
  );

  // TODO(production): replace DialKit sampling with the final Motion timeline
  // after the authoring values have been approved and copied.
  const timeline = useDialTimeline(
    'GoomY onboarding loop',
    TIMELINE_CONFIG,
    {
      id: 'goomy-onboarding-loop-v2',
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

  const position = clamp(Number(timeline.slider.current.position), 0, 3);
  const indicatorWeights = getIndicatorWeights(position);
  const thirdSlideWeight = clamp(getThirdSlideWeight(position));
  const nextLabelOpacity = clamp(1 - thirdSlideWeight / 0.45);
  const getStartedLabelOpacity = clamp((thirdSlideWeight - 0.55) / 0.45);
  const currentSlide = getCurrentSlide(position);

  const sceneStyle = useMemo(
    () =>
      ({
        '--goomy-footer-top': `${FOOTER_TOP}px`,
        '--goomy-footer-fade-height': `${visual.viewport.footerFadeHeight}px`,
        '--goomy-indicator-top': `${INDICATOR_TOP}px`,
        '--goomy-phone-shadow': `${visual.viewport.phoneShadow}px`,
      }) as React.CSSProperties,
    [visual.viewport.footerFadeHeight, visual.viewport.phoneShadow],
  );

  return (
    <main
      className={`goomy-motion-authoring${effectiveCaptureMode ? ' is-capture' : ''}`}
      style={sceneStyle}
    >
      {!effectiveCaptureMode && (
        <header className="goomy-motion-meta">
          <p>GoomY / Onboarding</p>
          <span>
            Slide {currentSlide} of 3 · {timeline.time.toFixed(2)}s
          </span>
        </header>
      )}

      <div
        className="goomy-phone-stage"
        aria-label={`GoomY onboarding animation, slide ${currentSlide} of 3`}
      >
        <div className="goomy-slide-viewport" aria-live="off">
          <div
            className="goomy-slide-track"
            style={{
              transform: `translate3d(${-position * SCREEN_WIDTH}px, 0, 0)`,
              width: `${SLIDES.length * SCREEN_WIDTH}px`,
            }}
          >
            {SLIDES.map((slide, index) => {
              const distance = clamp(Math.abs(index - position));
              const opacity = 1 - visual.transition.crossfade * distance;
              const scale =
                1 -
                (1 - visual.transition.restingScale) *
                  clamp(Math.abs(index - position));

              return (
                <div
                  className="goomy-slide"
                  key={`${slide.src}-${index}`}
                  style={{ opacity, transform: `scale(${scale})` }}
                  aria-hidden={slide.duplicate || undefined}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    width={SOURCE_WIDTH}
                    height={SOURCE_HEIGHT}
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <img
          className="goomy-status-bar"
          src="/media/goomy/onboarding-animation/status-bar.png"
          alt=""
          width={SOURCE_WIDTH}
          height={STATUS_BAR_HEIGHT * SOURCE_SCALE}
          draggable={false}
          aria-hidden="true"
        />

        <div className="goomy-sticky-footer" aria-hidden="true">
          <div className="goomy-page-indicator">
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

          <div className="goomy-cta">
            <img
              className="goomy-cta-image"
              src="/media/goomy/onboarding-animation/cta-next-label.png"
              alt=""
              width="270"
              height="120"
              style={{
                opacity: nextLabelOpacity,
                transform: `translate(-50%, calc(-50% - ${thirdSlideWeight * 8}px))`,
              }}
            />
            <img
              className="goomy-cta-image"
              src="/media/goomy/onboarding-animation/cta-get-started-label.png"
              alt=""
              width="450"
              height="120"
              style={{
                opacity: getStartedLabelOpacity,
                transform: `translate(-50%, calc(-50% + ${(1 - thirdSlideWeight) * 8}px))`,
              }}
            />
          </div>
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
