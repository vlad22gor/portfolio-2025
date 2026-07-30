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

export type CaseCardArrowDirection = 'left' | 'right';

export type CaseCardHover = {
  designWidth?: number;
  borderColor: string;
  arrowDirection: CaseCardArrowDirection;
  assets: CaseCardHoverAsset[];
};

export type CaseCardData = {
  slug: 'fora' | 'kissa' | 'goomy';
  href?: string;
  title: string;
  subtitle: string;
  tags: string[];
  coverSide: 'left' | 'right';
  cardCover: CaseCardCover;
  cardHover: CaseCardHover;
};

export type CaseSection = {
  title: string;
  body: string[];
};

export type Case = CaseCardData & {
  slug: 'fora' | 'kissa';
  href: string;
  metrics: CaseMetric[];
  summary: string;
  sections: CaseSection[];
  media: CaseMedia[];
};

export const CASES: Case[] = [
  {
    slug: 'fora',
    href: '/fora',
    title: 'Fora supermarket app redesign',
    subtitle:
      'Driving 5% revenue increase and boosting app ratings 3.0 → 4.6 over nine months with a fresh redesign and improved usability',
    tags: ['Redesign', 'Growth', 'Mobile App', 'Product Design'],
    coverSide: 'right',
    cardCover: {
      src: '/media/cases/fora/card/cover.webp',
      alt: 'Fora case card cover',
    },
    cardHover: {
      designWidth: 874,
      borderColor: '#7AAA5C',
      arrowDirection: 'left',
      assets: [
        {
          src: '/media/cases/fora/card/delivery-time.png',
          alt: 'Fora delivery time preview',
          targetX: 383.79,
          targetY: -74.9,
          rotationDeg: 13.8,
          width: 288,
          height: 257,
          zIndex: 3,
        },
        {
          src: '/media/cases/fora/card/summary.webp',
          alt: 'Fora summary preview',
          targetX: 328.04,
          targetY: 135.3,
          rotationDeg: 31.46,
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
    href: '/kissa',
    title: 'Kissa.AI self-checkout terminal redesign',
    subtitle:
      'Making complex self-checkout technology easy and engaging for everyday users.',
    tags: ['Redesign', 'Startup', 'AI'],
    coverSide: 'left',
    cardCover: {
      src: '/media/cases/kissa/card/cover.webp',
      alt: 'Kissa case card cover',
    },
    cardHover: {
      designWidth: 874,
      borderColor: '#8D88B5',
      arrowDirection: 'right',
      assets: [
        {
          src: '/media/cases/kissa/card/terminal.webp',
          alt: 'Kissa terminal detail',
          targetX: -163,
          targetY: -98,
          rotationDeg: 0,
          width: 348,
          height: 348,
          zIndex: 3,
        },
        {
          src: '/media/cases/kissa/card/coin-wheel.webp',
          alt: 'Kissa coin wheel detail',
          targetX: -150,
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

export const GOOMY_CASE_CARD: CaseCardData = {
  slug: 'goomy',
  title: 'GoomY recipe app redesign',
  subtitle:
    'Simplifying core recipe flows and building a distinctive, production-ready experience in four weeks',
  tags: ['Redesign', 'Onboarding'],
  coverSide: 'left',
  cardCover: {
    src: '/media/cases/goomy/card/cover.webp',
    alt: 'GoomY recipe app case card cover',
  },
  cardHover: {
    designWidth: 874,
    borderColor: '#E38F75',
    arrowDirection: 'right',
    assets: [
      {
        src: '/media/cases/goomy/card/add-recipe.png',
        alt: 'GoomY add recipe sheet preview',
        targetX: -179.14,
        targetY: -122,
        rotationDeg: 0,
        width: 370,
        height: 383,
        zIndex: 3,
      },
      {
        src: '/media/cases/goomy/card/recipe-card.png',
        alt: 'GoomY recipe card preview',
        targetX: -189.01,
        targetY: 52,
        rotationDeg: 0,
        width: 373,
        height: 463,
        zIndex: 2,
      },
    ],
  },
};

export const CASE_CARDS: CaseCardData[] = [GOOMY_CASE_CARD, ...CASES];

export function getCaseBySlug(slug: string): Case | undefined {
  return CASES.find((item) => item.slug === slug);
}
