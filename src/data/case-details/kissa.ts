import { KISSA_PROCESS_SECTION } from '../case-process/kissa';
import type { CaseDetailConfig } from './types';

export const KISSA_CASE_DETAIL_CONFIG: CaseDetailConfig = {
  slug: 'kissa',
  pageShellClasses: ['page-shell--case-detail', 'page-shell--kissa'],
  sections: [
    {
      type: 'intro',
      className: 'kissa-intro-section',
      inViewPreset: 'appear-stagger-dynamic-v1',
      data: {
        title: 'Kissa.AI: making complex self-checkout technology easy and engaging for everyday users',
        subtitle:
          'Kissa.AI is a foodtech startup specializing in AI-powered recognition of dish images. Their main product is a self-checkout terminal, designed to speed up ordering in fast food venues',
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
          { label: 'team:', value: 'po (client), 1 dev' },
          { label: 'platform:', value: 'full hd tablet' },
        ],
        scopeLines: ['interface redesign', 'visual concept', '3d graphics and animations'],
        resultLines: [
          'speed up flow times by 50%',
          'increasing the channel shift rate from staffed to self-checkout terminal by 20%',
          'reduced tap error rate by 80%',
        ],
      },
    },
    {
      type: 'introScreens',
      className: 'kissa-intro-screens',
      variant: 'tablet',
      inViewPreset: 'appear-v1',
      screens: [
        {
          src: '/media/cases/kissa/intro/kissa-terminal.webp',
          alt: 'Kissa terminal screen',
        },
        {
          src: '/media/cases/kissa/intro/kissa-welcome.webp',
          alt: 'Kissa welcome screen',
        },
        {
          src: '/media/cases/kissa/intro/kissa-tray.webp',
          alt: 'Kissa tray review screen',
        },
      ],
    },
    {
      type: 'challenge',
      className: 'kissa-case-challenge',
      inViewPreset: 'appear-v1',
      data: {
        title: 'challenge',
        columns: [
          'The Kissa.AI self-checkout system had low user adoption because customers found it unfamiliar and preferred cashiers. Long queues during peak times worsened the issue',
          'The goal was to create a clear, engaging, and fast interface that users would want to use and return to, increasing adoption and reducing wait times',
        ],
        device: 'tablet',
        screen: {
          src: '/media/cases/kissa/challenge/kissa-old.webp',
          alt: 'Kissa challenge baseline screen',
        },
        notes: [
          {
            id: 'operational-controls',
            text: 'identical operational controls differ across screens',
            left: 585,
            top: 146,
            width: 184,
            arrowSrc: '/media/cases/kissa/challenge/arrow-top-right.svg',
            arrowLeft: 564,
            arrowTop: 51,
            arrowWidth: 67,
            arrowHeight: 85,
          },
          {
            id: 'portion-size-toggle',
            text: 'portion size toggle is unclear',
            left: 17,
            top: 182,
            width: 184,
            arrowSrc: '/media/cases/kissa/challenge/arrow-top-left.svg',
            arrowLeft: 157,
            arrowTop: 118,
            arrowWidth: 94,
            arrowHeight: 102,
          },
          {
            id: 'back-button',
            text: 'back button replaces a one-click "recognize again"',
            left: 42,
            top: 389,
            width: 184,
            arrowSrc: '/media/cases/kissa/challenge/arrow-bottom-left.svg',
            arrowLeft: 120,
            arrowTop: 446,
            arrowWidth: 129,
            arrowHeight: 32,
          },
          {
            id: 'dish-list-prices',
            text: 'no option to view the full dish list with prices',
            left: 652,
            top: 325,
            width: 164,
            arrowSrc: '/media/cases/kissa/challenge/arrow-bottom-right.svg',
            arrowLeft: 567,
            arrowTop: 340,
            arrowWidth: 67,
            arrowHeight: 40,
          },
        ],
      },
    },
    {
      type: 'process',
      inViewPreset: 'appear-v1',
      data: KISSA_PROCESS_SECTION,
    },
    {
      type: 'artifactPhotos',
      inViewPreset: 'appear-stagger-dynamic-v1',
      data: {
        leftPhoto: {
          src: '/media/cases/kissa/artifact-photos/kissa-flipchart.webp',
          alt: 'Kissa navigation brainstorm sketch on flipchart',
        },
        rightPhoto: {
          src: '/media/cases/kissa/artifact-photos/kissa-terminal-photo.webp',
          alt: 'Kissa prototype tested on a real terminal device',
        },
        topCaption: 'new navigation designed during brainstorm session',
        bottomCaption: 'tested prototype on real product device',
        leftArrowSrc: '/media/cases/kissa/artifact-photos/kissa-photos-arrow-left.svg',
        rightArrowSrc: '/media/cases/kissa/artifact-photos/kissa-photos-arrow-right.svg',
      },
    },
    {
      type: 'featureCards',
      className: 'kissa-feature-cards',
      cards: [
        {
          mockSide: 'left',
          device: 'tablet',
          badges: [
            { label: 'Welcome', tone: 'blue' },
            { label: 'Portal 3D Animation', tone: 'gray' },
          ],
          title: 'Engaging animated welcome screen',
          description:
            'Bright 3D animation drew users in and inspired them to try a new, innovative self-checkout experience',
          mock: {
            kind: 'video',
            src: '/media/cases/kissa/feature-cards/flows/Kissa-Portal.webm',
          },
        },
        {
          mockSide: 'right',
          device: 'tablet',
          badges: [
            { label: 'Tray', tone: 'orange' },
            { label: 'Products List', tone: 'gray' },
          ],
          title: 'Instant tray review',
          description:
            'Users could check, edit, or add products in seconds, with quick category search and price breakdowns, which cut flow time by 50%',
          mock: {
            kind: 'video',
            src: '/media/cases/kissa/feature-cards/flows/Kissa-Pop-up.webm',
          },
        },
        {
          mockSide: 'left',
          device: 'tablet',
          badges: [
            { label: 'Payment', tone: 'green' },
            { label: '3D Illustrations', tone: 'gray' },
          ],
          title: 'Interactive payment flow',
          description:
            'Progress bar and dynamic messages created a lively, responsive checkout. 3D illustrations reinforced brand identity and innovation',
          mock: {
            kind: 'video',
            src: '/media/cases/kissa/feature-cards/flows/Kissa-Payment.webm',
          },
        },
      ],
    },
    {
      type: 'caseSwitcher',
      className: 'kissa-case-switcher',
      inViewPreset: 'appear-v1',
    },
  ],
};
