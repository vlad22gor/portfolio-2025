export interface MobilePerimeterGridOptions {
  viewportWidth: number;
  marginX?: number;
  baseStep?: number;
  minCols?: number;
  maxCols?: number;
}

export interface MobilePerimeterContract extends Required<MobilePerimeterGridOptions> {
  step: number;
  cols: number;
  width: number;
}

export interface MobilePerimeterHeightOptions {
  targetHeight: number;
  minRows?: number;
}

export interface DivisibleStepOptions {
  width: number;
  baseStep?: number;
  minStep?: number;
  maxStep?: number;
  minCols?: number;
  maxCols?: number;
}

export interface DivisibleStepContract {
  width: number;
  step: number;
  cols: number;
}

export interface ProximityStepOptions {
  width: number;
  baseStep: number;
  defaultCols: number;
  minStep?: number;
  maxStep?: number;
  minCols?: number;
  maxCols?: number;
  maxStepDelta?: number;
}

const clampInt = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, Math.floor(value)));
};

export function resolveMobilePerimeterGrid({
  viewportWidth,
  marginX = 20,
  baseStep = 40,
  minCols = 4,
  maxCols = 24,
}: MobilePerimeterGridOptions): MobilePerimeterContract {
  const safeViewport = Math.max(1, Math.floor(viewportWidth));
  const safeMargin = Math.max(0, Math.floor(marginX));
  const safeBaseStep = Math.max(8, Math.floor(baseStep));
  const safeMinCols = Math.max(1, Math.floor(minCols));
  const safeMaxCols = Math.max(safeMinCols, Math.floor(maxCols));
  const availableWidth = Math.max(safeBaseStep, safeViewport - safeMargin * 2);

  const idealCols = clampInt(Math.round(availableWidth / safeBaseStep), safeMinCols, safeMaxCols);
  const step = Math.max(8, Math.floor(availableWidth / idealCols));
  const width = step * idealCols;

  return {
    viewportWidth: safeViewport,
    marginX: safeMargin,
    baseStep: safeBaseStep,
    minCols: safeMinCols,
    maxCols: safeMaxCols,
    step,
    cols: idealCols,
    width,
  };
}

export function quantizeHeightByStep(
  step: number,
  { targetHeight, minRows = 1 }: MobilePerimeterHeightOptions,
): { rows: number; height: number } {
  const safeStep = Math.max(8, Math.floor(step));
  const safeTargetHeight = Math.max(safeStep, Math.floor(targetHeight));
  const safeMinRows = Math.max(1, Math.floor(minRows));
  const rows = Math.max(safeMinRows, Math.round(safeTargetHeight / safeStep));
  return {
    rows,
    height: rows * safeStep,
  };
}

export function quantizeHeightCeilByStep(
  step: number,
  { targetHeight, minRows = 1 }: MobilePerimeterHeightOptions,
): { rows: number; height: number } {
  const safeStep = Math.max(8, Math.floor(step));
  const safeTargetHeight = Math.max(1, Math.ceil(targetHeight));
  const safeMinRows = Math.max(1, Math.floor(minRows));
  const rows = Math.max(safeMinRows, Math.ceil(safeTargetHeight / safeStep));
  return {
    rows,
    height: rows * safeStep,
  };
}

export function resolveDivisibleStepByWidth({
  width,
  baseStep = 40,
  minStep = 8,
  maxStep,
  minCols = 1,
  maxCols = Number.POSITIVE_INFINITY,
}: DivisibleStepOptions): DivisibleStepContract {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeBaseStep = Math.max(1, Math.floor(baseStep));
  const safeMinStep = Math.max(1, Math.floor(minStep));
  const safeMaxStep =
    typeof maxStep === 'number' && Number.isFinite(maxStep)
      ? Math.max(safeMinStep, Math.floor(maxStep))
      : safeWidth;
  const safeMinCols = Math.max(1, Math.floor(minCols));
  const safeMaxCols =
    Number.isFinite(maxCols) && typeof maxCols === 'number'
      ? Math.max(safeMinCols, Math.floor(maxCols))
      : safeWidth;

  let best: DivisibleStepContract | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let step = safeMinStep; step <= safeMaxStep; step += 1) {
    if (safeWidth % step !== 0) {
      continue;
    }
    const cols = safeWidth / step;
    if (cols < safeMinCols || cols > safeMaxCols) {
      continue;
    }
    const distance = Math.abs(step - safeBaseStep);
    if (
      best === null ||
      distance < bestDistance ||
      (distance === bestDistance && step > best.step)
    ) {
      best = { width: safeWidth, step, cols };
      bestDistance = distance;
    }
  }

  if (best) {
    return best;
  }

  const fallbackCols = clampInt(Math.round(safeWidth / safeBaseStep), safeMinCols, safeMaxCols);
  const fallbackStep = Math.max(safeMinStep, Math.floor(safeWidth / fallbackCols));
  return {
    width: safeWidth,
    step: fallbackStep,
    cols: Math.max(1, Math.floor(safeWidth / fallbackStep)),
  };
}

export function resolveProximityStepByWidth({
  width,
  baseStep,
  defaultCols,
  minStep = 8,
  maxStep,
  minCols = 2,
  maxCols = 12,
  maxStepDelta = 6,
}: ProximityStepOptions): DivisibleStepContract {
  const safeWidth = Math.max(1, Math.floor(width));
  const safeBaseStep = Math.max(1, Math.floor(baseStep));
  const safeDefaultCols = Math.max(1, Math.floor(defaultCols));
  const safeMinStep = Math.max(1, Math.floor(minStep));
  const safeMaxStep =
    typeof maxStep === 'number' && Number.isFinite(maxStep)
      ? Math.max(safeMinStep, Math.floor(maxStep))
      : safeWidth;
  const safeMinCols = Math.max(1, Math.floor(minCols));
  const safeMaxCols = Math.max(safeMinCols, Math.floor(maxCols));
  const safeMaxStepDelta = Math.max(0, Math.floor(maxStepDelta));

  let best: DivisibleStepContract | null = null;
  let bestScore: [number, number, number, number] | null = null;

  const considerCandidate = (step: number, cols: number) => {
    const size = step * cols;
    if (size > safeWidth) {
      return;
    }
    const score: [number, number, number, number] = [
      Math.abs(step - safeBaseStep),
      safeWidth - size,
      Math.abs(cols - safeDefaultCols),
      -size,
    ];
    if (
      bestScore === null ||
      score[0] < bestScore[0] ||
      (score[0] === bestScore[0] &&
        (score[1] < bestScore[1] ||
          (score[1] === bestScore[1] &&
            (score[2] < bestScore[2] || (score[2] === bestScore[2] && score[3] < bestScore[3])))))
    ) {
      best = { width: safeWidth, step, cols };
      bestScore = score;
    }
  };

  const tryRange = (rangeMinStep: number, rangeMaxStep: number) => {
    for (let step = rangeMinStep; step <= rangeMaxStep; step += 1) {
      for (let cols = safeMinCols; cols <= safeMaxCols; cols += 1) {
        considerCandidate(step, cols);
      }
    }
  };

  const boundedMinStep = Math.max(safeMinStep, safeBaseStep - safeMaxStepDelta);
  const boundedMaxStep = Math.min(safeMaxStep, safeBaseStep + safeMaxStepDelta);
  tryRange(boundedMinStep, boundedMaxStep);

  if (best) {
    return best;
  }

  tryRange(safeMinStep, safeMaxStep);
  if (best) {
    return best;
  }

  return resolveDivisibleStepByWidth({
    width: safeWidth,
    baseStep: safeBaseStep,
    minStep: safeMinStep,
    maxStep: safeMaxStep,
    minCols: safeMinCols,
    maxCols: safeMaxCols,
  });
}
