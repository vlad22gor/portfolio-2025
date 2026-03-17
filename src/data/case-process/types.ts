export type CaseProcessIconColorToken = '--color-accent-green' | '--color-accent-blue' | '--color-accent-orange';

export interface CaseProcessArrow {
  src: string;
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface CaseProcessStep {
  text: string;
  iconSrc: string;
  iconColorToken: CaseProcessIconColorToken;
  offsetX: number;
  rowHeight: number;
  arrow?: CaseProcessArrow;
}

export type CaseProcessTicketTone = 'critical' | 'high' | 'medium' | 'low' | 'muted';

export interface CaseProcessTicket {
  text: string;
  tone: CaseProcessTicketTone;
}

export interface CaseProcessTicketRow {
  tickets: CaseProcessTicket[];
}

export type CaseProcessTicketVariant = 'square-36' | 'circle-24';

export interface CaseProcessSectionData {
  title: string;
  caption: string;
  steps: CaseProcessStep[];
  ticketsRows: CaseProcessTicketRow[];
  variant?: string;
  ticketColorFamily?: 'orange' | 'blue';
  ticketVariant?: CaseProcessTicketVariant;
}
