import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const waitForLayoutReadiness = async (page: import('@playwright/test').Page) => {
  await page.evaluate(async () => {
    if (document.fonts && 'ready' in document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // Ignore if fonts API fails in restricted environment.
      }
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
};

test.describe('Mobile home adaptive', () => {
  test('footer keeps desktop structure on mobile with gap 12 and preserves desktop gap 148', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto('/');

    const mobileFooterSnapshot = await page.evaluate(() => {
      const track = document.querySelector('.site-footer-track');
      const leftSide = document.querySelector('.site-footer-side');
      const copy = document.querySelector('.site-footer-copy');
      if (!(track instanceof HTMLElement) || !(leftSide instanceof HTMLElement) || !(copy instanceof HTMLElement)) {
        return null;
      }

      const trackStyle = getComputedStyle(track);
      const sideStyle = getComputedStyle(leftSide);
      const copyStyle = getComputedStyle(copy);

      return {
        trackGap: trackStyle.gap,
        trackColumnGap: trackStyle.columnGap,
        sideDisplay: sideStyle.display,
        copyFontSize: copyStyle.fontSize,
        copyLineHeight: copyStyle.lineHeight,
      };
    });

    expect(mobileFooterSnapshot).not.toBeNull();
    expect(mobileFooterSnapshot!.trackColumnGap).toBe('12px');
    expect(mobileFooterSnapshot!.sideDisplay).toBe('flex');
    expect(mobileFooterSnapshot!.copyFontSize).toBe('32px');
    expect(mobileFooterSnapshot!.copyLineHeight).toBe('35px');

    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto('/');

    const desktopFooterGap = await page.evaluate(() => {
      const track = document.querySelector('.site-footer-track');
      if (!(track instanceof HTMLElement)) {
        return null;
      }
      return {
        gap: getComputedStyle(track).gap,
        columnGap: getComputedStyle(track).columnGap,
      };
    });

    expect(desktopFooterGap).not.toBeNull();
    expect(desktopFooterGap!.columnGap).toBe('148px');
  });

  test('390x844 renders real home sections and keeps temporary shell hidden', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.home-hero-mobile')).toBeVisible();
    await expect(page.locator('.home-hero')).toBeHidden();
    await expect(page.locator('.home-hero-mobile [data-temp-slider]')).toBeVisible();
    await expect(page.locator('.home-hero-mobile [data-temp-slider-item]')).toHaveCount(18);
    await expect(page.locator('.cases-cards-section')).toBeVisible();
    await expect(page.locator('.design-tools-section')).toBeVisible();
    await expect(page.locator('.about-me-section')).toBeVisible();
    await expect(page.locator('.quotes-section')).toBeVisible();
    await expect(page.locator('.final-cta-section')).toBeVisible();

    const tertiarySnapshot = await page.evaluate(() => {
      const resolveTokenColor = (tokenExpression: string) => {
        const probe = document.createElement('span');
        probe.style.color = tokenExpression;
        document.body.appendChild(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      };

      const tertiaryNodes = Array.from(document.querySelectorAll('.home-hero-mobile-title--tertiary'));
      if (tertiaryNodes.length === 0) {
        return null;
      }

      const tokenColor = resolveTokenColor('var(--color-text-tertiary)');
      const nodeColors = tertiaryNodes
        .filter((node): node is HTMLElement => node instanceof HTMLElement)
        .map((node) => getComputedStyle(node).color);

      return {
        tokenColor,
        nodeColors,
      };
    });

    expect(tertiarySnapshot).not.toBeNull();
    expect(tertiarySnapshot!.nodeColors.length).toBeGreaterThan(0);
    for (const color of tertiarySnapshot!.nodeColors) {
      expect(color).toBe(tertiarySnapshot!.tokenColor);
    }
  });

  test('home main quote keeps mobile t3 with line-height 38 and preserves desktop typography', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const mobileQuoteTypography = await page.evaluate(() => {
      const quote = document.querySelector('.quotes-main-quote-text');
      if (!(quote instanceof HTMLElement)) {
        return null;
      }
      const styles = getComputedStyle(quote);
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        expectedT3Size: rootStyles.getPropertyValue('--type-t3-size').trim(),
      };
    });

    expect(mobileQuoteTypography).not.toBeNull();
    expect(mobileQuoteTypography!.fontSize).toBe(mobileQuoteTypography!.expectedT3Size);
    expect(mobileQuoteTypography!.lineHeight).toBe('38px');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const desktopQuoteTypography = await page.evaluate(() => {
      const quote = document.querySelector('.quotes-main-quote-text');
      if (!(quote instanceof HTMLElement)) {
        return null;
      }
      const styles = getComputedStyle(quote);
      const rootStyles = getComputedStyle(document.documentElement);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        expectedT2Size: rootStyles.getPropertyValue('--type-t2-size').trim(),
      };
    });

    expect(desktopQuoteTypography).not.toBeNull();
    expect(desktopQuoteTypography!.fontSize).toBe(desktopQuoteTypography!.expectedT2Size);
    expect(desktopQuoteTypography!.lineHeight).not.toBe('38px');
  });

  test('mobile home keeps sequential 144px section spacing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const spacingSnapshot = await page.evaluate(() => {
      const shell = document.querySelector('body[data-route-home="true"] .page-shell--home');
      if (!(shell instanceof HTMLElement)) {
        return null;
      }

      const readMarginTop = (selector: string) => {
        const node = shell.querySelector(`:scope > ${selector}`);
        if (!(node instanceof HTMLElement)) {
          return null;
        }
        return getComputedStyle(node).marginTop;
      };

      const finalCta = shell.querySelector(':scope > .final-cta-section');
      if (!(finalCta instanceof HTMLElement)) {
        return null;
      }

      return {
        cases: readMarginTop('.cases-cards-section'),
        designTools: readMarginTop('.design-tools-section'),
        about: readMarginTop('.about-me-section'),
        quotes: readMarginTop('.quotes-section'),
        finalCta: getComputedStyle(finalCta).marginTop,
        finalCtaBottom: getComputedStyle(finalCta).marginBottom,
      };
    });

    expect(spacingSnapshot).not.toBeNull();
    expect(spacingSnapshot!.cases).toBe('144px');
    expect(spacingSnapshot!.designTools).toBe('144px');
    expect(spacingSnapshot!.about).toBe('144px');
    expect(spacingSnapshot!.quotes).toBe('144px');
    expect(spacingSnapshot!.finalCta).toBe('144px');
    expect(spacingSnapshot!.finalCtaBottom).toBe('144px');
  });

  test('mobile home keeps 144px gap between final cta and footer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const footerGapSnapshot = await page.evaluate(() => {
      const finalSection = document.querySelector('.page-shell--home > .final-cta-section');
      const footer = document.querySelector('.site-footer');
      if (!(finalSection instanceof HTMLElement) || !(footer instanceof HTMLElement)) {
        return null;
      }

      const finalRect = finalSection.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      return {
        gap: Math.round(footerRect.top - finalRect.bottom),
      };
    });

    expect(footerGapSnapshot).not.toBeNull();
    expect(footerGapSnapshot!.gap).toBe(144);
  });

  test('hero slider container is not clipped on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const clipSnapshot = await page.evaluate(() => {
      const screens = document.querySelector('.home-hero-mobile-screens');
      const viewport = document.querySelector('.home-hero-mobile .temporary-adaptive-notice__screens-viewport');
      if (!(screens instanceof HTMLElement) || !(viewport instanceof HTMLElement)) {
        return null;
      }

      const screensStyle = getComputedStyle(screens);
      const viewportStyle = getComputedStyle(viewport);

      return {
        screensOverflowX: screensStyle.overflowX,
        screensOverflowY: screensStyle.overflowY,
        viewportOverflowX: viewportStyle.overflowX,
        viewportOverflowY: viewportStyle.overflowY,
      };
    });

    expect(clipSnapshot).not.toBeNull();
    expect(clipSnapshot!.screensOverflowY).toBe('visible');
    expect(clipSnapshot!.viewportOverflowY).toBe('visible');
  });

  test('design tools mobile uses full-width dividers and left-aligned labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('.design-tools-bottom--mobile')).toBeVisible();
    await expect(page.locator('.design-tools-bottom--desktop')).toBeHidden();

    const layoutSnapshot = await page.evaluate(() => {
      const bottom = document.querySelector('.design-tools-bottom--mobile');
      const divider = document.querySelector('.design-tools-bottom--mobile .design-tools-divider--mobile');
      const labels = Array.from(document.querySelectorAll('.design-tools-bottom--mobile .design-tools-label'));
      if (!(bottom instanceof HTMLElement) || !(divider instanceof HTMLElement) || labels.length === 0) {
        return null;
      }

      const bottomRect = bottom.getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      const labelAligns = labels
        .filter((label): label is HTMLElement => label instanceof HTMLElement)
        .map((label) => getComputedStyle(label).textAlign);

      return {
        bottomWidth: bottomRect.width,
        dividerWidth: dividerRect.width,
        labelAligns,
      };
    });

    expect(layoutSnapshot).not.toBeNull();
    expect(Math.abs(layoutSnapshot!.dividerWidth - layoutSnapshot!.bottomWidth)).toBeLessThanOrEqual(8);
    for (const align of layoutSnapshot!.labelAligns) {
      expect(align).toBe('left');
    }
  });

  test('perimeter geometry stays stable on 360/390/430/440/767', async ({ page }) => {
    for (const width of [360, 390, 430, 440, 767]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const geometry = await page.evaluate(() => {
        const selectors = [
          '.case-card-cover[data-quantized-perimeter]',
          '.cases-more-card[data-quantized-perimeter]',
          '.about-me-section[data-quantized-perimeter]',
        ];
        const read = (selector: string) => {
          const node = document.querySelector(selector);
          if (!(node instanceof HTMLElement) || !(node.parentElement instanceof HTMLElement)) {
            return null;
          }
          const rect = node.getBoundingClientRect();
          const parentRect = node.parentElement.getBoundingClientRect();
          const step = Number.parseFloat(node.dataset.perimeterStep ?? '');
          return {
            selector,
            width: rect.width,
            height: rect.height,
            parentWidth: parentRect.width,
            step,
            widthFitsParent: rect.width <= parentRect.width + 1,
            heightMatchesStep:
              Number.isFinite(step) && step > 0
                ? (() => {
                    const remainder = Math.abs(rect.height % step);
                    const distanceToMultiple = Math.min(remainder, Math.abs(step - remainder));
                    return distanceToMultiple <= 1.5;
                  })()
                : false,
          };
        };
        const entries = selectors.map(read).filter((item): item is NonNullable<ReturnType<typeof read>> => item !== null);
        return {
          entries,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      expect(geometry.entries.length).toBe(3);
      expect(geometry.hasHorizontalOverflow).toBe(false);
      for (const entry of geometry.entries) {
        expect(entry.step).toBeGreaterThanOrEqual(30);
        expect(entry.step).toBeLessThanOrEqual(45);
        expect(entry.width).toBeGreaterThan(0);
        expect(entry.height).toBeGreaterThan(0);
        expect(entry.widthFitsParent).toBe(true);
        expect(entry.heightMatchesStep).toBe(true);
      }
    }
  });

  test('mobile home content stays centered and without horizontal drift', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const centered = await page.evaluate(() => {
      const viewportCenter = window.innerWidth / 2;
      const selectors = [
        '.site-header-inner',
        '.page-shell--home',
        '.home-hero-mobile',
        '.cases-cards-section',
        '.design-tools-section',
      ];

      const centers = selectors
        .map((selector) => {
          const node = document.querySelector(selector);
          if (!(node instanceof HTMLElement)) {
            return null;
          }
          const rect = node.getBoundingClientRect();
          return {
            selector,
            delta: Math.abs(rect.left + rect.width / 2 - viewportCenter),
          };
        })
        .filter((entry): entry is { selector: string; delta: number } => entry !== null);

      return {
        centers,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    expect(centered.hasHorizontalOverflow).toBe(false);
    expect(centered.centers).toHaveLength(5);
    for (const entry of centered.centers) {
      expect(entry.delta).toBeLessThanOrEqual(1);
    }
  });

  test('about hero and arch stay centered, height tracks content by D, and scallops stay square', async ({ page }) => {
    for (const width of [360, 390, 430, 440, 767]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await waitForLayoutReadiness(page);

      const aboutSnapshot = await page.evaluate(() => {
        const hero = document.querySelector('.about-me-hero');
        const arch = document.querySelector('.about-me-arch');
        const aboutSection = document.querySelector('.about-me-section[data-quantized-perimeter]');
        const aboutContent = document.querySelector('.about-me-section .scallop-content');
        if (
          !(hero instanceof HTMLElement) ||
          !(arch instanceof SVGElement) ||
          !(aboutSection instanceof HTMLElement) ||
          !(aboutContent instanceof HTMLElement)
        ) {
          return null;
        }

        const viewportCenter = window.innerWidth / 2;
        const heroRect = hero.getBoundingClientRect();
        const archRect = arch.getBoundingClientRect();
        const aboutRect = aboutSection.getBoundingClientRect();
        const contentRect = aboutContent.getBoundingClientRect();
        const contentStyle = getComputedStyle(aboutContent);
        const descendants = Array.from(aboutContent.querySelectorAll('*')).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        const maxDescendantBottom = descendants.reduce((max, node) => {
          const nodeBottom = node.getBoundingClientRect().bottom - contentRect.top;
          return Math.max(max, nodeBottom);
        }, 0);
        const padBottom = Number.parseFloat(contentStyle.paddingBottom) || 0;
        const estimatedNeededHeight = Math.ceil(maxDescendantBottom + padBottom);
        const aboutCenter = aboutRect.left + aboutRect.width / 2;
        const step = Number.parseFloat(aboutSection.dataset.perimeterStep ?? '');
        const signature = aboutSection.dataset.perimeterSignature ?? '';
        const signatureParts = signature.split(':');
        const snappedWidth = Number.parseFloat(signatureParts.at(-4) ?? '');
        const hasValidSignatureWidth = Number.isFinite(snappedWidth) && snappedWidth > 0;
        const circles = Array.from(aboutSection.querySelectorAll('.scallop-frame circle')).filter(
          (node): node is SVGCircleElement => node instanceof SVGCircleElement,
        );
        const circleSample = circles.slice(0, Math.min(16, circles.length));
        const maxCircleAxisDelta = circleSample.reduce((maxDelta, circle) => {
          const rect = circle.getBoundingClientRect();
          const delta = Math.abs(rect.width - rect.height);
          return Math.max(maxDelta, delta);
        }, 0);
        const remainder = Number.isFinite(step) && step > 0 ? Math.abs(aboutRect.height % step) : Number.NaN;
        const distanceToMultiple =
          Number.isFinite(step) && step > 0 ? Math.min(remainder, Math.abs(step - remainder)) : Number.NaN;

        return {
          viewportCenterDelta: Math.abs(aboutCenter - viewportCenter),
          heroCenterDelta: Math.abs(heroRect.left + heroRect.width / 2 - aboutCenter),
          archCenterDelta: Math.abs(archRect.left + archRect.width / 2 - aboutCenter),
          step,
          aboutHeightMatchesStep: Number.isFinite(distanceToMultiple) ? distanceToMultiple <= 1.5 : false,
          aboutContentFits: aboutContent.scrollHeight <= aboutContent.clientHeight + 1,
          widthMatchesSignature: hasValidSignatureWidth ? Math.abs(aboutRect.width - snappedWidth) <= 1.5 : false,
          circleCount: circles.length,
          maxCircleAxisDelta,
          aboutBottomSlack: Math.max(0, Math.ceil(aboutRect.height - estimatedNeededHeight)),
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      expect(aboutSnapshot).not.toBeNull();
      expect(aboutSnapshot!.hasHorizontalOverflow).toBe(false);
      expect(aboutSnapshot!.viewportCenterDelta).toBeLessThanOrEqual(1);
      expect(aboutSnapshot!.heroCenterDelta).toBeLessThanOrEqual(1);
      expect(aboutSnapshot!.archCenterDelta).toBeLessThanOrEqual(1);
      expect(aboutSnapshot!.step).toBeGreaterThanOrEqual(30);
      expect(aboutSnapshot!.aboutHeightMatchesStep).toBe(true);
      expect(aboutSnapshot!.aboutContentFits).toBe(true);
      expect(aboutSnapshot!.widthMatchesSignature).toBe(true);
      expect(aboutSnapshot!.circleCount).toBeGreaterThan(0);
      expect(aboutSnapshot!.maxCircleAxisDelta).toBeLessThanOrEqual(1);
      expect(aboutSnapshot!.aboutBottomSlack).toBeLessThanOrEqual(aboutSnapshot!.step + 4);
    }
  });

  test('quotes marks track words with runtime on all rendered home breakpoints', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const width of [360, 390, 430, 767, 1360, 1440, 1728]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const quoteSnapshot = await page.evaluate(() => {
        const section = document.querySelector('.quotes-section');
        if (section instanceof HTMLElement) {
          section.scrollIntoView({ block: 'start' });
        }

        const text = document.querySelector('.quotes-main-quote-text');
        const quoteRoot = document.querySelector('.quotes-main-quote');
        const closeMark = document.querySelector('.quotes-mark--main-close');
        const mainOpenMark = document.querySelector('.quotes-mark--main-open');
        if (
          !(text instanceof HTMLElement) ||
          !(quoteRoot instanceof HTMLElement) ||
          !(closeMark instanceof HTMLElement) ||
          !(mainOpenMark instanceof HTMLElement)
        ) {
          return null;
        }

        const wordNodes = Array.from(text.querySelectorAll('[data-motion-word]')).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        const lastWordNode = wordNodes.at(-1);
        if (!(lastWordNode instanceof HTMLElement)) {
          return null;
        }

        const quoteRect = quoteRoot.getBoundingClientRect();
        const closeRect = closeMark.getBoundingClientRect();
        const lastWordRect = lastWordNode.getBoundingClientRect();
        const sectionText = quoteRoot.closest('.quotes-section-text');
        const nextBlock =
          sectionText instanceof HTMLElement ? sectionText.querySelector('.quotes-bottom') : null;
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
        const resolveGapToNextFlowBlock = (quoteNode: HTMLElement, stopRootSelector: string) => {
          const stopRoot = quoteNode.closest(stopRootSelector);
          if (!(stopRoot instanceof HTMLElement)) {
            return 0;
          }
          const sibling = findNextFlowBlock(quoteNode, stopRoot);
          if (!(sibling instanceof HTMLElement)) {
            return 0;
          }
          const quoteNodeRect = quoteNode.getBoundingClientRect();
          return Math.max(
            0,
            sibling.offsetParent === quoteNode.offsetParent
              ? sibling.offsetTop - quoteNode.offsetTop - quoteNode.offsetHeight
              : sibling.getBoundingClientRect().top - quoteNodeRect.bottom,
          );
        };
        const resolveLastWordRect = (textRoot: HTMLElement, quoteNodeRect: DOMRect) => {
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
          const content = lastTextNode.textContent ?? '';
          const match = content.match(/(\S+)\s*$/);
          if (!match) {
            return null;
          }
          const token = match[1];
          const tokenEnd = content.lastIndexOf(token) + token.length;
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
            right: rect.right - quoteNodeRect.left,
            bottom: rect.bottom - quoteNodeRect.top,
          };
        };
        const resolveFirstWordRect = (textRoot: HTMLElement, quoteNodeRect: DOMRect) => {
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
            const textNode = walker.currentNode as Text;
            const content = textNode.textContent ?? '';
            const match = content.match(/\S+/);
            if (!match) {
              continue;
            }
            const token = match[0];
            const tokenStart = content.indexOf(token);
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
              left: rect.left - quoteNodeRect.left,
              top: rect.top - quoteNodeRect.top,
            };
          }
          return null;
        };
        const resolveSecondarySnapshot = (
          cardSelector: string,
          textSelector: string,
          closeSelector: string,
        ) => {
          const card = document.querySelector(cardSelector);
          const textRoot = document.querySelector(textSelector);
          const close = document.querySelector(closeSelector);
          if (!(card instanceof HTMLElement) || !(textRoot instanceof HTMLElement) || !(close instanceof HTMLElement)) {
            return null;
          }
          const cardRect = card.getBoundingClientRect();
          const closeLocalRect = close.getBoundingClientRect();
          const lastWord = resolveLastWordRect(textRoot, cardRect);
          if (!lastWord) {
            return null;
          }
          const gapToNext = resolveGapToNextFlowBlock(card, '.quotes-section');
          return {
            closeInlineLeft: close.style.left,
            closeInlineTop: close.style.top,
            closeLeftLocal: closeLocalRect.left - cardRect.left,
            closeTopLocal: closeLocalRect.top - cardRect.top,
            closeBottomLocal: closeLocalRect.bottom - cardRect.top,
            delta: closeLocalRect.left - (cardRect.left + lastWord.right),
            expectedClampedLeft: Math.min(
              Math.max(0, cardRect.width - closeLocalRect.width),
              Math.max(0, lastWord.right + 4),
            ),
            expectedClampedTop: Math.min(
              Math.max(0, cardRect.height - closeLocalRect.height + gapToNext),
              Math.max(0, lastWord.bottom + 4 - closeLocalRect.height),
            ),
            maxLeft: Math.max(0, cardRect.width - closeLocalRect.width),
            quoteHeight: cardRect.height,
            gapToNext,
          };
        };
        const resolveSecondaryOpenSnapshot = (
          cardSelector: string,
          textSelector: string,
          openSelector: string,
        ) => {
          const card = document.querySelector(cardSelector);
          const textRoot = document.querySelector(textSelector);
          const open = document.querySelector(openSelector);
          if (!(card instanceof HTMLElement) || !(textRoot instanceof HTMLElement) || !(open instanceof HTMLElement)) {
            return null;
          }
          const cardRect = card.getBoundingClientRect();
          const openLocalRect = open.getBoundingClientRect();
          const firstWord = resolveFirstWordRect(textRoot, cardRect);
          if (!firstWord) {
            return null;
          }
          return {
            openInlineLeft: open.style.left,
            openInlineTop: open.style.top,
            openLeftLocal: openLocalRect.left - cardRect.left,
            openTopLocal: openLocalRect.top - cardRect.top,
            expectedClampedLeft: Math.min(
              Math.max(0, cardRect.width - openLocalRect.width),
              Math.max(-openLocalRect.width, firstWord.left - openLocalRect.width),
            ),
            expectedClampedTop: Math.min(
              Math.max(0, cardRect.height - openLocalRect.height),
              Math.max(0, firstWord.top - 6),
            ),
          };
        };

        const gapToNext =
          nextBlock instanceof HTMLElement
            ? Math.max(
                0,
                nextBlock.offsetParent === quoteRoot.offsetParent
                  ? nextBlock.offsetTop - quoteRoot.offsetTop - quoteRoot.offsetHeight
                  : nextBlock.getBoundingClientRect().top - quoteRect.bottom,
              )
            : 0;
        const mainOpenRect = mainOpenMark.getBoundingClientRect();
        const mainFirstWord = resolveFirstWordRect(text, quoteRect);
        if (!mainFirstWord) {
          return null;
        }

        return {
          closeInlineLeft: closeMark.style.left,
          closeInlineTop: closeMark.style.top,
          closeLeftLocal: closeRect.left - quoteRect.left,
          closeTopLocal: closeRect.top - quoteRect.top,
          closeBottomLocal: closeRect.bottom - quoteRect.top,
          lastWordRightLocal: lastWordRect.right - quoteRect.left,
          lastWordBottomLocal: lastWordRect.bottom - quoteRect.top,
          delta: closeRect.left - lastWordRect.right,
          expectedClampedLeft: Math.min(
            Math.max(0, quoteRect.width - closeRect.width),
            Math.max(0, lastWordRect.right - quoteRect.left + 4),
          ),
          expectedClampedTop: Math.min(
            Math.max(0, quoteRect.height - closeRect.height + gapToNext),
            Math.max(0, lastWordRect.bottom - quoteRect.top + 9 - closeRect.height),
          ),
          maxLeft: Math.max(0, quoteRect.width - closeRect.width),
          quoteHeight: quoteRect.height,
          gapToNext,
          secondaryLeft: resolveSecondarySnapshot(
            '.quotes-card--left',
            '.quotes-card--left .quotes-copy',
            '.quotes-mark--left-close',
          ),
          secondaryRight: resolveSecondarySnapshot(
            '.quotes-card--right',
            '.quotes-card--right .quotes-copy--right',
            '.quotes-mark--right-close',
          ),
          mainOpenInlineLeft: mainOpenMark.style.left,
          mainOpenInlineTop: mainOpenMark.style.top,
          mainOpenLeftLocal: mainOpenRect.left - quoteRect.left,
          mainOpenTopLocal: mainOpenRect.top - quoteRect.top,
          mainOpenExpectedClampedLeft: Math.min(
            quoteRect.width - mainOpenRect.width,
            Math.max(-mainOpenRect.width - 3, mainFirstWord.left - mainOpenRect.width - 3),
          ),
          mainOpenExpectedClampedTop: Math.min(
            Math.max(0, quoteRect.height - mainOpenRect.height),
            Math.max(0, mainFirstWord.top - 21),
          ),
          secondaryLeftOpen: resolveSecondaryOpenSnapshot(
            '.quotes-card--left',
            '.quotes-card--left .quotes-copy',
            '.quotes-card--left .quotes-mark--small-open',
          ),
          secondaryRightOpen: resolveSecondaryOpenSnapshot(
            '.quotes-card--right',
            '.quotes-card--right .quotes-copy--right',
            '.quotes-card--right .quotes-mark--small-open',
          ),
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });

      expect(quoteSnapshot).not.toBeNull();
      expect(quoteSnapshot!.closeInlineLeft).not.toBe('');
      expect(quoteSnapshot!.closeInlineTop).not.toBe('');
      expect(Math.abs(quoteSnapshot!.closeLeftLocal - quoteSnapshot!.expectedClampedLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(quoteSnapshot!.closeTopLocal - quoteSnapshot!.expectedClampedTop)).toBeLessThanOrEqual(1);
      expect(quoteSnapshot!.closeBottomLocal).toBeLessThanOrEqual(
        quoteSnapshot!.quoteHeight + quoteSnapshot!.gapToNext + 1,
      );
      if (quoteSnapshot!.expectedClampedLeft < quoteSnapshot!.maxLeft - 0.5) {
        expect(quoteSnapshot!.delta).toBeGreaterThanOrEqual(2);
        expect(quoteSnapshot!.delta).toBeLessThanOrEqual(8);
      }

      const secondarySnapshots = [quoteSnapshot!.secondaryLeft, quoteSnapshot!.secondaryRight];
      for (const secondary of secondarySnapshots) {
        expect(secondary).not.toBeNull();
        expect(secondary!.closeInlineLeft).not.toBe('');
        expect(secondary!.closeInlineTop).not.toBe('');
        expect(Math.abs(secondary!.closeLeftLocal - secondary!.expectedClampedLeft)).toBeLessThanOrEqual(1);
        expect(Math.abs(secondary!.closeTopLocal - secondary!.expectedClampedTop)).toBeLessThanOrEqual(1);
        expect(secondary!.closeBottomLocal).toBeLessThanOrEqual(secondary!.quoteHeight + secondary!.gapToNext + 1);
      }
      expect(quoteSnapshot!.mainOpenInlineLeft).not.toBe('');
      expect(quoteSnapshot!.mainOpenInlineTop).not.toBe('');
      expect(Math.abs(quoteSnapshot!.mainOpenLeftLocal - quoteSnapshot!.mainOpenExpectedClampedLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(quoteSnapshot!.mainOpenTopLocal - quoteSnapshot!.mainOpenExpectedClampedTop)).toBeLessThanOrEqual(1);
      const secondaryOpenSnapshots = [quoteSnapshot!.secondaryLeftOpen, quoteSnapshot!.secondaryRightOpen];
      for (const open of secondaryOpenSnapshots) {
        expect(open).not.toBeNull();
        expect(open!.openInlineLeft).not.toBe('');
        expect(open!.openInlineTop).not.toBe('');
        expect(Math.abs(open!.openLeftLocal - open!.expectedClampedLeft)).toBeLessThanOrEqual(1);
        expect(Math.abs(open!.openTopLocal - open!.expectedClampedTop)).toBeLessThanOrEqual(1);
      }
      expect(quoteSnapshot!.hasHorizontalOverflow).toBe(false);
    }

  });

  test('final cta mobile morph matches figma initial/final states for inView', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const setSectionTop = async (targetTop: number) => {
      await page.evaluate((nextTop) => {
        const section = document.querySelector('.final-cta-section');
        if (!(section instanceof HTMLElement)) {
          return;
        }
        const currentTop = section.getBoundingClientRect().top;
        window.scrollBy(0, currentTop - nextTop);
      }, targetTop);
    };

    const readSnapshot = async () =>
      page.evaluate(() => {
        const section = document.querySelector('.final-cta-section');
        const wrap = document.querySelector('.final-cta-title-wrap');
        const title = document.querySelector('.final-cta-title');
        const orb = document.querySelector('.final-cta-orb');
        if (
          !(section instanceof HTMLElement) ||
          !(wrap instanceof HTMLElement) ||
          !(title instanceof HTMLElement) ||
          !(orb instanceof HTMLElement)
        ) {
          return null;
        }

        const titleRect = title.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const spans = Array.from(title.querySelectorAll('span')).filter((node): node is HTMLElement => node instanceof HTMLElement);
        const firstSpanRect = spans[0]?.getBoundingClientRect() ?? null;
        const secondSpanRect = spans[1]?.getBoundingClientRect() ?? null;
        const orbTransform = getComputedStyle(orb).transform;
        const matrixMatch = orbTransform.match(/matrix\(([^)]+)\)/);
        const matrixValues = matrixMatch
          ? matrixMatch[1].split(',').map((value) => Number.parseFloat(value.trim()))
          : null;

        return {
          triggerLineY: window.innerHeight * 0.3,
          sectionTop: section.getBoundingClientRect().top,
          titleTopWithinWrap: titleRect.top - wrapRect.top,
          titleFlexDirection: getComputedStyle(title).flexDirection,
          titleLineGap:
            firstSpanRect && secondSpanRect
              ? secondSpanRect.top - firstSpanRect.bottom
              : null,
          titleOffsetYVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-offset-y') || '0'),
          titleGapVar: Number.parseFloat(section.style.getPropertyValue('--final-cta-title-gap') || '0'),
          orbRotateVar: section.style.getPropertyValue('--final-cta-orb-rotate').trim(),
          orbMatrixB: matrixValues && matrixValues.length >= 2 ? matrixValues[1] : null,
          orbMatrixC: matrixValues && matrixValues.length >= 3 ? matrixValues[2] : null,
        };
      });

    await setSectionTop(360);
    await page.waitForTimeout(120);
    const initialSnapshot = await readSnapshot();
    expect(initialSnapshot).not.toBeNull();
    expect(initialSnapshot!.sectionTop).toBeGreaterThan(initialSnapshot!.triggerLineY);
    expect(initialSnapshot!.titleFlexDirection).toBe('column');
    expect(initialSnapshot!.titleLineGap).not.toBeNull();
    expect(Math.abs(initialSnapshot!.titleLineGap! - 210)).toBeLessThanOrEqual(2);
    expect(Math.abs(initialSnapshot!.titleGapVar - 210)).toBeLessThanOrEqual(2);
    expect(Math.abs(initialSnapshot!.titleOffsetYVar - -109)).toBeLessThanOrEqual(2);
    expect(Math.abs(initialSnapshot!.titleTopWithinWrap - -17)).toBeLessThanOrEqual(3);

    await setSectionTop(-260);
    await page.waitForTimeout(1200);
    const finalSnapshot = await readSnapshot();
    expect(finalSnapshot).not.toBeNull();
    expect(finalSnapshot!.sectionTop).toBeLessThanOrEqual(finalSnapshot!.triggerLineY);
    expect(finalSnapshot!.titleFlexDirection).toBe('column');
    expect(finalSnapshot!.titleLineGap).not.toBeNull();
    expect(Math.abs(finalSnapshot!.titleLineGap! - -8)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(finalSnapshot!.titleGapVar - -8)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(finalSnapshot!.titleOffsetYVar)).toBeLessThanOrEqual(1);
    expect(Math.abs(finalSnapshot!.titleTopWithinWrap - 92)).toBeLessThanOrEqual(3);
    expect(finalSnapshot!.orbRotateVar === '0deg' || finalSnapshot!.orbRotateVar === '-0deg').toBe(true);
    expect(finalSnapshot!.orbMatrixB).not.toBeNull();
    expect(finalSnapshot!.orbMatrixC).not.toBeNull();
    expect(Math.abs(finalSnapshot!.orbMatrixB!)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(finalSnapshot!.orbMatrixC!)).toBeLessThanOrEqual(0.02);
  });

  test('final cta buttons wrap responsively and remain centered', async ({ page }) => {
    const readButtonsLayout = async () =>
      page.evaluate(() => {
        const container = document.querySelector('.final-cta-buttons');
        const buttons = Array.from(document.querySelectorAll('.final-cta-buttons .ui-button')).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        if (!(container instanceof HTMLElement) || buttons.length < 2) {
          return null;
        }

        const containerRect = container.getBoundingClientRect();
        const firstRect = buttons[0].getBoundingClientRect();
        const secondRect = buttons[1].getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const styles = getComputedStyle(container);
        const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;

        return {
          firstTop: firstRect.top,
          secondTop: secondRect.top,
          firstCenterDelta: Math.abs(firstRect.left + firstRect.width / 2 - containerCenterX),
          secondCenterDelta: Math.abs(secondRect.left + secondRect.width / 2 - containerCenterX),
          containerWidth: containerRect.width,
          requiredWidthForSingleRow: firstRect.width + secondRect.width + gap,
          flexDirection: styles.flexDirection,
          flexWrap: styles.flexWrap,
        };
      });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => {
      const section = document.querySelector('.final-cta-section');
      if (section instanceof HTMLElement) {
        section.scrollIntoView({ block: 'center' });
      }
    });
    const wideSnapshot = await readButtonsLayout();
    expect(wideSnapshot).not.toBeNull();
    expect(wideSnapshot!.flexDirection).toBe('row');
    expect(wideSnapshot!.flexWrap).toBe('wrap');
    if (wideSnapshot!.containerWidth + 1 >= wideSnapshot!.requiredWidthForSingleRow) {
      expect(Math.abs(wideSnapshot!.firstTop - wideSnapshot!.secondTop)).toBeLessThanOrEqual(2);
    } else {
      expect(Math.abs(wideSnapshot!.firstTop - wideSnapshot!.secondTop)).toBeGreaterThan(8);
    }
    expect(wideSnapshot!.firstCenterDelta).toBeLessThanOrEqual(4);
    expect(wideSnapshot!.secondCenterDelta).toBeLessThanOrEqual(4);

    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto('/');
    await page.evaluate(() => {
      const section = document.querySelector('.final-cta-section');
      if (section instanceof HTMLElement) {
        section.scrollIntoView({ block: 'center' });
      }
    });
    const narrowSnapshot = await readButtonsLayout();
    expect(narrowSnapshot).not.toBeNull();
    expect(narrowSnapshot!.flexDirection).toBe('row');
    expect(narrowSnapshot!.flexWrap).toBe('wrap');
    if (narrowSnapshot!.containerWidth + 1 >= narrowSnapshot!.requiredWidthForSingleRow) {
      expect(Math.abs(narrowSnapshot!.firstTop - narrowSnapshot!.secondTop)).toBeLessThanOrEqual(2);
    } else {
      expect(Math.abs(narrowSnapshot!.firstTop - narrowSnapshot!.secondTop)).toBeGreaterThan(8);
    }
    expect(narrowSnapshot!.firstCenterDelta).toBeLessThanOrEqual(4);
    expect(narrowSnapshot!.secondCenterDelta).toBeLessThanOrEqual(4);
  });

  test('cases cards description keeps fixed height and figma right-arrow position on mobile and desktop', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await waitForLayoutReadiness(page);

    const mobileCasesSnapshot = await page.evaluate(() => {
      const rightCoverCard = document.querySelector(".cases-cards-list .case-card[href='/kissa']");
      let rightCoverChildSequence: string[] | null = null;
      if (rightCoverCard instanceof HTMLElement) {
        rightCoverChildSequence = Array.from(rightCoverCard.children)
          .filter((child): child is HTMLElement => child instanceof HTMLElement)
          .filter((child) => !child.classList.contains('case-card-hover-asset'))
          .map((child) => child.className);
      }

      const label = document.querySelector('.cases-cards-description-label');
      const labelWidth = label instanceof HTMLElement ? label.getBoundingClientRect().width : null;
      const container = document.querySelector('.cases-cards-description');
      const rightArrow = document.querySelector('.cases-cards-description-arrow--right');
      let descriptionHeight: number | null = null;
      let arrowRightLocalLeft: number | null = null;
      let arrowRightLocalTop: number | null = null;
      if (container instanceof HTMLElement && rightArrow instanceof HTMLElement) {
        const containerRect = container.getBoundingClientRect();
        const arrowRect = rightArrow.getBoundingClientRect();
        descriptionHeight = containerRect.height;
        arrowRightLocalLeft = arrowRect.left - containerRect.left;
        arrowRightLocalTop = arrowRect.top - containerRect.top;
      }

      return {
        rightCoverChildSequence,
        labelWidth,
        descriptionHeight,
        arrowRightLocalLeft,
        arrowRightLocalTop,
      };
    });

    expect(mobileCasesSnapshot.rightCoverChildSequence).not.toBeNull();
    expect(mobileCasesSnapshot.rightCoverChildSequence!.at(0)).toContain('case-card-cover-shell');
    expect(mobileCasesSnapshot.rightCoverChildSequence!.at(1)).toContain('case-card-content');
    expect(mobileCasesSnapshot.labelWidth).not.toBeNull();
    expect(Math.abs(mobileCasesSnapshot.labelWidth! - 180)).toBeLessThanOrEqual(2);
    expect(mobileCasesSnapshot.descriptionHeight).not.toBeNull();
    expect(Math.abs(mobileCasesSnapshot.descriptionHeight! - 72)).toBeLessThanOrEqual(1);
    expect(mobileCasesSnapshot.arrowRightLocalLeft).not.toBeNull();
    expect(mobileCasesSnapshot.arrowRightLocalTop).not.toBeNull();
    expect(Math.abs(mobileCasesSnapshot.arrowRightLocalLeft! - 276)).toBeLessThanOrEqual(2);
    expect(Math.abs(mobileCasesSnapshot.arrowRightLocalTop! - 42)).toBeLessThanOrEqual(2);

    for (const width of [360, 390, 430, 520, 767]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await waitForLayoutReadiness(page);

      const groupedSnapshot = await page.evaluate(() => {
        const container = document.querySelector('.cases-cards-description');
        const label = document.querySelector('.cases-cards-description-label');
        const leftArrow = document.querySelector('.cases-cards-description-arrow--left');
        const rightArrow = document.querySelector('.cases-cards-description-arrow--right');
        if (
          !(container instanceof HTMLElement) ||
          !(label instanceof HTMLElement) ||
          !(leftArrow instanceof HTMLElement) ||
          !(rightArrow instanceof HTMLElement)
        ) {
          return null;
        }
        const containerRect = container.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        const leftRect = leftArrow.getBoundingClientRect();
        const rightRect = rightArrow.getBoundingClientRect();
        return {
          descriptionWidth: containerRect.width,
          descriptionHeight: containerRect.height,
          gapToLeftArrow: labelRect.left - (leftRect.left + leftRect.width),
          gapToRightArrow: rightRect.left - (labelRect.left + labelRect.width),
        };
      });

      expect(groupedSnapshot).not.toBeNull();
      expect(groupedSnapshot!.descriptionWidth).toBeLessThanOrEqual(350.5);
      expect(Math.abs(groupedSnapshot!.descriptionHeight - 72)).toBeLessThanOrEqual(1);
      expect(groupedSnapshot!.gapToLeftArrow).toBeGreaterThanOrEqual(0);
      expect(groupedSnapshot!.gapToLeftArrow).toBeLessThanOrEqual(24);
      expect(groupedSnapshot!.gapToRightArrow).toBeGreaterThanOrEqual(0);
      expect(groupedSnapshot!.gapToRightArrow).toBeLessThanOrEqual(24);
      expect(Math.abs(groupedSnapshot!.gapToLeftArrow - groupedSnapshot!.gapToRightArrow)).toBeLessThanOrEqual(2);
    }

    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto('/');
    await waitForLayoutReadiness(page);

    const desktopArrowSnapshot = await page.evaluate(() => {
      const container = document.querySelector('.cases-cards-description');
      const rightArrow = document.querySelector('.cases-cards-description-arrow--right');
      if (!(container instanceof HTMLElement) || !(rightArrow instanceof HTMLElement)) {
        return null;
      }
      const containerRect = container.getBoundingClientRect();
      const arrowRect = rightArrow.getBoundingClientRect();
      return {
        descriptionHeight: containerRect.height,
        arrowRightLocalLeft: arrowRect.left - containerRect.left,
        arrowRightLocalTop: arrowRect.top - containerRect.top,
      };
    });

    expect(desktopArrowSnapshot).not.toBeNull();
    expect(Math.abs(desktopArrowSnapshot!.descriptionHeight - 72)).toBeLessThanOrEqual(1);
    expect(Math.abs(desktopArrowSnapshot!.arrowRightLocalLeft - 604)).toBeLessThanOrEqual(2);
    expect(Math.abs(desktopArrowSnapshot!.arrowRightLocalTop - 32)).toBeLessThanOrEqual(2);
  });

  test('text-wrap balance is scoped to targeted sections only', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const snapshot = await page.evaluate(() => {
      const supportsBalance = CSS.supports('text-wrap: balance');
      const selectors = [
        '.case-card-title',
        '.design-tools-title',
        '.design-tools-copy',
        '.quotes-main-quote-text',
        '.quotes-author',
        '.quotes-copy',
      ];

      const nodes = selectors
        .map((selector) => document.querySelector(selector))
        .filter((node): node is HTMLElement => node instanceof HTMLElement);

      const values = nodes.map((node) => ({
        selector: node.className,
        textWrap: getComputedStyle(node).getPropertyValue('text-wrap').trim(),
        textWrapStyle: getComputedStyle(node).getPropertyValue('text-wrap-style').trim(),
      }));

      const hasRuntimeBalance = values.some(
        (entry) => entry.textWrap === 'balance' || entry.textWrapStyle === 'balance',
      );

      return { supportsBalance, values, hasRuntimeBalance };
    });

    const cssSource = readFileSync('src/styles/global.css', 'utf8');
    const supportsStart = cssSource.indexOf('@supports (text-wrap: balance)');
    const supportsBlock = supportsStart >= 0 ? cssSource.slice(supportsStart) : '';
    const hasTargetedBalanceBlock =
      supportsStart >= 0 &&
      supportsBlock.includes('.case-card-title') &&
      supportsBlock.includes('.case-card-subtitle') &&
      supportsBlock.includes('.design-tools-title') &&
      supportsBlock.includes('.design-tools-copy') &&
      supportsBlock.includes('.quotes-main-quote-text') &&
      supportsBlock.includes('.quotes-author') &&
      supportsBlock.includes('.quotes-copy') &&
      supportsBlock.includes('text-wrap: balance');
    const hasLegacyGlobalCoverage =
      supportsBlock.includes('h1,') ||
      supportsBlock.includes('.type-t1') ||
      supportsBlock.includes('.home-hero-mobile-title') ||
      supportsBlock.includes('.cases-cards-description-label');

    expect(snapshot.values.length).toBeGreaterThan(0);
    expect(hasTargetedBalanceBlock).toBe(true);
    expect(hasLegacyGlobalCoverage).toBe(false);
    if (snapshot.supportsBalance) {
      expect(typeof snapshot.hasRuntimeBalance).toBe('boolean');
    }
  });

  test('/cases mobile renders real sections and hides temporary shell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await waitForLayoutReadiness(page);
    const homeArrowSnapshot = await page.evaluate(() => {
      const description = document.querySelector('.cases-cards-description');
      const rightArrow = document.querySelector('.cases-cards-description-arrow--right');
      const cover = document.querySelector('.case-card-cover-shell');
      if (!(description instanceof HTMLElement) || !(rightArrow instanceof HTMLElement) || !(cover instanceof HTMLElement)) {
        return null;
      }
      const descriptionRect = description.getBoundingClientRect();
      const arrowRect = rightArrow.getBoundingClientRect();
      return {
        descriptionHeight: descriptionRect.height,
        arrowRightLocalLeft: arrowRect.left - descriptionRect.left,
        arrowRightLocalTop: arrowRect.top - descriptionRect.top,
        coverHeight: cover.getBoundingClientRect().height,
      };
    });
    expect(homeArrowSnapshot).not.toBeNull();

    await page.goto('/cases');
    await waitForLayoutReadiness(page);

    await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
    await expect(page.locator('.cases-cards-section')).toBeVisible();
    await expect(page.locator('.final-cta-section')).toBeVisible();

    const casesSnapshot = await page.evaluate(() => {
      const rightCoverCard = document.querySelector(".cases-cards-list .case-card[href='/kissa']");
      const description = document.querySelector('.cases-cards-description');
      const rightArrow = document.querySelector('.cases-cards-description-arrow--right');
      const cover = document.querySelector('.case-card-cover-shell');
      const morphTarget = document.querySelector('.final-cta-section');
      if (
        !(rightCoverCard instanceof HTMLElement) ||
        !(description instanceof HTMLElement) ||
        !(rightArrow instanceof HTMLElement) ||
        !(cover instanceof HTMLElement) ||
        !(morphTarget instanceof HTMLElement)
      ) {
        return null;
      }

      const childSequence = Array.from(rightCoverCard.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .filter((child) => !child.classList.contains('case-card-hover-asset'))
        .map((child) => child.className);
      const descriptionRect = description.getBoundingClientRect();
      const arrowRect = rightArrow.getBoundingClientRect();
      const coverHeight = cover.getBoundingClientRect().height;

      morphTarget.scrollIntoView({ block: 'center' });
      const morphVars = getComputedStyle(morphTarget);

      return {
        childSequence,
        descriptionHeight: descriptionRect.height,
        arrowRightLocalLeft: arrowRect.left - descriptionRect.left,
        arrowRightLocalTop: arrowRect.top - descriptionRect.top,
        coverHeight,
        finalTitleGap: morphVars.getPropertyValue('--final-cta-title-gap').trim(),
      };
    });

    expect(casesSnapshot).not.toBeNull();
    expect(casesSnapshot!.childSequence.at(0)).toContain('case-card-cover-shell');
    expect(casesSnapshot!.childSequence.at(1)).toContain('case-card-content');
    expect(Math.abs(casesSnapshot!.descriptionHeight - homeArrowSnapshot!.descriptionHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs(casesSnapshot!.arrowRightLocalLeft - homeArrowSnapshot!.arrowRightLocalLeft)).toBeLessThanOrEqual(
      2,
    );
    expect(Math.abs(casesSnapshot!.arrowRightLocalTop - homeArrowSnapshot!.arrowRightLocalTop)).toBeLessThanOrEqual(2);
    expect(Math.abs(casesSnapshot!.coverHeight - homeArrowSnapshot!.coverHeight)).toBeLessThanOrEqual(1);
    expect(casesSnapshot!.finalTitleGap.length).toBeGreaterThan(0);
  });

  test('home breakpoint split keeps mobile profile through 847 and desktop from 848', async ({ page }) => {
    const cases = [
      { width: 767, expectMobileProfile: true },
      { width: 768, expectMobileProfile: true },
      { width: 847, expectMobileProfile: true },
      { width: 848, expectMobileProfile: false },
      { width: 1024, expectMobileProfile: false },
      { width: 1280, expectMobileProfile: false },
      { width: 1359, expectMobileProfile: false },
      { width: 1360, expectMobileProfile: false },
    ] as const;

    for (const currentCase of cases) {
      await page.setViewportSize({ width: currentCase.width, height: 900 });
      await page.goto('/');

      await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
      await expect(page.locator('.site-desktop-shell')).toBeVisible();

      if (currentCase.expectMobileProfile) {
        await expect(page.locator('.home-hero-mobile')).toBeVisible();
        await expect(page.locator('.home-hero')).toBeHidden();
      } else {
        await expect(page.locator('.home-hero-mobile')).toBeHidden();
        await expect(page.locator('.home-hero')).toBeVisible();
      }
    }
  });

  test('/cases breakpoint split keeps mobile profile through 847 and desktop from 848', async ({ page }) => {
    const cases = [
      { width: 768, expectMobileProfile: true },
      { width: 847, expectMobileProfile: true },
      { width: 848, expectMobileProfile: false },
      { width: 1024, expectMobileProfile: false },
      { width: 1280, expectMobileProfile: false },
      { width: 1359, expectMobileProfile: false },
      { width: 1360, expectMobileProfile: false },
    ] as const;

    for (const currentCase of cases) {
      await page.setViewportSize({ width: currentCase.width, height: 900 });
      await page.goto('/cases');

      await expect(page.locator('.temporary-adaptive-shell')).toBeHidden();
      await expect(page.locator('.site-desktop-shell')).toBeVisible();
      await expect(page.locator('.cases-cards-section')).toBeVisible();

      const cardFlexDirection = await page.evaluate(() => {
        const card = document.querySelector('.cases-cards-list .case-card');
        if (!(card instanceof HTMLElement)) {
          return null;
        }
        return getComputedStyle(card).flexDirection;
      });

      expect(cardFlexDirection).not.toBeNull();
      expect(cardFlexDirection).toBe(currentCase.expectMobileProfile ? 'column' : 'row');
    }
  });

  test('/gallery and /cases keep compact header + page-shell top sync on 768-847', async ({ page }) => {
    const widths = [768, 820, 847] as const;
    const routes = ['/cases', '/gallery'] as const;

    for (const width of widths) {
      for (const route of routes) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);

        const snapshot = await page.evaluate(() => {
          const header = document.querySelector('.site-header-inner');
          const shell = document.querySelector('main.page-shell');
          if (!(header instanceof HTMLElement) || !(shell instanceof HTMLElement)) {
            return null;
          }
          return {
            headerPaddingTop: getComputedStyle(header).paddingTop,
            shellPaddingTop: getComputedStyle(shell).paddingTop,
          };
        });

        expect(snapshot).not.toBeNull();
        expect(snapshot!.headerPaddingTop).toBe('24px');
        expect(snapshot!.shellPaddingTop).toBe('64px');
      }
    }
  });

  test('/gallery mobile uses real shell and hides temporary adaptive screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/gallery');

    await expect(page.locator('.temporary-adaptive-notice')).toBeHidden();
    await expect(page.locator('.site-desktop-shell')).toBeVisible();
  });
});
