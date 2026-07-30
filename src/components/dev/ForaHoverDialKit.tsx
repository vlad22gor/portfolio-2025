import { useEffect } from 'react';
import { DialRoot, useDialKit, type DialConfig } from 'dialkit';
import 'dialkit/styles.css';

const panelId = 'fora-hover-assets-v2';
const panelOpenStorageKey = 'fora-hover-dialkit-open-v2';
const tuningEventName = 'case-card:tuning-update';

const foraHoverDialConfig = {
  freezeHover: false,
  debugBounds: false,
  deliveryTime: {
    x: [739.12, -400, 1400, 0.01],
    y: [-74.9, -500, 800, 0.01],
    rotation: [13.8, -180, 180, 0.01],
    width: [288, 80, 800, 1],
    height: [257, 80, 800, 1],
  },
  summary: {
    x: [777.54, -400, 1400, 0.01],
    y: [135.3, -500, 800, 0.01],
    rotation: [31.46, -180, 180, 0.01],
    width: [252, 80, 800, 1],
    height: [340, 80, 800, 1],
  },
} satisfies DialConfig;

type AssetValues = {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
};

function readPanelOpenPreference() {
  try {
    return window.localStorage.getItem(panelOpenStorageKey) === '1';
  } catch {
    return false;
  }
}

function storePanelOpenPreference(open: boolean) {
  try {
    window.localStorage.setItem(panelOpenStorageKey, open ? '1' : '0');
  } catch {
    // Dial controls remain usable when storage is unavailable.
  }
}

function applyAssetValues(
  card: HTMLElement,
  assetId: 'delivery-time' | 'summary',
  values: AssetValues,
  debugBounds: boolean,
) {
  const asset = card.querySelector<HTMLElement>(
    `[data-case-card-hover-asset-id="${assetId}"]`,
  );
  if (!asset) {
    return;
  }

  asset.dataset.targetX = String(values.x);
  asset.dataset.targetY = String(values.y);
  asset.dataset.targetWidth = String(values.width);
  asset.dataset.targetHeight = String(values.height);
  asset.style.top = `${values.y}px`;
  asset.style.width = `${values.width}px`;
  asset.style.height = `${values.height}px`;
  asset.style.outline = debugBounds ? '1px solid #ff3b30' : '';

  const inner = asset.querySelector<HTMLElement>('.case-card-hover-asset-inner');
  inner?.style.setProperty('--case-card-asset-rotation', `${values.rotation}deg`);
}

export default function ForaHoverDialKit() {
  const values = useDialKit('Fora hover assets', foraHoverDialConfig, {
    id: panelId,
    persist: true,
  });

  useEffect(() => {
    const applyValues = () => {
      const card = document.querySelector<HTMLElement>(
        '[data-case-card][data-case-slug="fora"]',
      );
      if (!card) {
        return;
      }

      card.dataset.caseCardHoverPinned = values.freezeHover ? 'true' : 'false';
      applyAssetValues(card, 'delivery-time', values.deliveryTime, values.debugBounds);
      applyAssetValues(card, 'summary', values.summary, values.debugBounds);
      card.dispatchEvent(new CustomEvent(tuningEventName));
    };

    applyValues();
    document.addEventListener('astro:page-load', applyValues);

    return () => {
      document.removeEventListener('astro:page-load', applyValues);
      const card = document.querySelector<HTMLElement>(
        '[data-case-card][data-case-slug="fora"]',
      );
      if (!card) {
        return;
      }
      card.dataset.caseCardHoverPinned = 'false';
      card.dispatchEvent(new CustomEvent(tuningEventName));
    };
  }, [
    values.freezeHover,
    values.debugBounds,
    values.deliveryTime.x,
    values.deliveryTime.y,
    values.deliveryTime.rotation,
    values.deliveryTime.width,
    values.deliveryTime.height,
    values.summary.x,
    values.summary.y,
    values.summary.rotation,
    values.summary.width,
    values.summary.height,
  ]);

  return (
    <DialRoot
      position="top-right"
      defaultOpen={readPanelOpenPreference()}
      theme="system"
      onOpenChange={storePanelOpenPreference}
    />
  );
}
