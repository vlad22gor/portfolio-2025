import { animate, inView } from 'motion';

import { readDataInt } from '../dataset';
import type { Lifecycle } from '../lifecycle';
import { getRouteFlags } from '../route';

import type { InViewObserverRegistry } from './observerRegistry';
import type { InViewPreset, InViewPresetMap } from './presets';
import type { RouteTransitionGate } from './routeTransitionGate';

type MotionNode = HTMLElement | SVGElement;

type RuntimePreset = InViewPreset & {
  transition: Record<string, unknown>;
  initialTransform?: string;
  finalTransform?: string;
  amount?: number;
  childSelector?: string;
  childDelay?: number;
  sideAware?: boolean;
  charDelay?: number;
  rowDelayStep?: number;
  wordDelay?: number;
  initialVariables?: Record<string, string>;
  finalVariables?: Record<string, string>;
  resolveVariables?: (element: HTMLElement) =>
    | {
        initialVariables: Record<string, string>;
        finalVariables: Record<string, string>;
      }
    | null;
};

interface CreateInViewMotionEngineArgs {
  lifecycle: Lifecycle;
  presets: InViewPresetMap;
  observerRegistry: InViewObserverRegistry;
  routeGate: RouteTransitionGate;
  selector?: string;
  sequenceEventName?: string;
}

export interface InViewMotionEngine {
  mount: () => void;
  stopAll: () => void;
}

const isMotionNode = (value: unknown): value is MotionNode => value instanceof HTMLElement || value instanceof SVGElement;

const trailingPunctuationTokenPattern = /^[,.;:!?%)\]\}»”’"'…]+$/;

const parseNumericValue = (value: string) => {
  const match = value.trim().match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
  if (!match) {
    return null;
  }
  return { number: Number.parseFloat(match[1]), unit: match[2] ?? '' };
};

const interpolateNumericValue = (fromValue: string, toValue: string, progress: number) => {
  const from = parseNumericValue(fromValue);
  const to = parseNumericValue(toValue);
  if (!from || !to || from.unit !== to.unit) {
    return progress < 1 ? fromValue : toValue;
  }
  const value = from.number + (to.number - from.number) * progress;
  return `${value}${from.unit}`;
};

const setCssVariables = (element: HTMLElement, variables: Record<string, string>) => {
  Object.entries(variables).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
};

export const createInViewMotionEngine = ({
  lifecycle: _lifecycle,
  presets,
  observerRegistry,
  routeGate,
  selector = '[data-motion-inview]',
  sequenceEventName = 'motion:sequence-complete',
}: CreateInViewMotionEngineArgs): InViewMotionEngine => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const completedSequences = new Set<string>();
  const charSegmenter =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      : null;
  const wordSegmenter =
    typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(undefined, { granularity: 'word' })
      : null;

  const emitSequenceComplete = (sequenceId: string) => {
    if (!sequenceId) {
      return;
    }
    if (completedSequences.has(sequenceId)) {
      return;
    }
    completedSequences.add(sequenceId);
    window.dispatchEvent(new CustomEvent(sequenceEventName, { detail: { id: sequenceId } }));
  };

  const onSequenceComplete = (sequenceId: string, callback: () => void) => {
    const handler = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }
      if (event.detail?.id !== sequenceId) {
        return;
      }
      callback();
    };
    window.addEventListener(sequenceEventName, handler);
    return () => {
      window.removeEventListener(sequenceEventName, handler);
    };
  };

  const resolveBaseTransform = (element: MotionNode) => {
    const inlineTransform = element.style.transform?.trim();
    if (inlineTransform && inlineTransform !== 'none') {
      return inlineTransform;
    }
    const computedTransform = window.getComputedStyle(element).transform;
    if (!computedTransform || computedTransform === 'none') {
      return '';
    }
    return computedTransform;
  };

  const composeTransform = (baseTransform: string, motionTransform: string) => {
    if (!baseTransform) {
      return motionTransform;
    }
    return `${baseTransform} ${motionTransform}`;
  };

  const setInitial = (element: MotionNode, initialTransform: string) => {
    element.style.opacity = '0';
    element.style.transform = initialTransform;
  };

  const setFinal = (element: MotionNode, finalTransform: string) => {
    element.style.opacity = '1';
    element.style.transform = finalTransform;
  };

  const splitIntoGraphemes = (text: string) => {
    if (!text) {
      return [];
    }
    if (charSegmenter) {
      return Array.from(charSegmenter.segment(text), (segment) => segment.segment);
    }
    return Array.from(text);
  };

  const splitIntoWordTokens = (text: string) => {
    if (!text) {
      return [];
    }
    if (wordSegmenter) {
      return Array.from(wordSegmenter.segment(text), (segment) => segment.segment);
    }
    return text.split(/(\s+)/);
  };

  const isTrailingPunctuationToken = (token: string) => {
    if (!token) {
      return false;
    }
    if (token.trim() !== token) {
      return false;
    }
    return trailingPunctuationTokenPattern.test(token);
  };

  const ensurePerCharNodes = (element: HTMLElement) => {
    if (element.dataset.motionPerCharPrepared === 'true') {
      return Array.from(element.querySelectorAll<HTMLElement>('[data-motion-char]'));
    }

    const rawText = element.textContent ?? '';
    const sourceText = rawText.replace(/\s+/g, ' ').trim();
    if (!sourceText) {
      element.dataset.motionPerCharPrepared = 'true';
      return [];
    }

    const graphemes = splitIntoGraphemes(sourceText);
    const fragment = document.createDocumentFragment();
    let charIndex = 0;

    for (const grapheme of graphemes) {
      if (!grapheme.trim()) {
        fragment.append(document.createTextNode(grapheme));
        continue;
      }
      const charNode = document.createElement('span');
      charNode.dataset.motionChar = 'true';
      charNode.dataset.motionCharIndex = String(charIndex);
      charNode.textContent = grapheme;
      charNode.style.display = 'inline-block';
      charNode.style.transformOrigin = '50% 50%';
      fragment.append(charNode);
      charIndex += 1;
    }

    element.setAttribute('aria-label', sourceText);
    element.textContent = '';
    element.append(fragment);
    element.dataset.motionPerCharPrepared = 'true';
    return Array.from(element.querySelectorAll<HTMLElement>('[data-motion-char]'));
  };

  const setPerCharInitial = (charNodes: HTMLElement[], preset: RuntimePreset) => {
    charNodes.forEach((charNode) => {
      charNode.style.opacity = '0';
      charNode.style.transform = preset.initialTransform ?? '';
    });
  };

  const setPerCharFinal = (charNodes: HTMLElement[], preset: RuntimePreset) => {
    charNodes.forEach((charNode) => {
      charNode.style.opacity = '1';
      charNode.style.transform = preset.finalTransform ?? '';
    });
  };

  const ensurePerWordNodes = (element: HTMLElement) => {
    if (element.dataset.motionPerWordPrepared === 'true') {
      return Array.from(element.querySelectorAll<HTMLElement>('[data-motion-word]'));
    }

    const rawText = element.textContent ?? '';
    const sourceText = rawText.replace(/\s+/g, ' ').trim();
    if (!sourceText) {
      element.dataset.motionPerWordPrepared = 'true';
      return [];
    }

    const tokens = splitIntoWordTokens(sourceText);
    const fragment = document.createDocumentFragment();
    let wordIndex = 0;
    let previousWordNode: HTMLElement | null = null;
    let previousTokenWasWhitespace = true;

    for (const token of tokens) {
      if (!token) {
        continue;
      }
      if (!token.trim()) {
        fragment.append(document.createTextNode(token));
        previousTokenWasWhitespace = true;
        continue;
      }

      const shouldAttachToPreviousWord =
        !previousTokenWasWhitespace &&
        previousWordNode instanceof HTMLElement &&
        isTrailingPunctuationToken(token);
      if (shouldAttachToPreviousWord) {
        previousWordNode.textContent = `${previousWordNode.textContent ?? ''}${token}`;
        previousTokenWasWhitespace = false;
        continue;
      }

      const wordNode = document.createElement('span');
      wordNode.dataset.motionWord = 'true';
      wordNode.dataset.motionWordIndex = String(wordIndex);
      wordNode.textContent = token;
      wordNode.style.display = 'inline-block';
      fragment.append(wordNode);
      previousWordNode = wordNode;
      previousTokenWasWhitespace = false;
      wordIndex += 1;
    }

    element.setAttribute('aria-label', sourceText);
    element.textContent = '';
    element.append(fragment);
    element.dataset.motionPerWordPrepared = 'true';
    return Array.from(element.querySelectorAll<HTMLElement>('[data-motion-word]'));
  };

  const setPerWordInitial = (wordNodes: HTMLElement[], preset: RuntimePreset) => {
    wordNodes.forEach((wordNode) => {
      wordNode.style.opacity = '0';
      wordNode.style.transform = preset.initialTransform ?? '';
    });
  };

  const setPerWordFinal = (wordNodes: HTMLElement[], preset: RuntimePreset) => {
    wordNodes.forEach((wordNode) => {
      wordNode.style.opacity = '1';
      wordNode.style.transform = preset.finalTransform ?? '';
    });
  };

  const isHomeRoute = () => getRouteFlags().isHomeRoute;

  const clearQuoteMarkPosition = (quoteMark: HTMLElement) => {
    quoteMark.style.removeProperty('left');
    quoteMark.style.removeProperty('top');
  };

  const findNextFlowBlock = (node: HTMLElement, stopRoot: HTMLElement) => {
    let current: HTMLElement | null = node;
    while (current && current !== stopRoot) {
      const sibling = current.nextElementSibling;
      if (sibling instanceof HTMLElement) {
        return sibling;
      }
      current = current.parentElement;
    }
    return null;
  };

  const resolveQuoteGapToNextFlowBlock = (quoteRoot: HTMLElement, stopRootSelector: string) => {
    const stopRoot = quoteRoot.closest(stopRootSelector);
    if (!(stopRoot instanceof HTMLElement)) {
      return { gap: 0, nextBlock: null as HTMLElement | null };
    }

    const nextBlock = findNextFlowBlock(quoteRoot, stopRoot);
    if (!(nextBlock instanceof HTMLElement)) {
      return { gap: 0, nextBlock: null as HTMLElement | null };
    }

    let gapToNext = Number.NaN;
    if (nextBlock.offsetParent === quoteRoot.offsetParent) {
      gapToNext = nextBlock.offsetTop - quoteRoot.offsetTop - quoteRoot.offsetHeight;
    } else {
      const quoteRect = quoteRoot.getBoundingClientRect();
      const nextRect = nextBlock.getBoundingClientRect();
      gapToNext = nextRect.top - quoteRect.bottom;
    }

    if (!Number.isFinite(gapToNext)) {
      return { gap: 0, nextBlock };
    }

    return { gap: Math.max(0, gapToNext), nextBlock };
  };

  const resolveLastWordRectInQuote = (textRoot: HTMLElement, quoteRect: DOMRect) => {
    const walker = document.createTreeWalker(textRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!(node instanceof Text)) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent && node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    let lastTextNode: Text | null = null;
    while (walker.nextNode()) {
      lastTextNode = walker.currentNode as Text;
    }

    if (!(lastTextNode instanceof Text)) {
      return null;
    }

    const textContent = lastTextNode.textContent ?? '';
    const match = textContent.match(/(\S+)\s*$/);
    if (!match) {
      return null;
    }

    const token = match[1];
    const tokenEnd = textContent.lastIndexOf(token) + token.length;
    const tokenStart = tokenEnd - token.length;
    if (tokenStart < 0 || tokenEnd <= tokenStart) {
      return null;
    }

    const range = document.createRange();
    range.setStart(lastTextNode, tokenStart);
    range.setEnd(lastTextNode, tokenEnd);
    const rect = range.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    return {
      right: rect.right - quoteRect.left,
      bottom: rect.bottom - quoteRect.top,
    };
  };

  const resolveFirstWordRectInQuote = (textRoot: HTMLElement, quoteRect: DOMRect) => {
    const walker = document.createTreeWalker(textRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!(node instanceof Text)) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent && node.textContent.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (!(textNode instanceof Text)) {
        continue;
      }
      const textContent = textNode.textContent ?? '';
      const match = textContent.match(/\S+/);
      if (!match) {
        continue;
      }

      const token = match[0];
      const tokenStart = textContent.indexOf(token);
      const tokenEnd = tokenStart + token.length;
      if (tokenStart < 0 || tokenEnd <= tokenStart) {
        continue;
      }

      const range = document.createRange();
      range.setStart(textNode, tokenStart);
      range.setEnd(textNode, tokenEnd);
      const rect = range.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        continue;
      }

      return {
        left: rect.left - quoteRect.left,
        top: rect.top - quoteRect.top,
      };
    }

    return null;
  };

  const syncMainQuoteClosePosition = (mainQuoteText: HTMLElement, quoteRoot: HTMLElement, closeMark: HTMLElement) => {
    if (!isHomeRoute()) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const wordNodes = Array.from(mainQuoteText.querySelectorAll<HTMLElement>('[data-motion-word]')).filter(
      (node) => node instanceof HTMLElement,
    );
    const lastWordNode = wordNodes.at(-1);
    if (!(lastWordNode instanceof HTMLElement)) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const quoteRect = quoteRoot.getBoundingClientRect();
    const closeRect = closeMark.getBoundingClientRect();
    if (quoteRect.width <= 0 || quoteRect.height <= 0 || closeRect.width <= 0 || closeRect.height <= 0) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const canUseOffsetLayout = lastWordNode.offsetParent === quoteRoot;
    const lastWordRect = canUseOffsetLayout ? null : lastWordNode.getBoundingClientRect();

    const lastWordRight = canUseOffsetLayout
      ? lastWordNode.offsetLeft + lastWordNode.offsetWidth
      : (lastWordRect as DOMRect).right - quoteRect.left;
    const lastWordBottom = canUseOffsetLayout
      ? lastWordNode.offsetTop + lastWordNode.offsetHeight
      : (lastWordRect as DOMRect).bottom - quoteRect.top;

    const desiredLeft = lastWordRight + 4;
    const maxLeft = Math.max(0, quoteRect.width - closeRect.width);
    const clampedLeft = Math.min(maxLeft, Math.max(0, desiredLeft));
    const desiredTop = lastWordBottom + 9 - closeRect.height;
    const { gap: gapToNext } = resolveQuoteGapToNextFlowBlock(quoteRoot, '.quotes-section-text');
    const maxTop = Math.max(0, quoteRect.height - closeRect.height + gapToNext);
    const clampedTop = Math.min(maxTop, Math.max(0, desiredTop));

    closeMark.style.left = `${clampedLeft}px`;
    closeMark.style.top = `${clampedTop}px`;
  };

  const syncSecondaryQuoteClosePosition = (textRoot: HTMLElement, quoteRoot: HTMLElement, closeMark: HTMLElement) => {
    if (!isHomeRoute()) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const quoteRect = quoteRoot.getBoundingClientRect();
    const closeRect = closeMark.getBoundingClientRect();
    if (quoteRect.width <= 0 || quoteRect.height <= 0 || closeRect.width <= 0 || closeRect.height <= 0) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const lastWord = resolveLastWordRectInQuote(textRoot, quoteRect);
    if (!lastWord) {
      clearQuoteMarkPosition(closeMark);
      return;
    }

    const desiredLeft = lastWord.right + 4;
    const maxLeft = Math.max(0, quoteRect.width - closeRect.width);
    const clampedLeft = Math.min(maxLeft, Math.max(0, desiredLeft));
    const desiredTop = lastWord.bottom + 4 - closeRect.height;
    const { gap: gapToNext } = resolveQuoteGapToNextFlowBlock(quoteRoot, '.quotes-section');
    const maxTop = Math.max(0, quoteRect.height - closeRect.height + gapToNext);
    const clampedTop = Math.min(maxTop, Math.max(0, desiredTop));

    closeMark.style.left = `${clampedLeft}px`;
    closeMark.style.top = `${clampedTop}px`;
  };

  const syncMainQuoteOpenPosition = (mainQuoteText: HTMLElement, quoteRoot: HTMLElement, openMark: HTMLElement) => {
    if (!isHomeRoute()) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const quoteRect = quoteRoot.getBoundingClientRect();
    const openRect = openMark.getBoundingClientRect();
    if (quoteRect.width <= 0 || quoteRect.height <= 0 || openRect.width <= 0 || openRect.height <= 0) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const firstWord = resolveFirstWordRectInQuote(mainQuoteText, quoteRect);
    if (!firstWord) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const desiredLeft = firstWord.left - openRect.width - 3;
    const minLeft = -openRect.width - 3;
    const maxLeft = quoteRect.width - openRect.width;
    const clampedLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));
    const desiredTop = firstWord.top - 21;
    const maxTop = Math.max(0, quoteRect.height - openRect.height);
    const clampedTop = Math.min(maxTop, Math.max(0, desiredTop));

    openMark.style.left = `${clampedLeft}px`;
    openMark.style.top = `${clampedTop}px`;
  };

  const syncSecondaryQuoteOpenPosition = (textRoot: HTMLElement, quoteRoot: HTMLElement, openMark: HTMLElement) => {
    if (!isHomeRoute()) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const quoteRect = quoteRoot.getBoundingClientRect();
    const openRect = openMark.getBoundingClientRect();
    if (quoteRect.width <= 0 || quoteRect.height <= 0 || openRect.width <= 0 || openRect.height <= 0) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const firstWord = resolveFirstWordRectInQuote(textRoot, quoteRect);
    if (!firstWord) {
      clearQuoteMarkPosition(openMark);
      return;
    }

    const desiredLeft = firstWord.left - openRect.width;
    const minLeft = -openRect.width;
    const maxLeft = quoteRect.width - openRect.width;
    const clampedLeft = Math.min(maxLeft, Math.max(minLeft, desiredLeft));
    const desiredTop = firstWord.top - 6;
    const maxTop = Math.max(0, quoteRect.height - openRect.height);
    const clampedTop = Math.min(maxTop, Math.max(0, desiredTop));

    openMark.style.left = `${clampedLeft}px`;
    openMark.style.top = `${clampedTop}px`;
  };

  const mountMainQuoteCloseAutoAlign = (element: HTMLElement) => {
    if (!element.matches('.quotes-main-quote-text')) {
      return () => {};
    }

    const quoteRoot = element.closest('.quotes-main-quote');
    if (!(quoteRoot instanceof HTMLElement)) {
      return () => {};
    }

    const closeMark = quoteRoot.querySelector('.quotes-mark--main-close');
    if (!(closeMark instanceof HTMLElement)) {
      return () => {};
    }

    const sync = () => {
      syncMainQuoteClosePosition(element, quoteRoot, closeMark);
    };

    sync();

    const handleResize = () => {
      sync();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        sync();
      });
      resizeObserver.observe(element);
      resizeObserver.observe(quoteRoot);
      resizeObserver.observe(closeMark);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      clearQuoteMarkPosition(closeMark);
    };
  };

  const mountSecondaryQuotesCloseAutoAlign = (element: HTMLElement) => {
    if (!element.matches('.quotes-main-quote-text')) {
      return () => {};
    }

    const quotesSection = element.closest('.quotes-section');
    if (!(quotesSection instanceof HTMLElement)) {
      return () => {};
    }

    const alignConfigs = [
      {
        textRoot: quotesSection.querySelector('.quotes-card--left .quotes-copy'),
        quoteRoot: quotesSection.querySelector('.quotes-card--left'),
        closeMark: quotesSection.querySelector('.quotes-mark--left-close'),
      },
      {
        textRoot: quotesSection.querySelector('.quotes-card--right .quotes-copy--right'),
        quoteRoot: quotesSection.querySelector('.quotes-card--right'),
        closeMark: quotesSection.querySelector('.quotes-mark--right-close'),
      },
    ].filter(
      (config) =>
        config.textRoot instanceof HTMLElement &&
        config.quoteRoot instanceof HTMLElement &&
        config.closeMark instanceof HTMLElement,
    ) as Array<{
      textRoot: HTMLElement;
      quoteRoot: HTMLElement;
      closeMark: HTMLElement;
    }>;

    if (alignConfigs.length === 0) {
      return () => {};
    }

    const sync = () => {
      alignConfigs.forEach((config) => {
        syncSecondaryQuoteClosePosition(config.textRoot, config.quoteRoot, config.closeMark);
      });
    };

    sync();

    const handleResize = () => {
      sync();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        sync();
      });
      alignConfigs.forEach((config) => {
        resizeObserver?.observe(config.textRoot);
        resizeObserver?.observe(config.quoteRoot);
        resizeObserver?.observe(config.closeMark);
        const { nextBlock } = resolveQuoteGapToNextFlowBlock(config.quoteRoot, '.quotes-section');
        if (nextBlock instanceof HTMLElement) {
          resizeObserver?.observe(nextBlock);
        }
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      alignConfigs.forEach((config) => {
        clearQuoteMarkPosition(config.closeMark);
      });
    };
  };

  const mountMainQuoteOpenAutoAlign = (element: HTMLElement) => {
    if (!element.matches('.quotes-main-quote-text')) {
      return () => {};
    }

    const quoteRoot = element.closest('.quotes-main-quote');
    if (!(quoteRoot instanceof HTMLElement)) {
      return () => {};
    }

    const openMark = quoteRoot.querySelector('.quotes-mark--main-open');
    if (!(openMark instanceof HTMLElement)) {
      return () => {};
    }

    const sync = () => {
      syncMainQuoteOpenPosition(element, quoteRoot, openMark);
    };

    sync();

    const handleResize = () => {
      sync();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        sync();
      });
      resizeObserver.observe(element);
      resizeObserver.observe(quoteRoot);
      resizeObserver.observe(openMark);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      clearQuoteMarkPosition(openMark);
    };
  };

  const mountSecondaryQuotesOpenAutoAlign = (element: HTMLElement) => {
    if (!element.matches('.quotes-main-quote-text')) {
      return () => {};
    }

    const quotesSection = element.closest('.quotes-section');
    if (!(quotesSection instanceof HTMLElement)) {
      return () => {};
    }

    const alignConfigs = [
      {
        textRoot: quotesSection.querySelector('.quotes-card--left .quotes-copy'),
        quoteRoot: quotesSection.querySelector('.quotes-card--left'),
        openMark: quotesSection.querySelector('.quotes-card--left .quotes-mark--small-open'),
      },
      {
        textRoot: quotesSection.querySelector('.quotes-card--right .quotes-copy--right'),
        quoteRoot: quotesSection.querySelector('.quotes-card--right'),
        openMark: quotesSection.querySelector('.quotes-card--right .quotes-mark--small-open'),
      },
    ].filter(
      (config) =>
        config.textRoot instanceof HTMLElement &&
        config.quoteRoot instanceof HTMLElement &&
        config.openMark instanceof HTMLElement,
    ) as Array<{
      textRoot: HTMLElement;
      quoteRoot: HTMLElement;
      openMark: HTMLElement;
    }>;

    if (alignConfigs.length === 0) {
      return () => {};
    }

    const sync = () => {
      alignConfigs.forEach((config) => {
        syncSecondaryQuoteOpenPosition(config.textRoot, config.quoteRoot, config.openMark);
      });
    };

    sync();

    const handleResize = () => {
      sync();
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        sync();
      });
      alignConfigs.forEach((config) => {
        resizeObserver?.observe(config.textRoot);
        resizeObserver?.observe(config.quoteRoot);
        resizeObserver?.observe(config.openMark);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      alignConfigs.forEach((config) => {
        clearQuoteMarkPosition(config.openMark);
      });
    };
  };

  const resolveStaggerChildren = (element: HTMLElement, preset: RuntimePreset) => {
    const resolveMotionTransform = (node: HTMLElement | SVGElement) => {
      if (!preset.sideAware) {
        return {
          initialTransform: preset.initialTransform ?? '',
          finalTransform: preset.finalTransform ?? '',
        };
      }

      const side = node.dataset.motionStageSide?.trim().toLowerCase();
      if (side === 'left') {
        return {
          initialTransform: 'translate3d(25px, 0px, 0px) scale(0.9)',
          finalTransform: 'translate3d(0px, 0px, 0px) scale(1)',
        };
      }
      if (side === 'right') {
        return {
          initialTransform: 'translate3d(-25px, 0px, 0px) scale(0.9)',
          finalTransform: 'translate3d(0px, 0px, 0px) scale(1)',
        };
      }

      return {
        initialTransform: preset.initialTransform ?? '',
        finalTransform: preset.finalTransform ?? '',
      };
    };

    const selectorForChildren =
      typeof preset.childSelector === 'string' && preset.childSelector.trim()
        ? preset.childSelector
        : '[data-motion-stagger-item]';
    const childNodes = Array.from(element.querySelectorAll(selectorForChildren)).filter(isMotionNode);
    return childNodes
      .map((node, domIndex) => {
        const explicitIndex = readDataInt(node, 'motionStaggerIndex', Number.NaN);
        const order = Number.isFinite(explicitIndex) ? explicitIndex : domIndex;
        const baseTransform = resolveBaseTransform(node);
        const motionTransform = resolveMotionTransform(node);
        return {
          node,
          order,
          domIndex,
          initialTransform: composeTransform(baseTransform, motionTransform.initialTransform),
          finalTransform: composeTransform(baseTransform, motionTransform.finalTransform),
        };
      })
      .sort((left, right) => {
        if (left.order !== right.order) {
          return left.order - right.order;
        }
        return left.domIndex - right.domIndex;
      });
  };

  const setStaggerChildrenInitial = (
    childStates: Array<{ node: MotionNode; initialTransform: string; finalTransform: string }>,
  ) => {
    childStates.forEach(({ node, initialTransform }) => {
      node.style.opacity = '0';
      node.style.transform = initialTransform;
    });
  };

  const setStaggerChildrenFinal = (
    childStates: Array<{ node: MotionNode; initialTransform: string; finalTransform: string }>,
  ) => {
    childStates.forEach(({ node, finalTransform }) => {
      node.style.opacity = '1';
      node.style.transform = finalTransform;
    });
  };

  const hasRenderableBox = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return true;
    }
    const rects = Array.from(element.getClientRects());
    return rects.some((clientRect) => clientRect.width > 0 && clientRect.height > 0);
  };

  const mountStaggerChildrenElement = (element: HTMLElement, preset: RuntimePreset) => {
    const childStates = resolveStaggerChildren(element, preset);
    const sequenceAfterId = element.dataset.motionSequenceAfter ?? '';
    const sequenceSourceId = element.dataset.motionSequenceSource ?? '';
    let removeSequenceListener: (() => void) | null = null;

    const cleanupSequenceListener = () => {
      if (!removeSequenceListener) {
        return;
      }
      removeSequenceListener();
      removeSequenceListener = null;
    };

    const start = async (target: MotionNode) => {
      if (!isMotionNode(target)) {
        return;
      }
      if (target.dataset.motionInviewAnimated === 'true') {
        return;
      }

      const shouldAwaitRouteTransition = routeGate.shouldAwaitCaseSwitcherIntro(target, prefersReducedMotion.matches);

      if (shouldAwaitRouteTransition) {
        await routeGate.waitForRouteTransitionEnd();
        routeGate.clearIntroSyncMarker();
        if (!document.contains(target)) {
          cleanupSequenceListener();
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          cleanupSequenceListener();
          return;
        }
        setStaggerChildrenInitial(childStates);
      }

      target.dataset.motionInviewAnimated = 'true';

      if (prefersReducedMotion.matches) {
        if (target instanceof HTMLElement && target.dataset.motionAwaitRouteTransition === 'case-switcher-intro') {
          routeGate.clearIntroSyncMarker();
        }
        setStaggerChildrenFinal(childStates);
        emitSequenceComplete(sequenceSourceId);
        cleanupSequenceListener();
        return;
      }

      if (childStates.length === 0) {
        emitSequenceComplete(sequenceSourceId);
        cleanupSequenceListener();
        return;
      }

      let pending = childStates.length;
      childStates.forEach((state, index) => {
        animate(
          state.node,
          {
            opacity: [0, 1],
            transform: [state.initialTransform, state.finalTransform],
          },
          {
            ...preset.transition,
            delay: index * (preset.childDelay ?? 0),
            onComplete: () => {
              pending -= 1;
              if (pending === 0) {
                emitSequenceComplete(sequenceSourceId);
                cleanupSequenceListener();
              }
            },
          },
        );
      });
    };

    if (!prefersReducedMotion.matches) {
      setStaggerChildrenInitial(childStates);
      if (!hasRenderableBox(element)) {
        element.dataset.motionInviewAnimated = 'true';
        setStaggerChildrenFinal(childStates);
        emitSequenceComplete(sequenceSourceId);
        return;
      }
    }

    const stopInView = inView(
      element,
      (target) => {
        if (!isMotionNode(target)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }
        if (!sequenceAfterId || completedSequences.has(sequenceAfterId)) {
          void start(target);
          return;
        }
        if (!removeSequenceListener) {
          removeSequenceListener = onSequenceComplete(sequenceAfterId, () => {
            void start(target);
          });
        }
      },
      { amount: preset.amount ?? 0 },
    );

    observerRegistry.register(element, () => {
      stopInView();
      cleanupSequenceListener();
    });
  };

  const mountPerCharElement = (element: HTMLElement, preset: RuntimePreset) => {
    const charNodes = ensurePerCharNodes(element);
    if (prefersReducedMotion.matches) {
      element.dataset.motionInviewAnimated = 'true';
      setPerCharFinal(charNodes, preset);
      return;
    }

    setPerCharInitial(charNodes, preset);
    const rowIndex = readDataInt(element, 'motionRowIndex', 0);
    const rowDelay = Number.isFinite(rowIndex) && rowIndex > 0 ? rowIndex * (preset.rowDelayStep ?? 0) : 0;

    const stop = inView(
      element,
      (target) => {
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }

        target.dataset.motionInviewAnimated = 'true';
        const targetChars = Array.from(target.querySelectorAll<HTMLElement>('[data-motion-char]'));
        targetChars.forEach((charNode, index) => {
          animate(
            charNode,
            {
              opacity: [0, 1],
              transform: [preset.initialTransform ?? '', preset.finalTransform ?? ''],
            },
            {
              ...preset.transition,
              delay: rowDelay + index * (preset.charDelay ?? 0),
            },
          );
        });
      },
      { amount: 0 },
    );
    observerRegistry.register(element, stop);
  };

  const mountPerWordElement = (element: HTMLElement, preset: RuntimePreset) => {
    const wordNodes = ensurePerWordNodes(element);
    const stopMainQuoteCloseAutoAlign = mountMainQuoteCloseAutoAlign(element);
    const stopSecondaryQuotesCloseAutoAlign = mountSecondaryQuotesCloseAutoAlign(element);
    const stopMainQuoteOpenAutoAlign = mountMainQuoteOpenAutoAlign(element);
    const stopSecondaryQuotesOpenAutoAlign = mountSecondaryQuotesOpenAutoAlign(element);
    const sequenceId = element.dataset.motionSequenceSource ?? '';
    if (prefersReducedMotion.matches) {
      element.dataset.motionInviewAnimated = 'true';
      setPerWordFinal(wordNodes, preset);
      emitSequenceComplete(sequenceId);
      observerRegistry.register(element, () => {
        stopMainQuoteCloseAutoAlign();
        stopSecondaryQuotesCloseAutoAlign();
        stopMainQuoteOpenAutoAlign();
        stopSecondaryQuotesOpenAutoAlign();
      });
      return;
    }

    setPerWordInitial(wordNodes, preset);
    const stop = inView(
      element,
      (target) => {
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }

        target.dataset.motionInviewAnimated = 'true';
        const targetWords = Array.from(target.querySelectorAll<HTMLElement>('[data-motion-word]'));
        let pending = targetWords.length;
        if (pending === 0) {
          emitSequenceComplete(sequenceId);
          return;
        }
        targetWords.forEach((wordNode, index) => {
          animate(
            wordNode,
            {
              opacity: [0, 1],
              transform: [preset.initialTransform ?? '', preset.finalTransform ?? ''],
            },
            {
              ...preset.transition,
              delay: index * (preset.wordDelay ?? 0),
              onComplete: () => {
                pending -= 1;
                if (pending === 0) {
                  emitSequenceComplete(sequenceId);
                }
              },
            },
          );
        });
      },
      { amount: 0 },
    );
    observerRegistry.register(element, () => {
      stop();
      stopMainQuoteCloseAutoAlign();
      stopSecondaryQuotesCloseAutoAlign();
      stopMainQuoteOpenAutoAlign();
      stopSecondaryQuotesOpenAutoAlign();
    });
  };

  const ensureTrimPath = (element: MotionNode) => {
    const path = element.querySelector('[data-motion-trim-path]');
    if (!(path instanceof SVGPathElement)) {
      return null;
    }
    const totalLength = path.getTotalLength();
    return { path, totalLength };
  };

  const setTrimInitial = (trimState: { path: SVGPathElement; totalLength: number }) => {
    trimState.path.style.strokeDasharray = `${trimState.totalLength}`;
    trimState.path.style.strokeDashoffset = `${trimState.totalLength}`;
  };

  const setTrimFinal = (trimState: { path: SVGPathElement; totalLength: number }) => {
    trimState.path.style.strokeDasharray = `${trimState.totalLength}`;
    trimState.path.style.strokeDashoffset = '0';
  };

  const mountPathTrimElement = (element: MotionNode, preset: RuntimePreset) => {
    const trimState = ensureTrimPath(element);
    if (!trimState) {
      return;
    }
    if (prefersReducedMotion.matches) {
      element.dataset.motionInviewAnimated = 'true';
      setTrimFinal(trimState);
      return;
    }

    setTrimInitial(trimState);
    const stop = inView(
      element,
      (target) => {
        if (!isMotionNode(target)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }

        target.dataset.motionInviewAnimated = 'true';
        const targetState = ensureTrimPath(target);
        if (!targetState) {
          return;
        }
        animate(targetState.totalLength, 0, {
          ...preset.transition,
          onUpdate: (latest) => {
            targetState.path.style.strokeDashoffset = `${latest}`;
          },
        });
      },
      { amount: preset.amount ?? 0 },
    );
    observerRegistry.register(element, stop);
  };

  const mountElementPreset = (element: MotionNode, preset: RuntimePreset) => {
    const baseTransform = resolveBaseTransform(element);
    const initialTransform = composeTransform(baseTransform, preset.initialTransform ?? '');
    const finalTransform = composeTransform(baseTransform, preset.finalTransform ?? '');
    const sequenceAfterId = element.dataset.motionSequenceAfter ?? '';
    const sequenceSourceId = element.dataset.motionSequenceSource ?? '';
    let removeSequenceListener: (() => void) | null = null;

    const cleanupSequenceListener = () => {
      if (!removeSequenceListener) {
        return;
      }
      removeSequenceListener();
      removeSequenceListener = null;
    };

    const start = async (target: MotionNode) => {
      if (!isMotionNode(target)) {
        return;
      }
      if (target.dataset.motionInviewAnimated === 'true') {
        return;
      }

      const shouldAwaitRouteTransition = routeGate.shouldAwaitCaseSwitcherIntro(target, prefersReducedMotion.matches);

      if (shouldAwaitRouteTransition) {
        await routeGate.waitForRouteTransitionEnd();
        routeGate.clearIntroSyncMarker();
        if (!document.contains(target)) {
          cleanupSequenceListener();
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          cleanupSequenceListener();
          return;
        }
        setInitial(target, initialTransform);
      }

      target.dataset.motionInviewAnimated = 'true';
      animate(
        target,
        {
          opacity: [0, 1],
          transform: [initialTransform, finalTransform],
        },
        {
          ...preset.transition,
          onComplete: () => {
            emitSequenceComplete(sequenceSourceId);
            cleanupSequenceListener();
          },
        },
      );
    };

    if (prefersReducedMotion.matches) {
      element.dataset.motionInviewAnimated = 'true';
      if (element.dataset.motionAwaitRouteTransition === 'case-switcher-intro') {
        routeGate.clearIntroSyncMarker();
      }
      setFinal(element, finalTransform);
      emitSequenceComplete(sequenceSourceId);
      cleanupSequenceListener();
      return;
    }

    setInitial(element, initialTransform);
    const stopInView = inView(
      element,
      (target) => {
        if (!isMotionNode(target)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }
        if (!sequenceAfterId || completedSequences.has(sequenceAfterId)) {
          void start(target);
          return;
        }
        if (!removeSequenceListener) {
          removeSequenceListener = onSequenceComplete(sequenceAfterId, () => {
            void start(target);
          });
        }
      },
      { amount: 0 },
    );

    observerRegistry.register(element, () => {
      stopInView();
      cleanupSequenceListener();
    });
  };

  const mountSequencedElement = (element: MotionNode, preset: RuntimePreset) => {
    const baseTransform = resolveBaseTransform(element);
    const initialTransform = composeTransform(baseTransform, preset.initialTransform ?? '');
    const finalTransform = composeTransform(baseTransform, preset.finalTransform ?? '');
    const sequenceId = element.dataset.motionSequenceAfter ?? '';

    if (prefersReducedMotion.matches) {
      element.dataset.motionInviewAnimated = 'true';
      setFinal(element, finalTransform);
      return;
    }

    setInitial(element, initialTransform);
    let removeSequenceListener: (() => void) | null = null;

    const start = (target: MotionNode) => {
      if (!isMotionNode(target)) {
        return;
      }
      if (target.dataset.motionInviewAnimated === 'true') {
        return;
      }
      target.dataset.motionInviewAnimated = 'true';
      animate(
        target,
        {
          opacity: [0, 1],
          transform: [initialTransform, finalTransform],
        },
        preset.transition,
      );
      if (removeSequenceListener) {
        removeSequenceListener();
        removeSequenceListener = null;
      }
    };

    const stopInView = inView(
      element,
      (target) => {
        if (!isMotionNode(target)) {
          return;
        }
        if (target.dataset.motionInviewAnimated === 'true') {
          return;
        }
        if (!sequenceId || completedSequences.has(sequenceId)) {
          start(target);
          return;
        }
        if (!removeSequenceListener) {
          removeSequenceListener = onSequenceComplete(sequenceId, () => {
            start(target);
          });
        }
      },
      { amount: 0 },
    );

    observerRegistry.register(element, () => {
      stopInView();
      if (removeSequenceListener) {
        removeSequenceListener();
        removeSequenceListener = null;
      }
    });
  };

  const mountRepeatElement = (element: HTMLElement, preset: RuntimePreset) => {
    const baseInitialVariables = { ...(preset.initialVariables ?? {}) };
    const baseFinalVariables = { ...(preset.finalVariables ?? {}) };
    let initialVariables = baseInitialVariables;
    let finalVariables = baseFinalVariables;
    let variableNames = Array.from(new Set([...Object.keys(initialVariables), ...Object.keys(finalVariables)]));
    const triggerRatio = preset.amount ?? 0;
    let activeAnimation: { stop?: () => void } | null = null;
    let currentState: 'initial' | 'final' = 'initial';
    let lastTop = 0;
    let frameId = 0;

    const syncResolvedVariables = () => {
      const resolved = typeof preset.resolveVariables === 'function' ? preset.resolveVariables(element) : null;
      initialVariables = { ...(resolved?.initialVariables ?? baseInitialVariables) };
      finalVariables = { ...(resolved?.finalVariables ?? baseFinalVariables) };
      variableNames = Array.from(new Set([...Object.keys(initialVariables), ...Object.keys(finalVariables)]));
    };

    const stopActiveAnimation = () => {
      if (!activeAnimation || typeof activeAnimation.stop !== 'function') {
        activeAnimation = null;
        return;
      }
      activeAnimation.stop();
      activeAnimation = null;
    };

    const animateVariables = (fromVariables: Record<string, string>, toVariables: Record<string, string>) => {
      stopActiveAnimation();
      activeAnimation = animate(0, 1, {
        ...preset.transition,
        onUpdate: (latest) => {
          variableNames.forEach((name) => {
            const fromValue = fromVariables[name] ?? toVariables[name] ?? '';
            const toValue = toVariables[name] ?? fromVariables[name] ?? '';
            const interpolated = interpolateNumericValue(fromValue, toValue, latest);
            element.style.setProperty(name, interpolated);
          });
        },
        onComplete: () => {
          setCssVariables(element, toVariables);
          activeAnimation = null;
        },
      }) as { stop?: () => void };
    };

    const animateToState = (nextState: 'initial' | 'final') => {
      if (nextState === currentState) {
        return;
      }
      const fromVariables = currentState === 'initial' ? initialVariables : finalVariables;
      const toVariables = nextState === 'initial' ? initialVariables : finalVariables;
      currentState = nextState;
      animateVariables(fromVariables, toVariables);
    };

    const getTriggerLineY = () => window.innerHeight * (1 - triggerRatio);

    const syncImmediateState = () => {
      syncResolvedVariables();
      const triggerLineY = getTriggerLineY();
      const top = element.getBoundingClientRect().top;
      lastTop = top;
      if (top <= triggerLineY) {
        currentState = 'final';
        setCssVariables(element, finalVariables);
        return;
      }
      currentState = 'initial';
      setCssVariables(element, initialVariables);
    };

    const evaluateCrossing = () => {
      frameId = 0;
      const triggerLineY = getTriggerLineY();
      const nextTop = element.getBoundingClientRect().top;

      const crossedDown = lastTop > triggerLineY && nextTop <= triggerLineY;
      if (crossedDown) {
        animateToState('final');
        lastTop = nextTop;
        return;
      }

      const crossedUp = lastTop <= triggerLineY && nextTop > triggerLineY;
      if (crossedUp) {
        animateToState('initial');
      }
      lastTop = nextTop;
    };

    const queueEvaluateCrossing = () => {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(evaluateCrossing);
    };

    if (prefersReducedMotion.matches) {
      currentState = 'final';
      setCssVariables(element, finalVariables);
      return;
    }

    syncImmediateState();
    window.addEventListener('scroll', queueEvaluateCrossing, { passive: true });
    window.addEventListener('resize', syncImmediateState);

    observerRegistry.register(element, () => {
      window.removeEventListener('scroll', queueEvaluateCrossing);
      window.removeEventListener('resize', syncImmediateState);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      stopActiveAnimation();
    });
  };

  const mountElement = (element: Element) => {
    if (!isMotionNode(element)) {
      return;
    }
    const presetName = element.dataset.motionInview;
    const preset = presetName ? (presets[presetName] as RuntimePreset | undefined) : undefined;
    if (!preset) {
      return;
    }
    if (element.dataset.motionInviewBound === 'true') {
      return;
    }
    element.dataset.motionInviewBound = 'true';
    if (preset.mode === 'per-char') {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      mountPerCharElement(element, preset);
      return;
    }
    if (preset.mode === 'per-word') {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      mountPerWordElement(element, preset);
      return;
    }
    if (preset.mode === 'path-trim') {
      mountPathTrimElement(element, preset);
      return;
    }
    if (preset.mode === 'element-sequenced') {
      mountSequencedElement(element, preset);
      return;
    }
    if (preset.mode === 'element-repeat') {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      mountRepeatElement(element, preset);
      return;
    }
    if (preset.mode === 'stagger-children') {
      if (!(element instanceof HTMLElement)) {
        return;
      }
      mountStaggerChildrenElement(element, preset);
      return;
    }
    mountElementPreset(element, preset);
  };

  const mount = () => {
    observerRegistry.cleanupDisconnected();
    document.querySelectorAll(selector).forEach((element) => {
      mountElement(element);
    });
  };

  const stopAll = () => {
    observerRegistry.stopAll();
  };

  return {
    mount,
    stopAll,
  };
};
