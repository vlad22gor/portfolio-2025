import type { CaseProcessSectionData } from './types';

const KISSA_MOTIF_SUNBURST = '/media/motifs/motif-sunburst-rounded-12.svg';
const KISSA_MOTIF_STACK = '/media/motifs/motif-stack-orb-3.svg';
const KISSA_MOTIF_SCALLOP = '/media/motifs/motif-scallop-disc-20.svg';
const KISSA_MOTIF_CROSS = '/media/motifs/motif-rounded-cross.svg';
const KISSA_MOTIF_HALFMOON = '/media/motifs/motif-split-halfmoon.svg';
const KISSA_MOTIF_HOURGLASS = '/media/motifs/motif-hourglass-totem.svg';

export const KISSA_PROCESS_SECTION: CaseProcessSectionData = {
  title: 'process',
  variant: 'kissa',
  ticketColorFamily: 'blue',
  ticketVariant: 'circle-24',
  caption: 'prioritised survey revealed product issues where more saturated = more critical',
  steps: [
    {
      text: 'I conducted survey and identified 5 main issues users had with product',
      iconSrc: KISSA_MOTIF_SUNBURST,
      iconColorToken: '--color-accent-green',
      offsetX: 0,
      rowHeight: 48,
    },
    {
      text: 'Led brainstorming sessions with the client, designing a new, more intuitive navigation system',
      iconSrc: KISSA_MOTIF_STACK,
      iconColorToken: '--color-accent-blue',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/kissa/process/arrow-1.svg',
        width: 63,
        height: 45,
        left: 75,
        top: -20,
      },
    },
    {
      text: 'Created and approved 20+ detailed wireframes, simplifying architecture to speed up user flow',
      iconSrc: KISSA_MOTIF_SCALLOP,
      iconColorToken: '--color-accent-orange',
      offsetX: 336,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/kissa/process/arrow-2.svg',
        width: 73,
        height: 60,
        left: 501,
        top: -78,
      },
    },
    {
      text: 'Developed a design concept inspired by portal and speed, making the interface feel technological, unique, and modern',
      iconSrc: KISSA_MOTIF_CROSS,
      iconColorToken: '--color-accent-green',
      offsetX: 504,
      rowHeight: 96,
      arrow: {
        src: '/media/cases/kissa/process/arrow-3.svg',
        width: 73,
        height: 59,
        left: 403,
        top: -12,
      },
    },
    {
      text: 'Ran usability and accessibility tests on checkout terminals',
      iconSrc: KISSA_MOTIF_HALFMOON,
      iconColorToken: '--color-accent-blue',
      offsetX: 336,
      rowHeight: 48,
      arrow: {
        src: '/media/cases/kissa/process/arrow-4.svg',
        width: 52,
        height: 53,
        left: 663,
        top: -22,
      },
    },
    {
      text: 'Created 3D animation and illustrations and prepared all assets for development',
      iconSrc: KISSA_MOTIF_HOURGLASS,
      iconColorToken: '--color-accent-orange',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/kissa/process/arrow-5.svg',
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
        {
          text: 'difficulty making\u00A0item replacements',
          tone: 'medium',
        },
        {
          text: 'lack of a\nsearch function in the menu',
          tone: 'high',
        },
        {
          text: 'incorrect recognition of dishes',
          tone: 'muted',
        },
        {
          text: 'half\nportions detection issues',
          tone: 'low',
        },
        {
          text: 'unresponsive screens, leading to frustration',
          tone: 'critical',
        },
      ],
    },
  ],
};
