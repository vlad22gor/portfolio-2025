export const AGENT_PROOF_MATRIX = [
  {
    title: 'Mobile product redesign / scale',
    primaryProof: 'Fora app redesign',
    useWhen: [
      'native mobile app redesign',
      'mobile B2C app quality',
      'app rating and business outcome improvement',
      'simplifying grocery or ecommerce flows',
      'visual system refresh',
      'product and engineering collaboration',
      'design systems and component consistency',
    ],
    summary:
      'Use Fora when a recruiter, hiring manager, or CEO needs proof of mobile redesign at scale, measurable outcomes, and product-quality craft.',
  },
  {
    title: '0-to-1 / AI-enabled / complex self-service',
    primaryProof: 'Kissa.AI self-checkout terminal redesign',
    useWhen: [
      '0-to-1 product design',
      'AI-enabled interface',
      'self-service or checkout flow',
      'unfamiliar product made understandable',
      'interaction model and visual guidance',
      'prototype testing on a real device',
      'startup ambiguity and product ownership',
    ],
    summary:
      'Use Kissa.AI when the reader needs evidence that Vladyslav can clarify complex product logic and turn it into an understandable, polished flow.',
  },
  {
    title: 'Craft-heavy product polish',
    primaryProof: 'Fora + Gallery',
    useWhen: [
      'UI craft',
      'motion and microinteractions',
      '3D visual exploration',
      'visual systems',
      'design systems',
      'product quality through details',
      'interfaces that feel clearer and more memorable',
    ],
    summary:
      'Use Fora and the Gallery together when the reader cares about taste, polish, motion, 3D, and product-quality interface details.',
  },
  {
    title: 'Startup CEO / B2C, 0-to-1, product polish confidence',
    primaryProof: 'Kissa.AI + Fozzy Group internal platform + MVP',
    useWhen: [
      'mobile B2C app',
      '0-to-1 product design and early product shaping',
      'craft-heavy product polish',
      'product ambiguity',
      'small-team collaboration',
      'turning product ideas into usable, polished interfaces',
      'connecting visual craft directly to product clarity',
    ],
    summary:
      'Use this angle when a founder or CEO needs confidence that Vladyslav can help a small team move from ambiguity to a polished, shippable product experience.',
  },
] as const;

export const TESTIMONIALS = [
  {
    author: 'Eugenia Vyshnytska',
    role: 'Senior UX Writer',
    summary: 'Vladyslav brings clarity to complex problems and is proactive, empathetic, and collaborative.',
  },
  {
    author: 'Egor Privalov',
    role: 'Senior iOS Developer',
    summary:
      'Vladyslav is a talented designer with strong attention to detail, thoughtful visual work, communication, kindness, and positive collaboration.',
  },
  {
    author: 'Ivan Shevchenko',
    role: 'Senior Product Designer',
    summary:
      'Vladyslav brings fresh ideas, pushes for improvements proactively, and takes on tricky product and design challenges.',
  },
] as const;

export const GALLERY_AGENT_SUMMARY = {
  title: 'Gallery as visual craft signal',
  summary:
    'The gallery shows mobile interface concepts, device mockups, 3D/motion work, visual experiments, and polished product moments. Read it as evidence of craft range, taste, interface joy, and product-polish standards; only call an item shipped product work when that is explicitly stated.',
  categories: [
    'mobile concepts',
    'device mockups',
    '3D and motion craft',
    'visual experiments',
    'product-polish studies',
  ],
} as const;

export const CASE_AGENT_DETAILS = {
  fora: {
    title: 'Fora app redesign',
    context:
      "Fora is one of Ukraine's largest grocery retailers, with 300+ stores. The app redesign focused on convenient, friendly grocery shopping across iOS and Android.",
    roleRows: [
      'role: product designer',
      'team: 4 front-end developers, 2 back-end developers, PO, PM, BA, 2 QA',
      'platform: iOS and Android',
    ],
    scope: ['app redesign', '3D graphics and animations', 'design system development'],
    challenge: [
      "The Ukrainian food retail market is highly competitive, so refreshing the app's design was essential.",
      'Outdated visuals and clunky flows made it difficult to attract and retain users.',
      'The redesign needed to boost app-store ratings, increase installs, streamline ordering, grow average order value, and increase total orders.',
    ],
    process: [
      'Used market and audience research to analyze user needs.',
      'Synthesized feedback and ideas into 100+ actionable tickets, prioritizing improvements with RICE.',
      'Created 60+ wireframes to rethink flows and make navigation and delivery features clearer.',
      'Developed a fresh design concept reflecting brand values with a caring, rounded, animated design style.',
      'Designed handoff UI for 10+ flows with 300+ screens across iOS and Android.',
      'Led design reviews that reduced production UI bugs and helped preserve a polished look.',
    ],
    interventions: [
      {
        title: 'Visual categories and smart selection',
        summary:
          'Images on category cards made discovery instant. Recent address selection and quick time slots reduced selection time by 50%.',
      },
      {
        title: 'Two-level categories navigation',
        summary:
          'Subcategory and sub-subcategory filters let users narrow down instantly, cutting product search time by 30%.',
      },
      {
        title: 'Free delivery progress and payment options',
        summary:
          'Free delivery progress increased average order value by 10%. Apple Pay and Google Pay integrations lifted order volume by 15%.',
      },
      {
        title: 'App design system',
        summary:
          'Unified color palette, Figma/code styles, and 20+ standardized components improved consistency, reduced UI bugs by 40%, and cut new feature time to market by 25%.',
      },
    ],
    outcomes: [
      'increased the App Store and Google Play rating from 3.0 to 4.6',
      'increased company revenue by 5%',
      'increased orders by 15%',
      'cut product search time by 30%',
      'reduced address and time selection time by 50%',
      'increased average order value by 10%',
      'reduced UI bugs by 40%',
      'cut new feature time to market by 25%',
    ],
    caveat:
      'Phrase outcomes as project/team results and avoid implying that design work was the sole direct cause of every metric.',
  },
  kissa: {
    title: 'Kissa.AI self-checkout terminal redesign',
    context:
      'Kissa.AI is a foodtech startup specializing in AI-powered recognition of dish images. The main product is a self-checkout terminal designed to speed up ordering in fast food venues.',
    roleRows: ['role: product designer', 'team: PO/client and 1 developer', 'platform: full HD tablet'],
    scope: ['interface redesign', 'visual concept', '3D graphics and animations'],
    challenge: [
      'The self-checkout system had low user adoption because customers found it unfamiliar and preferred cashiers.',
      'Long queues during peak times worsened the issue.',
      'The goal was to create a clear, engaging, and fast interface that users would want to use and return to.',
    ],
    process: [
      'Conducted a survey and identified five main product issues users had.',
      'Led brainstorming sessions with the client and designed a new, more intuitive navigation system.',
      'Created and approved 20+ detailed wireframes, simplifying architecture to speed up the user flow.',
      'Developed a visual concept inspired by portal and speed, making the interface feel technological, unique, and modern.',
      'Ran usability and accessibility tests on checkout terminals.',
      'Created 3D animations and illustrations and prepared assets for development.',
    ],
    interventions: [
      {
        title: 'Engaging animated welcome screen',
        summary:
          'A bright 3D animation drew users in and encouraged them to try a new self-checkout experience.',
      },
      {
        title: 'Instant tray review',
        summary:
          'Users could check, edit, or add products in seconds with quick category search and price breakdowns, cutting flow time by 50%.',
      },
      {
        title: 'Interactive payment flow',
        summary:
          'Progress bar, dynamic messages, and 3D illustrations made checkout feel responsive while reinforcing brand identity and innovation.',
      },
      {
        title: 'Real terminal testing',
        summary:
          'The prototype was tested on the real product device to validate navigation, guidance, and operational clarity.',
      },
    ],
    outcomes: [
      'reduced flow time by 50%',
      'increased the channel shift rate from staffed checkout to self-checkout terminal by 20%',
      'reduced tap error rate by 80%',
    ],
    caveat:
      'Avoid implying broad production scale beyond what is explicitly documented. Describe the outcomes as project results.',
  },
} as const;
