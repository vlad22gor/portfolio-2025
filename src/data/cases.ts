export type CaseMetric = {
  label: string;
  value: string;
};

export type CaseMedia = {
  kind: 'image' | 'video';
  src: string;
  alt: string;
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
        src: '/media/fora-hero.svg',
        alt: 'Fora case visual placeholder',
      },
    ],
  },
  {
    slug: 'kissa',
    title: 'Kissa.AI self-checkout terminal redesign',
    subtitle:
      'Making complex self-checkout technology easy and engaging for everyday users.',
    tags: ['Redesign', 'Startup', 'AI'],
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
        src: '/media/kissa-hero.svg',
        alt: 'Kissa case visual placeholder',
      },
    ],
  },
];

export function getCaseBySlug(slug: string): Case | undefined {
  return CASES.find((item) => item.slug === slug);
}
