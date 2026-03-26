import { MEDIA_QUERY_GALLERY_MOBILE, MEDIA_QUERY_NON_GALLERY_MOBILE } from '../../layout/breakpoints';
import { getRouteFlags } from '../route';

export type InViewPresetMode =
  | 'element'
  | 'stagger-children'
  | 'per-char'
  | 'path-trim'
  | 'per-word'
  | 'element-sequenced'
  | 'element-repeat';

export interface InViewPresetVariablePair {
  initialVariables: Record<string, string>;
  finalVariables: Record<string, string>;
}

export interface InViewPreset {
  mode: InViewPresetMode;
  initialTransform?: string;
  finalTransform?: string;
  transition: Record<string, unknown>;
  amount?: number;
  childSelector?: string;
  childDelay?: number;
  sideAware?: boolean;
  charDelay?: number;
  rowDelayStep?: number;
  wordDelay?: number;
  initialVariables?: Record<string, string>;
  finalVariables?: Record<string, string>;
  resolveVariables?: (element: HTMLElement) => InViewPresetVariablePair | null;
}

export type InViewPresetMap = Record<string, InViewPreset>;

const baseTransition = { duration: 0.4, ease: [0.44, 0, 0.56, 1] };

const resolveFinalCtaMobileVariables = (): InViewPresetVariablePair | null => {
  const normalizedPathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const routeFlags = getRouteFlags();
  const isHomeRoute = routeFlags.isHomeRoute || normalizedPathname === '/';
  const isCasesRoute = routeFlags.isCasesRoute || normalizedPathname === '/cases';
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const isNonGalleryMobileViewport =
    window.matchMedia(MEDIA_QUERY_NON_GALLERY_MOBILE).matches || viewportWidth <= 847;
  const isGalleryMobileViewport = window.matchMedia(MEDIA_QUERY_GALLERY_MOBILE).matches || viewportWidth <= 767;
  const isHomeOrCasesMobileRoute = (isHomeRoute || isCasesRoute) && isNonGalleryMobileViewport;
  const isGalleryMobileRoute =
    (routeFlags.isGalleryRoute || normalizedPathname === '/gallery') &&
    isGalleryMobileViewport;
  if (!isHomeOrCasesMobileRoute && !isGalleryMobileRoute) {
    return null;
  }

  return {
    initialVariables: {
      '--final-cta-title-gap': '210px',
      '--final-cta-title-shift-x': '0px',
      '--final-cta-title-offset-y': '-109px',
      '--final-cta-orb-offset-y': '0px',
      '--final-cta-orb-rotate': '90deg',
    },
    finalVariables: {
      '--final-cta-title-gap': '-8px',
      '--final-cta-title-shift-x': '0px',
      '--final-cta-title-offset-y': '0px',
      '--final-cta-orb-offset-y': '0px',
      '--final-cta-orb-rotate': '0deg',
    },
  };
};

export const inViewPresets = {
  'appear-v1': {
    mode: 'element',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
  },
  'appear-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-motion-stage-item]',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.1,
    sideAware: true,
  },
  'appear-stagger-dynamic-v1': {
    mode: 'stagger-children',
    childSelector: '[data-motion-stage-item]',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.08,
    sideAware: true,
  },
  'cases-arrow-left-v1': {
    mode: 'element',
    initialTransform: 'translate3d(0px, 25px, 0px) scale(0.5)',
    finalTransform: 'translate3d(0px, 0px, 0px) scale(1)',
    transition: { ...baseTransition, delay: 0.3 },
  },
  'cases-arrow-right-v1': {
    mode: 'element',
    initialTransform: 'translate3d(0px, -25px, 0px) scale(0.5)',
    finalTransform: 'translate3d(0px, 0px, 0px) scale(1)',
    transition: { ...baseTransition, delay: 0.4 },
  },
  'design-tools-label-char-v1': {
    mode: 'per-char',
    initialTransform: 'rotate(45deg)',
    finalTransform: 'rotate(0deg)',
    transition: { duration: 0.45, bounce: 0.25 },
    charDelay: 0.06,
    rowDelayStep: 0.1,
  },
  'about-arch-trim-v1': {
    mode: 'path-trim',
    amount: 0.3,
    transition: { duration: 0.6, bounce: 0.3 },
  },
  'quotes-main-word-v1': {
    mode: 'per-word',
    initialTransform: 'translate3d(0px, 10px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: { duration: 0.4, bounce: 0 },
    wordDelay: 0.075,
  },
  'quotes-main-close-after-v1': {
    mode: 'element-sequenced',
    initialTransform: 'translate3d(0px, 10px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: { duration: 0.4, bounce: 0 },
  },
  'final-cta-morph-v1': {
    mode: 'element-repeat',
    amount: 0.7,
    transition: { type: 'spring', duration: 0.6, bounce: 0.1, delay: 0 },
    initialVariables: {
      '--final-cta-title-gap': '350px',
      '--final-cta-title-shift-x': '4px',
      '--final-cta-title-offset-y': '0px',
      '--final-cta-orb-offset-y': '-10px',
      '--final-cta-orb-rotate': '90deg',
    },
    finalVariables: {
      '--final-cta-title-gap': '22px',
      '--final-cta-title-shift-x': '0px',
      '--final-cta-title-offset-y': '0px',
      '--final-cta-orb-offset-y': '0px',
      '--final-cta-orb-rotate': '0deg',
    },
    resolveVariables: () => resolveFinalCtaMobileVariables(),
  },
  'gallery-row-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-motion-stagger-item]',
    initialTransform: 'translate3d(0px, 25px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.08,
  },
  'gallery-first-two-rows-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-gallery-first-two-stage-item]',
    initialTransform: 'translate3d(0px, 25px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.08,
  },
  'gallery-mobile-first-two-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-gallery-mobile-first-two-stage-item]',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.1,
  },
  'gallery-mobile-all-cards-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-gallery-mobile-stage-item]',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.1,
  },
  'process-tickets-row-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-motion-stagger-item]',
    initialTransform: 'translate3d(0px, 25px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.05,
  },
  'process-tickets-row-stagger-dynamic-v1': {
    mode: 'stagger-children',
    childSelector: '[data-motion-stagger-item]',
    initialTransform: 'translate3d(0px, 25px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.08,
  },
  'temporary-adaptive-stagger-v1': {
    mode: 'stagger-children',
    childSelector: '[data-temp-stage-item]',
    initialTransform: 'translate3d(0px, 50px, 0px)',
    finalTransform: 'translate3d(0px, 0px, 0px)',
    transition: baseTransition,
    childDelay: 0.1,
    amount: 0,
  },
} satisfies InViewPresetMap;

export type InViewPresetName = keyof typeof inViewPresets;
