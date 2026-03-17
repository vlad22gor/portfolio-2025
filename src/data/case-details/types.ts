import type { Case } from '../cases';
import type { CaseProcessSectionData } from '../case-process/types';

export type InViewPreset = 'appear-v1';

export interface CaseDetailImage {
  src: string;
  alt: string;
}

export interface CaseDetailIntroRow {
  label: string;
  value: string;
}

export interface CaseDetailIntroData {
  title: string;
  subtitle: string;
  overviewLabel: string;
  scopeLabel: string;
  resultsLabel: string;
  overviewRows: CaseDetailIntroRow[];
  scopeLines: string[];
  resultLines: string[];
  dividerCounts: {
    overview: number;
    scope: number;
    results: number;
  };
}

export interface CaseDetailChallengeNote {
  id: string;
  text: string;
  left: number;
  top: number;
  width: number;
  arrowSrc: string;
  arrowLeft: number;
  arrowTop: number;
  arrowWidth: number;
  arrowHeight: number;
}

export interface CaseDetailChallengeData {
  title: string;
  columns: [string, string];
  device: 'phone' | 'tablet';
  screen: CaseDetailImage;
  notes: CaseDetailChallengeNote[];
}

export type CaseFeatureCardBadgeTone = 'blue' | 'gray' | 'orange' | 'green';

export interface CaseFeatureCardBadge {
  label: string;
  tone: CaseFeatureCardBadgeTone;
}

export interface CaseFeatureCardItem {
  mockSide: 'left' | 'right';
  device: 'phone' | 'tablet';
  badges: CaseFeatureCardBadge[];
  title: string;
  description: string;
  mock: {
    kind: 'video';
    src: string;
  };
}

export interface CaseDetailDesignSystemData {
  heading: string;
  copyPaletteTitle: string;
  copyPaletteBody: string;
  copyStylesTitle: string;
  copyStylesBody: string;
  copyLibraryTitle: string;
  copyLibraryBody: string;
  summaryImageSrc: string;
  horizontalImageSrc: string;
  verticalImageSrc: string;
  sheetImageSrc: string;
  arrowTopSrc: string;
  arrowBottomLeftSrc: string;
  arrowBottomRightSrc: string;
}

export interface CaseDetailTeamPhotoData {
  photoSrc: string;
  photoAlt: string;
  caption: string;
  heartLeftSrc: string;
  heartRightSrc: string;
}

export interface CaseDetailArtifactPhotosData {
  leftPhoto: CaseDetailImage;
  rightPhoto: CaseDetailImage;
  topCaption: string;
  bottomCaption: string;
  leftArrowSrc: string;
  rightArrowSrc: string;
}

export type CaseDetailSection =
  | {
      type: 'intro';
      data: CaseDetailIntroData;
      inViewPreset?: InViewPreset;
      className?: string;
    }
  | {
      type: 'introScreens';
      variant: 'phone' | 'tablet';
      screens: readonly [CaseDetailImage, CaseDetailImage, CaseDetailImage];
      inViewPreset?: InViewPreset;
      className?: string;
    }
  | {
      type: 'challenge';
      data: CaseDetailChallengeData;
      inViewPreset?: InViewPreset;
      className?: string;
    }
  | {
      type: 'process';
      data: CaseProcessSectionData;
      inViewPreset?: InViewPreset;
      className?: string;
    }
  | {
      type: 'featureCards';
      cards: CaseFeatureCardItem[];
      className?: string;
    }
  | {
      type: 'designSystem';
      data: CaseDetailDesignSystemData;
      className?: string;
      inViewPreset?: InViewPreset;
    }
  | {
      type: 'teamPhoto';
      data: CaseDetailTeamPhotoData;
      className?: string;
      inViewPreset?: InViewPreset;
    }
  | {
      type: 'artifactPhotos';
      data: CaseDetailArtifactPhotosData;
      className?: string;
      inViewPreset?: InViewPreset;
    }
  | {
      type: 'caseSwitcher';
      className?: string;
      inViewPreset?: InViewPreset;
    };

export interface CaseDetailConfig {
  slug: Case['slug'];
  pageShellClasses?: string[];
  sections: CaseDetailSection[];
}
