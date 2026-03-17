import type { CaseProcessSectionData } from './types';

const FORA_MOTIF_SUNBURST = '/media/motifs/motif-sunburst-rounded-12.svg';
const FORA_MOTIF_STACK = '/media/motifs/motif-stack-orb-3.svg';
const FORA_MOTIF_SCALLOP = '/media/motifs/motif-scallop-disc-20.svg';
const FORA_MOTIF_CROSS = '/media/motifs/motif-rounded-cross.svg';
const FORA_MOTIF_HALFMOON = '/media/motifs/motif-split-halfmoon.svg';
const FORA_MOTIF_HOURGLASS = '/media/motifs/motif-hourglass-totem.svg';

export const FORA_PROCESS_SECTION: CaseProcessSectionData = {
  title: 'process',
  variant: 'fora',
  ticketColorFamily: 'orange',
  caption: 'some prioritised cjm tickets where more saturated = more critical',
  steps: [
    {
      text: 'I used market and audience research to analyze user needs',
      iconSrc: FORA_MOTIF_SUNBURST,
      iconColorToken: '--color-accent-green',
      offsetX: 0,
      rowHeight: 48,
    },
    {
      text: 'Synthesized feedback and ideas into 100+ actionable tickets, prioritizing improvements with RICE',
      iconSrc: FORA_MOTIF_STACK,
      iconColorToken: '--color-accent-blue',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/fora/process/arrow-1.svg',
        width: 63,
        height: 45,
        left: 75,
        top: -20,
      },
    },
    {
      text: 'Then I created 60+ wireframes to rethink flows, making navigation simpler and delivery features clearer',
      iconSrc: FORA_MOTIF_SCALLOP,
      iconColorToken: '--color-accent-orange',
      offsetX: 336,
      rowHeight: 96,
      arrow: {
        src: '/media/cases/fora/process/arrow-2.svg',
        width: 73,
        height: 60,
        left: 501,
        top: -78,
      },
    },
    {
      text: 'Developed a fresh design concept reflecting brand values with caring, rounded, animated design style',
      iconSrc: FORA_MOTIF_CROSS,
      iconColorToken: '--color-accent-green',
      offsetX: 504,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/fora/process/arrow-3.svg',
        width: 73,
        height: 59,
        left: 403,
        top: -12,
      },
    },
    {
      text: 'Designed handoff UI for 10+ flows with 300+ screens across iOS and Android',
      iconSrc: FORA_MOTIF_HALFMOON,
      iconColorToken: '--color-accent-blue',
      offsetX: 336,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/fora/process/arrow-4.svg',
        width: 52,
        height: 53,
        left: 663,
        top: -22,
      },
    },
    {
      text: 'I also led design reviews that cut bugs in prod by 80%, ensuring a polished look',
      iconSrc: FORA_MOTIF_HOURGLASS,
      iconColorToken: '--color-accent-orange',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: '/media/cases/fora/process/arrow-5.svg',
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
        { text: "can't add\nitems to cart from \"Favorites\"", tone: 'medium' },
        { text: "can't add\nto cart from receipts / past orders", tone: 'high' },
        { text: 'lack\nof filtering options', tone: 'low' },
        { text: "delivery\nterms and cost aren't clearly available", tone: 'critical' },
        { text: "can't pick geolocation in\u00A0app", tone: 'low' },
      ],
    },
    {
      tickets: [
        { text: 'first-time navigation is confusing; hard to find items', tone: 'muted' },
        { text: 'adding to\ncart has delay (1-5 seconds)', tone: 'low' },
        { text: 'some items\nfail to add to cart at all', tone: 'critical' },
        { text: 'price\nupdate lags when changing item quantity', tone: 'muted' },
      ],
    },
  ],
};
