import type { Case } from '../cases';
import { FORA_CASE_DETAIL_CONFIG } from './fora';
import { KISSA_CASE_DETAIL_CONFIG } from './kissa';
import type { CaseDetailConfig } from './types';

const CASE_DETAIL_CONFIGS: Partial<Record<Case['slug'], CaseDetailConfig>> = {
  fora: FORA_CASE_DETAIL_CONFIG,
  kissa: KISSA_CASE_DETAIL_CONFIG,
};

export function getCaseDetailConfig(slug: Case['slug']): CaseDetailConfig | undefined {
  return CASE_DETAIL_CONFIGS[slug];
}

export type { CaseDetailConfig, CaseDetailSection } from './types';
