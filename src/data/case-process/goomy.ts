import type { CaseProcessSectionData } from './types';

const MOTIF_SUNBURST = '/media/motifs/motif-sunburst-rounded-12.svg';
const MOTIF_STACK = '/media/motifs/motif-stack-orb-3.svg';
const MOTIF_SCALLOP = '/media/motifs/motif-scallop-disc-20.svg';
const MOTIF_CROSS = '/media/motifs/motif-rounded-cross.svg';
const MOTIF_HALFMOON = '/media/motifs/motif-split-halfmoon.svg';
const MOTIF_HOURGLASS = '/media/motifs/motif-hourglass-totem.svg';

export const GOOMY_PROCESS_SECTION: CaseProcessSectionData = {
  title: 'process',
  variant: 'goomy',
  ticketColorFamily: 'orange',
  caption: 'some prioritised audit tickets where more saturated = more critical',
  steps: [
    {
      text: 'Conducted screenshot audit, then aligned priorities and constraints with the client',
      iconSrc: MOTIF_SUNBURST,
      iconColorToken: '--color-accent-green',
      offsetX: 0,
      rowHeight: 72,
    },
    {
      text: 'Explored bold, colorful and food-first visual directions and approved the best',
      iconSrc: MOTIF_STACK,
      iconColorToken: '--color-accent-blue',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/goomy/process/arrow-1.svg',
        width: 63,
        height: 45,
        left: 75,
        top: -20,
      },
    },
    {
      text: 'Validated the direction on key screens and approved the concept before rollout',
      iconSrc: MOTIF_SCALLOP,
      iconColorToken: '--color-accent-orange',
      offsetX: 336,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/goomy/process/arrow-2.svg',
        width: 73,
        height: 60,
        left: 501,
        top: -78,
      },
    },
    {
      text: 'Redesigned onboarding and the main product flows, simplifying navigation where needed',
      iconSrc: MOTIF_CROSS,
      iconColorToken: '--color-accent-green',
      offsetX: 504,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/goomy/process/arrow-3.svg',
        width: 73,
        height: 59,
        left: 403,
        top: -12,
      },
    },
    {
      text: 'Expanded the approved UI across 86 final screens and product states',
      iconSrc: MOTIF_HALFMOON,
      iconColorToken: '--color-accent-blue',
      offsetX: 336,
      rowHeight: 48,
      arrow: {
        src: '/media/cases/goomy/process/arrow-4.svg',
        width: 52,
        height: 53,
        left: 663,
        top: -22,
      },
    },
    {
      text: 'Built 70+ components and a 450+ token system, with specs for React Native implementation',
      iconSrc: MOTIF_HOURGLASS,
      iconColorToken: '--color-accent-orange',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/goomy/process/arrow-5.svg',
        width: 72,
        height: 53,
        left: 243,
        top: -64,
      },
    },
  ],
  ticketsRows: [
    {
      tickets: [
        { text: 'review modal appears before users get value', tone: 'muted' },
        { text: '“Get Started” does not begin the onboarding flow', tone: 'low' },
        { text: 'onboarding underplays user pains and gains', tone: 'high' },
        { text: 'trial terms and CTA behavior are unclear', tone: 'medium' },
        { text: 'the product demo is disconnected from activation', tone: 'critical' },
      ],
    },
    {
      tickets: [
        { text: 'activation ends before the first saved-recipe aha moment', tone: 'critical' },
        { text: 'page and folder navigation are overly complex', tone: 'medium' },
        { text: 'adding recipes is hard to discover', tone: 'high' },
        { text: 'views, controls and modals feel inconsistent', tone: 'muted' },
      ],
    },
  ],
};
