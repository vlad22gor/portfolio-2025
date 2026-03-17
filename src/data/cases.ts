export type CaseMetric = {
  label: string;
  value: string;
};

export type CaseMedia = {
  kind: 'image' | 'video';
  src: string;
  alt: string;
};

export type CaseCardCover = {
  src: string;
  alt: string;
};

export type CaseCardHoverAsset = {
  src: string;
  alt: string;
  targetX: number;
  targetY: number;
  rotationDeg: number;
  width: number;
  height: number;
  zIndex: number;
};

export type CaseCardHover = {
  designWidth?: number;
  borderColor: string;
  arrowDirection: 'left' | 'right';
  assets: CaseCardHoverAsset[];
};

export type CaseSection = {
  title: string;
  body: string[];
};

export type Case = {
  slug: 'fora' | 'kissa';
  title: string;
  subtitle: string;
  tags: string[];
  coverSide: 'left' | 'right';
  cardCover: CaseCardCover;
  cardHover: CaseCardHover;
  metrics: CaseMetric[];
  summary: string;
  sections: CaseSection[];
  media: CaseMedia[];
};

export const CASES: Case[] = [
  {
    slug: 'fora',
    title: 'Fora supermarket app redesign',
    subtitle:
      'Driving 5% revenue increase and boosting app ratings from 3.0 to 4.6 over nine months.',
    tags: ['Redesign', 'Mobile App', 'Product Design'],
    coverSide: 'left',
    cardCover: {
      src: '/media/cases/fora/card/cover.webp',
      alt: 'Fora case card cover',
    },
    cardHover: {
      designWidth: 874,
      borderColor: '#7AAA5C',
      arrowDirection: 'right',
      assets: [
        {
          src: '/media/cases/fora/card/delivery-time.png',
          alt: 'Fora delivery time preview',
          targetX: -149,
          targetY: -75,
          rotationDeg: -13,
          width: 288,
          height: 257,
          zIndex: 3,
        },
        {
          src: '/media/cases/fora/card/summary.webp',
          alt: 'Fora summary preview',
          targetX: -148,
          targetY: 143,
          rotationDeg: 10,
          width: 252,
          height: 340,
          zIndex: 2,
        },
      ],
    },
    metrics: [
      { label: 'Revenue uplift', value: '+5%' },
      { label: 'App rating', value: '3.0 -> 4.6' },
      { label: 'Timeline', value: '9 months' },
    ],
    summary:
      'Reworked navigation, category browsing, and checkout clarity to reduce friction in daily grocery flows.',
    sections: [
      {
        title: 'Challenge',
        body: [
          'The app had low trust signals and users dropped off before checkout.',
          'Navigation was overloaded, especially in category and payment scenarios.',
        ],
      },
      {
        title: 'Process',
        body: [
          'Mapped pain points from user sessions and support tickets.',
          'Iterated on IA, category hierarchy, and visual feedback with developers and product.',
        ],
      },
      {
        title: 'Result',
        body: [
          'Improved discoverability of products and delivery options.',
          'Increased confidence during payment with clearer progress and state transitions.',
        ],
      },
    ],
    media: [
      {
        kind: 'image',
        src: '/media/cases/fora/hero/hero.svg',
        alt: 'Fora case hero visual',
      },
    ],
  },
  {
    slug: 'kissa',
    title: 'Kissa.AI self-checkout terminal redesign',
    subtitle:
      'Making complex self-checkout technology easy and engaging for everyday users.',
    tags: ['Redesign', 'Startup', 'AI'],
    coverSide: 'right',
    cardCover: {
      src: '/media/cases/kissa/card/cover.webp',
      alt: 'Kissa case card cover',
    },
    cardHover: {
      designWidth: 874,
      borderColor: '#8D88B5',
      arrowDirection: 'left',
      assets: [
        {
          src: '/media/cases/kissa/card/terminal.webp',
          alt: 'Kissa terminal detail',
          targetX: 704.1,
          targetY: -110,
          rotationDeg: 0,
          width: 348,
          height: 348,
          zIndex: 3,
        },
        {
          src: '/media/cases/kissa/card/coin-wheel.webp',
          alt: 'Kissa coin wheel detail',
          targetX: 666,
          targetY: 139.14,
          rotationDeg: 0,
          width: 359,
          height: 359,
          zIndex: 2,
        },
      ],
    },
    metrics: [
      { label: 'Project type', value: '0 -> 1' },
      { label: 'Scope', value: 'Terminal UX + Flow' },
      { label: 'Focus', value: 'Adoption & clarity' },
    ],
    summary:
      'Designed a guided, animated terminal flow that reduces cognitive load in payment and tray review.',
    sections: [
      {
        title: 'Challenge',
        body: [
          'Users faced an unfamiliar hardware flow and hesitated at critical steps.',
          'The product needed to communicate confidence without adding visual noise.',
        ],
      },
      {
        title: 'Process',
        body: [
          'Prototyped short guidance states and tested language + motion hierarchy.',
          'Aligned interaction model with hardware constraints and cashier fallback.',
        ],
      },
      {
        title: 'Result',
        body: [
          'The flow became easier to follow from welcome to payment confirmation.',
          'Visual rhythm improved perceived speed while preserving trust.',
        ],
      },
    ],
    media: [
      {
        kind: 'image',
        src: '/media/cases/kissa/hero/hero.svg',
        alt: 'Kissa case hero visual',
      },
    ],
  },
];

export function getCaseBySlug(slug: string): Case | undefined {
  return CASES.find((item) => item.slug === slug);
}
