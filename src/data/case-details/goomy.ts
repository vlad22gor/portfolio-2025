import { GOOMY_PROCESS_SECTION } from '../case-process/goomy';
import type { CaseDetailConfig, CaseDetailScreensLoopScreen } from './types';

const GOOMY_ONBOARDING_SCREENS: CaseDetailScreensLoopScreen[] = [
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-intro-welcome.webp',
    alt: 'GoomY welcome screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-intro-meal-planning.webp',
    alt: 'GoomY meal planning introduction screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-intro-recipe-collections.webp',
    alt: 'GoomY recipe collections introduction screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-personalization-recipes-per-day.webp',
    alt: 'GoomY recipes per day personalization screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-insight-recipe-saving-volume.webp',
    alt: 'GoomY recipe saving insight screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-insight-community-imports.webp',
    alt: 'GoomY community imports insight screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-personalization-recipe-sources.webp',
    alt: 'GoomY recipe source personalization screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-social-proof-results.webp',
    alt: 'GoomY social proof results screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-education-how-it-works.webp',
    alt: 'GoomY onboarding how it works screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-education-import-demo.webp',
    alt: 'GoomY recipe import demonstration screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-processing-building-plan.webp',
    alt: 'GoomY building your plan screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-plan-personalized-results.webp',
    alt: 'GoomY personalized plan results screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-trial-introduction.webp',
    alt: 'GoomY free trial introduction screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-paywall-import-recipes.webp',
    alt: 'GoomY recipe import subscription screen',
    group: 'onboarding',
  },
  {
    src: '/media/cases/goomy/screens-loop/onboarding/onboarding-commitment-holding.webp',
    alt: 'GoomY onboarding commitment screen',
    group: 'onboarding',
  },
];

const GOOMY_CORE_SCREENS: CaseDetailScreensLoopScreen[] = [
  {
    src: '/media/cases/goomy/screens-loop/core/core-activation-choose-recipe.webp',
    alt: 'GoomY choose a recipe activation screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/recipe-flourless-vegan-chocolate-cake.webp',
    alt: 'GoomY flourless vegan chocolate cake recipe screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-saved-default.webp',
    alt: 'GoomY saved recipes screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-folder-favourites.webp',
    alt: 'GoomY favourites folder screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/recipe-sesame-salmon-rice-bowl.webp',
    alt: 'GoomY sesame salmon rice bowl recipe screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-saved-empty-state.webp',
    alt: 'GoomY saved recipes empty state screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-add-recipe-methods.webp',
    alt: 'GoomY add a recipe methods screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/recipe-easy-chocolate-croissants.webp',
    alt: 'GoomY easy chocolate croissants recipe screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-settings-default.webp',
    alt: 'GoomY settings screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-explore-default.webp',
    alt: 'GoomY recipe discovery screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/recipe-creamy-cod-spinach.webp',
    alt: 'GoomY creamy cod and spinach recipe screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-cooking-middle-step.webp',
    alt: 'GoomY guided cooking screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-shopping-list-single-recipe.webp',
    alt: 'GoomY shopping list screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/recipe-creamy-spicy-chicken-pasta.webp',
    alt: 'GoomY creamy spicy chicken pasta recipe screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-meal-plan-default.webp',
    alt: 'GoomY meal plan screen',
    group: 'core',
  },
  {
    src: '/media/cases/goomy/screens-loop/core/core-meal-plan-add-meal-recipe.webp',
    alt: 'GoomY add a recipe to meal plan screen',
    group: 'core',
  },
];

export const GOOMY_CASE_DETAIL_CONFIG: CaseDetailConfig = {
  slug: 'goomy',
  pageShellClasses: ['page-shell--case-detail', 'page-shell--goomy'],
  sections: [
    {
      type: 'intro',
      className: 'goomy-intro-section',
      inViewPreset: 'appear-stagger-dynamic-v1',
      data: {
        title:
          'GoomY: simplifying core recipe flows and building a distinctive mobile experience in four weeks',
        subtitle:
          'GoomY is a French mobile recipe app that helps people save recipes from social media, organize them into collections, and quickly find what they want to cook',
        overviewLabel: 'overview',
        scopeLabel: 'what I worked on',
        resultsLabel: 'results',
        dividerCounts: {
          overview: 22,
          scope: 10,
          results: 22,
        },
        overviewRows: [
          { label: 'role:', value: 'product designer' },
          { label: 'team:', value: 'client (developer)' },
          { label: 'platform:', value: 'React Native mobile app' },
        ],
        scopeLines: ['app redesign', 'core flow improvements', 'design system development'],
        resultLines: [
          'redesigned 86 screens and states across onboarding, core app and recipe flows',
          'built 70+ components, 450+ design tokens and styles',
          'delivered the redesign in four weeks',
        ],
      },
    },
    {
      type: 'introScreens',
      className: 'goomy-intro-screens',
      inViewPreset: 'appear-v1',
      variant: 'phone',
      mobileLayout: 'slider',
      screens: [
        {
          src: '/media/cases/goomy/intro/saved.webp',
          alt: 'GoomY saved recipes screen',
        },
        {
          src: '/media/cases/goomy/intro/explore.webp',
          alt: 'GoomY recipe discovery screen',
        },
        {
          src: '/media/cases/goomy/intro/recipe-detail.webp',
          alt: 'GoomY recipe details screen',
        },
      ],
    },
    {
      type: 'challenge',
      className: 'goomy-case-challenge',
      inViewPreset: 'appear-v1',
      data: {
        title: 'challenge',
        columns: [
          'GoomY was already a working app, but the interface lacked a consistent visual language and did not express the playful, food-focused brand identity which was aimed by the client',
          'The redesign also needed to simplify core flows without rebuilding the product logic. I had four weeks to redesign the app and prepare a system the client could implement in React Native',
        ],
        device: 'phone',
        screen: {
          src: '/media/cases/goomy/challenge/legacy-recipe-detail.webp',
          alt: 'GoomY recipe screen before the redesign',
        },
        notes: [
          {
            id: 'navigation-consistency',
            text: 'the navigation patterns and component was not consistent',
            left: 564,
            top: 146,
            width: 184,
            arrowSrc: '/media/cases/goomy/challenge/arrow-top-right.svg',
            arrowLeft: 536,
            arrowTop: 51,
            arrowWidth: 67,
            arrowHeight: 85,
          },
          {
            id: 'recipe-covers',
            text: 'recipe covers did not look tasty in the layout',
            left: 17,
            top: 182,
            width: 184,
            arrowSrc: '/media/cases/goomy/challenge/arrow-top-left.svg',
            arrowLeft: 187,
            arrowTop: 118,
            arrowWidth: 94,
            arrowHeight: 102,
          },
          {
            id: 'generic-controls',
            text: 'controls looked too generic for a recipe app',
            left: 72,
            top: 383,
            width: 184,
            arrowSrc: '/media/cases/goomy/challenge/arrow-bottom-left.svg',
            arrowLeft: 149,
            arrowTop: 440,
            arrowWidth: 129,
            arrowHeight: 32,
          },
          {
            id: 'active-controls',
            text: 'active controls messed up with inactive tags',
            left: 621,
            top: 351,
            width: 184,
            arrowSrc: '/media/cases/goomy/challenge/arrow-active-controls@3x.png',
            arrowLeft: 540,
            arrowTop: 366,
            arrowWidth: 67,
            arrowHeight: 40,
          },
        ],
        mobile: {
          sceneWidth: 350,
          sceneHeight: 823,
          device: {
            left: 53,
            top: 155,
            width: 244,
            height: 501,
            screenLeft: 65.5,
            screenRight: 285,
          },
          notes: [
            {
              id: 'recipe-covers',
              text: 'recipe covers did not look tasty in the layout',
              side: 'left',
              top: 0,
              width: 184,
              textOffsetFromAnchor: -55.5,
              arrowSrc: '/media/cases/goomy/challenge/arrow-top-left.svg',
              arrowTop: 72,
              arrowWidth: 80,
              arrowHeight: 87,
              arrowOffsetFromAnchor: -40,
            },
            {
              id: 'navigation-consistency',
              text: 'the navigation patterns and component was not consistent',
              side: 'right',
              top: 62,
              width: 184,
              textOffsetFromAnchor: -129,
              arrowSrc: '/media/cases/goomy/challenge/arrow-top-right.svg',
              arrowTop: 108,
              arrowWidth: 50,
              arrowHeight: 64,
              arrowOffsetFromAnchor: 0,
            },
            {
              id: 'active-controls',
              text: 'active controls messed up with inactive tags',
              side: 'right',
              top: 703,
              width: 184,
              textOffsetFromAnchor: -129,
              arrowSrc: '/media/cases/goomy/challenge/arrow-bottom-right.svg',
              arrowTop: 616,
              arrowWidth: 50,
              arrowHeight: 52,
              arrowOffsetFromAnchor: -4,
            },
            {
              id: 'generic-controls',
              text: 'controls looked too generic for a recipe app',
              side: 'left',
              top: 779,
              width: 184,
              textOffsetFromAnchor: -55.5,
              arrowSrc: '/media/cases/goomy/challenge/arrow-bottom-left.svg',
              arrowTop: 632,
              arrowWidth: 72,
              arrowHeight: 22,
              arrowOffsetFromAnchor: -30,
            },
          ],
        },
      },
    },
    {
      type: 'process',
      inViewPreset: 'appear-v1',
      data: GOOMY_PROCESS_SECTION,
    },
    {
      type: 'featureCards',
      className: 'goomy-feature-cards',
      ariaLabel: 'GoomY feature cards',
      cards: [
        {
          mockSide: 'left',
          device: 'phone',
          badges: [
            { label: 'Onboarding', tone: 'blue' },
            { label: 'Product Value', tone: 'gray' },
          ],
          title: 'Value before commitment',
          description:
            'Three focused screens introduce saving social recipes, planning meals and building collections before permissions and the trial decision',
          mock: {
            kind: 'video',
            src: '/media/cases/goomy/flows/goomy-onboarding-v1.webm',
            poster: '/media/cases/goomy/flows/goomy-onboarding-v1-poster.png',
          },
        },
        {
          mockSide: 'right',
          device: 'phone',
          badges: [
            { label: 'Monetization', tone: 'orange' },
            { label: 'Activation', tone: 'gray' },
          ],
          title: 'From trial to first saved recipe',
          description:
            'Plans and benefits stay accessible through a sticky CTA; activation continues through hold-to-commit, recipe selection and the first save',
          mock: {
            kind: 'video',
            src: '/media/cases/goomy/flows/goomy-paywall-activation-v1.webm',
            poster: '/media/cases/goomy/flows/goomy-paywall-activation-v1-poster.png',
          },
        },
        {
          mockSide: 'left',
          device: 'phone',
          badges: [
            { label: 'Recipes', tone: 'green' },
            { label: 'Cooking Mode', tone: 'gray' },
          ],
          title: 'A recipe view built for cooking',
          description:
            'Users adjust servings, check off ingredients or open the original source, then switch to step-by-step cooking with persistent progress',
          mock: {
            kind: 'video',
            src: '/media/cases/goomy/flows/goomy-recipe-cooking-v1.webm',
            poster: '/media/cases/goomy/flows/goomy-recipe-cooking-v1-poster.png',
          },
        },
      ],
    },
    {
      type: 'screensLoop',
      className: 'goomy-screens-loop',
      inViewPreset: 'appear-v1',
      data: {
        badge: 'Full Product Rollout',
        title: '86 screens',
        body:
          'I extended the visual direction across onboarding and core screens covering the flows and states for production',
        screens: [...GOOMY_ONBOARDING_SCREENS, ...GOOMY_CORE_SCREENS],
      },
    },
    {
      type: 'designSystem',
      className: 'goomy-design-system-section',
      inViewPreset: 'appear-v1',
      data: {
        variant: 'goomy',
        heading: 'app design system',
        copyPaletteTitle: 'token architecture',
        copyPaletteBody:
          '450+ tokens connected Primitive, Semantic and Component level',
        copyStylesTitle: 'handoff',
        copyStylesBody:
          'Specs, DESIGN.md and\ntokens enabled accurate React Native implementation',
        copyLibraryTitle: 'component library',
        copyLibraryBody:
          '72 component families covered core patterns, states and recipe-specific UI',
        summaryImageSrc: '/media/cases/goomy/design-system/action-sheet.webp',
        horizontalImageSrc: '/media/cases/goomy/design-system/source-metric-cards.webp',
        verticalImageSrc: '/media/cases/goomy/design-system/saved-recipe-cards.webp',
        sheetImageSrc: '/media/cases/goomy/design-system/explore-featured-card.webp',
        arrowTopSrc: '/media/cases/goomy/design-system/arrow-top.svg',
        arrowBottomLeftSrc: '/media/cases/goomy/design-system/arrow-bottom-left.svg',
        arrowBottomRightSrc: '/media/cases/goomy/design-system/arrow-bottom-right.svg',
      },
    },
    {
      type: 'caseSwitcher',
      className: 'goomy-case-switcher',
      inViewPreset: 'appear-v1',
    },
  ],
};
