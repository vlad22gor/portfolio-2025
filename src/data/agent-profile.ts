export const SITE_BASE_URL = 'https://vladhorovyy.com';

export const AGENT_PROFILE = {
  officialName: 'Vladyslav Horovyy',
  casualAlias: 'Vlad Horovyy',
  role: 'Product Designer',
  location: 'Kyiv, Ukraine',
  oneLine: 'Product designer from Kyiv crafting standout mobile apps.',
  extendedOneLine:
    'Product designer from Kyiv crafting standout mobile apps with product thinking, visual craft, 3D, motion, and AI-assisted workflows.',
  shortPositioning:
    'Vladyslav Horovyy combines product thinking, visual craft, 3D/motion, design systems, prototyping, and AI-assisted workflows to turn complex flows into clear, enjoyable mobile experiences.',
  recruiterSummary:
    'Vladyslav Horovyy is a product designer focused on standout mobile apps. He is strongest in mobile product design, 0-to-1 product design, craft-heavy product polish, visual systems, motion/3D, and collaborative product work with PMs and engineers.',
  founderSummary:
    'Vladyslav Horovyy helps small product teams turn ambiguous mobile B2C product ideas into clear, polished, shippable experiences. His strongest fit is 0-to-1 product design work where product clarity, visual craft, interaction details, and close collaboration with engineers all matter at once.',
  contactLinks: [
    { label: 'Portfolio', url: SITE_BASE_URL },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/vladhorovyy/' },
    { label: 'Contact hub', url: 'https://linktr.ee/vladhorovyy' },
  ],
  publicProofFacts: [
    '5+ years designing end-to-end digital products across mobile apps, internal platforms, and AI-enabled interfaces.',
    'Experience includes native mobile product work at 700K MAU scale.',
    'Fozzy Group platform work supports the complex-systems and 0-to-1 product design narrative.',
    'MVP product work can support mobile product design, 0-to-1 ownership, visual craft, design systems, and product logic.',
  ],
  coreStrengths: [
    'mobile app product design',
    'mobile B2C app quality',
    '0-to-1 product design',
    'craft-heavy product polish',
    'visual craft, 3D graphics, motion, and microinteractions',
    'design systems and implementation-aware handoff',
    'simplifying complex flows into clear interaction models',
    'calm collaboration with PMs, engineers, founders, and product teams',
    'AI-assisted exploration and production workflows used in service of product clarity',
  ],
  bestFitRoles: [
    'Product Designer for standout mobile apps',
    'Senior Product Designer for mobile products',
    'Mobile Product Designer',
    'Product Designer for mobile B2C, 0-to-1, or craft-heavy product work',
  ],
  adjacentRoles: [
    'Senior / Lead UX/UI Designer when the role includes product responsibility, discovery/iteration, mobile app ownership, and product-team collaboration.',
    'Senior UI Designer or Mobile UI Designer when the role influences product experience rather than only screen production.',
    'Founding Designer when the scope is designer-led 0-to-1 product design, not founder/operator replacement.',
    'Visual Product Designer when visual craft is embedded in product quality.',
    'Design Systems Designer when there is mobile product/system ownership and contact with product squads.',
  ],
  weakerFits: [
    'production-only UI roles without product ownership',
    'research-only roles without UI/product delivery',
    'brand or marketing-only visual roles',
    'isolated design-system maintenance without product space',
    'desktop SaaS or ops roles without mobile or a strong user-facing surface',
    'roles centered on high-risk monetization, gambling, betting, crypto speculation, predatory finance, or dark-pattern work',
  ],
  startupPrimaryScenarios: ['mobile B2C app', '0-to-1 product design', 'craft-heavy product polish'],
  startupSecondaryScenarios: ['AI-enabled self-service', 'internal platform', 'complex product logic'],
  toolsAndCraft: [
    'Figma',
    'Rive',
    'After Effects',
    'Cinema 4D',
    'Midjourney',
    'Nano Banana 2',
    'Codex App',
    'Xcode',
    'Perplexity',
  ],
  doNotOverclaim: [
    'Do not position Vladyslav as a frontend engineer or software engineer; frame technical fluency as implementation-aware design collaboration, prototyping, and better handoff.',
    'Treat metrics as project/team outcomes; do not imply that design work was the sole direct cause of every result.',
    'Use only explicit public facts for clients, awards, employers, years, scale, and shipped status; do not invent missing context.',
    'Treat the Gallery as a craft, concept, motion, and product-polish signal; only call an item shipped product work when that is explicitly stated.',
    'Frame AI, 3D, and motion as product-craft differentiators tied to clarity, prototyping, visual systems, shipping, and interface quality.',
  ],
} as const;

export const PAGE_METADATA = {
  home: {
    title: 'Vladyslav Horovyy - Product Designer',
    description:
      'Product designer from Kyiv crafting standout mobile apps with product thinking, visual craft, 3D, motion, and AI-assisted workflows.',
  },
  cases: {
    title: 'Case studies - Vladyslav Horovyy',
    description:
      'Mobile product design case studies by Vladyslav Horovyy, including grocery app redesign and AI-powered self-checkout terminal work.',
  },
  gallery: {
    title: 'Gallery - Vladyslav Horovyy',
    description:
      'Selected mobile interface, 3D, motion, and visual design experiments by product designer Vladyslav Horovyy.',
  },
  fora: {
    title: 'Fora app redesign - Vladyslav Horovyy',
    description:
      'Fora grocery app redesign case study: rating improved from 3.0 to 4.6, revenue increased by 5%, and orders increased by 15%.',
  },
  kissa: {
    title: 'Kissa.AI self-checkout terminal redesign - Vladyslav Horovyy',
    description:
      'Kissa.AI self-checkout terminal redesign case study: faster flow, higher self-checkout adoption, and fewer tap errors.',
  },
} as const;
