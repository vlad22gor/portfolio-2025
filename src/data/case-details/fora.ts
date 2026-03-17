import { FORA_PROCESS_SECTION } from '../case-process/fora';
import type { CaseDetailConfig } from './types';

export const FORA_CASE_DETAIL_CONFIG: CaseDetailConfig = {
  slug: 'fora',
  pageShellClasses: ['page-shell--case-detail', 'page-shell--fora'],
  sections: [
    {
      type: 'intro',
      inViewPreset: 'appear-v1',
      data: {
        title:
          'Fora app: driving 5% revenue increase and boosting app ratings from 3.0 to 4.6 over nine months',
        subtitle:
          'Fora is one of Ukraine’s largest grocery retailers, with 300+ stores. The company focuses on convenient, friendly shopping experiences, both offline and online',
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
          { label: 'team:', value: '4 front, 2 back, po, pm, ba, 2 qa' },
          { label: 'platform:', value: 'iOS and Android' },
        ],
        scopeLines: ['app redesign', '3d graphics and animations', 'design system development'],
        resultLines: [
          'increased the App Store and Google Play rating from 3.0 to 4.6',
          'increased company revenue by 5%',
          'increased orders by 15%',
        ],
      },
    },
    {
      type: 'introScreens',
      variant: 'phone',
      screens: [
        {
          src: '/media/cases/fora/intro/fora-intro-delivery.png',
          alt: 'Fora delivery home screen',
        },
        {
          src: '/media/cases/fora/intro/fora-intro-category.png',
          alt: 'Fora category listing screen',
        },
        {
          src: '/media/cases/fora/intro/fora-intro-map.png',
          alt: 'Fora map delivery selection screen',
        },
      ],
    },
    {
      type: 'challenge',
      className: 'fora-case-challenge',
      inViewPreset: 'appear-v1',
      data: {
        title: 'challenge',
        columns: [
          "The Ukrainian food retail market is highly competitive, so refreshing the app's design was essential. Outdated visuals and clunky flows made it difficult to attract and retain users",
          'My challenge was to redesign the app to boost ratings in the stores (and increase installs), streamline ordering to grow average order value and the total number of orders',
        ],
        device: 'phone',
        screen: {
          src: '/media/cases/fora/challenge/fora-challenge-mock.png',
          alt: 'Fora app challenge screen',
        },
        notes: [
          {
            id: 'cart-access',
            text: 'the cart was hard to spot and access',
            left: 564,
            top: 146,
            width: 184,
            arrowSrc: '/media/cases/fora/challenge/arrow-top-right.svg',
            arrowLeft: 536,
            arrowTop: 51,
            arrowWidth: 67,
            arrowHeight: 85,
          },
          {
            id: 'address-time-controls',
            text: "Address and time weren't clearly recognized as controls",
            left: 17,
            top: 182,
            width: 184,
            arrowSrc: '/media/cases/fora/challenge/arrow-top-left.svg',
            arrowLeft: 187,
            arrowTop: 118,
            arrowWidth: 94,
            arrowHeight: 102,
          },
          {
            id: 'icons-shadows',
            text: 'inconsistent icons and outdated shadows',
            left: 72,
            top: 389,
            width: 184,
            arrowSrc: '/media/cases/fora/challenge/arrow-bottom-left.svg',
            arrowLeft: 149,
            arrowTop: 446,
            arrowWidth: 129,
            arrowHeight: 32,
          },
          {
            id: 'categories-graphics',
            text: 'Categories lacked graphics, forcing users to read labels',
            left: 621,
            top: 325,
            width: 184,
            arrowSrc: '/media/cases/fora/challenge/arrow-bottom-right.svg',
            arrowLeft: 540,
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
      data: FORA_PROCESS_SECTION,
    },
    {
      type: 'featureCards',
      cards: [
        {
          mockSide: 'left',
          device: 'phone',
          badges: [
            { label: 'Delivery', tone: 'blue' },
            { label: 'Address and Time Selection', tone: 'gray' },
          ],
          title: 'Visual categories and smart selection',
          description:
            'Images on category cards made discovery instant. Recent address selection and quick time slots reduced selection time by 50%',
          mock: {
            kind: 'video',
            src: '/media/cases/fora/feature-cards/flows/Fora-Delivery.webm',
          },
        },
        {
          mockSide: 'right',
          device: 'phone',
          badges: [
            { label: 'Catalogue', tone: 'orange' },
            { label: 'Navigation', tone: 'gray' },
          ],
          title: 'Two-level categories navigation',
          description:
            'Subcategory and sub-subcategory filters let users narrow down instantly which cut product search time by 30%',
          mock: {
            kind: 'video',
            src: '/media/cases/fora/feature-cards/flows/Fora-Catalogue.webm',
          },
        },
        {
          mockSide: 'left',
          device: 'phone',
          badges: [
            { label: 'Cart', tone: 'green' },
            { label: 'Delivery Method', tone: 'gray' },
          ],
          title: 'Free delivery progress and payment options',
          description:
            'Free delivery progress bar increased average order value by 10%. Apple and Google Pay integrations lifted order volume by 15%',
          mock: {
            kind: 'video',
            src: '/media/cases/fora/feature-cards/flows/Fora-Cart.webm',
          },
        },
      ],
    },
    {
      type: 'designSystem',
      inViewPreset: 'appear-v1',
      data: {
        heading: 'app design system',
        copyPaletteTitle: 'color palette',
        copyPaletteBody:
          'Unified the color palette across platforms, enhancing brand consistency',
        copyStylesTitle: 'unified styles',
        copyStylesBody:
          'Synced Figma and code styles with devs, reducing UI bugs by 40%',
        copyLibraryTitle: 'component library',
        copyLibraryBody:
          '20+ standardized components cut new feature time to market by 25%',
        summaryImageSrc: '/media/cases/fora/design-system/design-system-image-summary.png',
        horizontalImageSrc:
          '/media/cases/fora/design-system/design-system-image-horizontal-cards.png',
        verticalImageSrc:
          '/media/cases/fora/design-system/design-system-image-vertical-cards.png',
        sheetImageSrc: '/media/cases/fora/design-system/design-system-image-sheet.png',
        arrowTopSrc: '/media/cases/fora/design-system/arrow-top.svg',
        arrowBottomLeftSrc: '/media/cases/fora/design-system/arrow-bottom-left.svg',
        arrowBottomRightSrc: '/media/cases/fora/design-system/arrow-bottom-right.svg',
      },
    },
    {
      type: 'teamPhoto',
      inViewPreset: 'appear-v1',
      data: {
        photoSrc: '/media/cases/fora/team-photo/team-photo.png',
        photoAlt: 'Fora team photo',
        caption:
          'finally the project turned for us into a shared adventure we truly enjoyed',
        heartLeftSrc: '/media/cases/fora/team-photo/heart-left.svg',
        heartRightSrc: '/media/cases/fora/team-photo/heart-right.svg',
      },
    },
    {
      type: 'caseSwitcher',
      className: 'fora-case-switcher',
      inViewPreset: 'appear-v1',
    },
  ],
};
