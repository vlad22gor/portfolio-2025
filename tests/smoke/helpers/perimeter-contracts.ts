import {
  quantizeHeightByStep,
  resolveMobilePerimeterGrid,
  resolveProximityStepByWidth,
} from '../../../src/lib/layout/mobilePerimeter';

const resolveInferredMarginX = (viewportWidth: number, sectionWidth: number) => {
  return Math.max(0, Math.floor((viewportWidth - sectionWidth) / 2));
};

export const resolveGalleryMobileExpectations = ({
  viewportWidth,
  sectionWidth,
  baseStep = 40,
  minCols = 6,
  maxCols = 24,
  mockTargetHeight = 384,
  mockMinRows = 8,
  imageTargetHeight = 224,
  imageMinRows = 4,
}: {
  viewportWidth: number;
  sectionWidth: number;
  baseStep?: number;
  minCols?: number;
  maxCols?: number;
  mockTargetHeight?: number;
  mockMinRows?: number;
  imageTargetHeight?: number;
  imageMinRows?: number;
}) => {
  const grid = resolveMobilePerimeterGrid({
    viewportWidth,
    marginX: resolveInferredMarginX(viewportWidth, sectionWidth),
    baseStep,
    minCols,
    maxCols,
  });
  const mockHeight = quantizeHeightByStep(grid.step, {
    targetHeight: mockTargetHeight,
    minRows: mockMinRows,
  });
  const imageHeight = quantizeHeightByStep(grid.step, {
    targetHeight: imageTargetHeight,
    minRows: imageMinRows,
  });

  return {
    step: grid.step,
    gridWidth: grid.width,
    mockHeight: mockHeight.height,
    imageHeight: imageHeight.height,
  };
};

export const resolveCaseProcessTicketExpectations = ({
  viewportWidth,
  marginX = 20,
  maxAvailableWidth = 480,
  ticketGap = 20,
  baseStep,
  defaultCols,
  minStep = 8,
  minCols = 2,
  maxCols = 12,
  maxStepDelta = 6,
}: {
  viewportWidth: number;
  marginX?: number;
  maxAvailableWidth?: number;
  ticketGap?: number;
  baseStep: number;
  defaultCols: number;
  minStep?: number;
  minCols?: number;
  maxCols?: number;
  maxStepDelta?: number;
}) => {
  const availableWidth = Math.max(1, Math.min(viewportWidth - marginX * 2, maxAvailableWidth));
  const ticketTarget = Math.max(8, Math.floor((availableWidth - ticketGap) / 2));
  const contract = resolveProximityStepByWidth({
    width: ticketTarget,
    baseStep,
    defaultCols,
    minStep,
    minCols,
    maxCols,
    maxStepDelta,
  });

  return {
    availableWidth,
    ticketTarget,
    step: contract.step,
    cols: contract.cols,
    ticketWidth: contract.step * contract.cols,
  };
};

export const resolveIntroSliderExpectations = ({
  viewportWidth,
  marginX = 20,
  baseStep = 40,
  minCols = 6,
  maxCols = 18,
  minCardCols = 6,
  cardInlinePadding = 40,
  cardTargetHeight = 384,
  cardMinRows = 8,
}: {
  viewportWidth: number;
  marginX?: number;
  baseStep?: number;
  minCols?: number;
  maxCols?: number;
  minCardCols?: number;
  cardInlinePadding?: number;
  cardTargetHeight?: number;
  cardMinRows?: number;
}) => {
  const grid = resolveMobilePerimeterGrid({
    viewportWidth,
    marginX,
    baseStep,
    minCols,
    maxCols,
  });
  const cardWidth = Math.max(grid.step * minCardCols, grid.width - cardInlinePadding);
  const cardHeight = quantizeHeightByStep(grid.step, {
    targetHeight: cardTargetHeight,
    minRows: cardMinRows,
  }).height;
  const perimeterWidth = Math.max(grid.step * minCardCols, Math.round(cardWidth / grid.step) * grid.step);

  return {
    step: grid.step,
    gridWidth: grid.width,
    cardWidth,
    cardHeight,
    perimeterWidth,
  };
};
