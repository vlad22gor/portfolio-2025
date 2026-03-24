type DataSource = DOMStringMap | HTMLElement | null | undefined;

const getDataset = (source: DataSource): DOMStringMap | null => {
  if (!source) {
    return null;
  }
  if (typeof HTMLElement !== 'undefined' && source instanceof HTMLElement) {
    return source.dataset;
  }
  return source;
};

const readRawValue = (source: DataSource, key: string): string | null => {
  const dataset = getDataset(source);
  if (!dataset) {
    return null;
  }
  const value = dataset[key];
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim();
};

export const readDataString = (source: DataSource, key: string, fallback = ''): string => {
  const value = readRawValue(source, key);
  return value && value.length > 0 ? value : fallback;
};

export const readDataNumber = (source: DataSource, key: string, fallback: number): number => {
  const value = readRawValue(source, key);
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readDataInt = (source: DataSource, key: string, fallback: number): number => {
  const value = readRawValue(source, key);
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readDataBool = (source: DataSource, key: string, fallback: boolean): boolean => {
  const value = readRawValue(source, key)?.toLowerCase();
  if (!value) {
    return fallback;
  }
  if (value === 'true' || value === '1' || value === 'yes' || value === 'on') {
    return true;
  }
  if (value === 'false' || value === '0' || value === 'no' || value === 'off') {
    return false;
  }
  return fallback;
};

export const readDataEnum = <T extends string>(
  source: DataSource,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T => {
  const value = readRawValue(source, key);
  if (!value) {
    return fallback;
  }
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
};

export const readDataJson = <T>(source: DataSource, key: string, fallback: T): T => {
  const value = readRawValue(source, key);
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
