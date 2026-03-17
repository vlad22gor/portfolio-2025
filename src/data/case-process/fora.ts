import type { CaseProcessSectionData } from './types';

import motifSunburstRounded12 from '../../../assets/motifs/motif-sunburst-rounded-12.svg?url';
import motifStackOrb3 from '../../../assets/motifs/motif-stack-orb-3.svg?url';
import motifScallopDisc20 from '../../../assets/motifs/motif-scallop-disc-20.svg?url';
import motifRoundedCross from '../../../assets/motifs/motif-rounded-cross.svg?url';
import motifSplitHalfmoon from '../../../assets/motifs/motif-split-halfmoon.svg?url';
import motifHourglassTotem from '../../../assets/motifs/motif-hourglass-totem.svg?url';

import processStepArrow1 from '../../../assets/custom icons/process-step arrow 1.svg?url';
import processStepArrow2 from '../../../assets/custom icons/process-step arrow 2.svg?url';
import processStepArrow3 from '../../../assets/custom icons/process-step arrow 3.svg?url';
import processStepArrow4 from '../../../assets/custom icons/process-step arrow 4.svg?url';
import processStepArrow5 from '../../../assets/custom icons/process-step arrow 5.svg?url';

export const FORA_PROCESS_SECTION: CaseProcessSectionData = {
  title: 'process',
  variant: 'fora',
  ticketColorFamily: 'orange',
  caption: 'some prioritised cjm tickets where more saturated = more critical',
  steps: [
    {
      text: 'I used market and audience research to analyze user needs',
      iconSrc: motifSunburstRounded12,
      iconColorToken: '--color-accent-green',
      offsetX: 0,
      rowHeight: 48,
    },
    {
      text: 'Synthesized feedback and ideas into 100+ actionable tickets, prioritizing improvements with RICE',
      iconSrc: motifStackOrb3,
      iconColorToken: '--color-accent-blue',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: processStepArrow1,
        width: 63,
        height: 45,
        left: 75,
        top: -20,
      },
    },
    {
      text: 'Then I created 60+ wireframes to rethink flows, making navigation simpler and delivery features clearer',
      iconSrc: motifScallopDisc20,
      iconColorToken: '--color-accent-orange',
      offsetX: 336,
      rowHeight: 96,
      arrow: {
        src: processStepArrow2,
        width: 73,
        height: 60,
        left: 501,
        top: -78,
      },
    },
    {
      text: 'Developed a fresh design concept reflecting brand values with caring, rounded, animated design style',
      iconSrc: motifRoundedCross,
      iconColorToken: '--color-accent-green',
      offsetX: 504,
      rowHeight: 72,
      arrow: {
        src: processStepArrow3,
        width: 73,
        height: 59,
        left: 403,
        top: -12,
      },
    },
    {
      text: 'Designed handoff UI for 10+ flows with 300+ screens across iOS and Android',
      iconSrc: motifSplitHalfmoon,
      iconColorToken: '--color-accent-blue',
      offsetX: 336,
      rowHeight: 72,
      arrow: {
        src: processStepArrow4,
        width: 52,
        height: 53,
        left: 663,
        top: -22,
      },
    },
    {
      text: 'I also led design reviews that cut bugs in prod by 80%, ensuring a polished look',
      iconSrc: motifHourglassTotem,
      iconColorToken: '--color-accent-orange',
      offsetX: 168,
      rowHeight: 72,
      arrow: {
        src: processStepArrow5,
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
