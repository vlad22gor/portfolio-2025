import { useEffect } from 'react';
import { DialRoot, useDialKit, type DialConfig } from 'dialkit';
import 'dialkit/styles.css';

const panelId = 'goomy-challenge-tuning-v3';

const goomyChallengeDialConfig = {
  activeControls: {
    y: [338, 300, 430, 1],
  },
  activeControlsArrow: {
    y: [327, 300, 430, 1],
  },
} satisfies DialConfig;

export default function GoomYChallengeDialKit() {
  const values = useDialKit('GoomY challenge tuning', goomyChallengeDialConfig, {
    id: panelId,
    persist: true,
  });

  useEffect(() => {
    const applyValues = () => {
      const note = document.querySelector<HTMLElement>(
        '.goomy-case-challenge .case-challenge-scene-wrap--desktop [data-note-id="active-controls"]',
      );
      note?.style.setProperty('--case-note-top', `${values.activeControls.y}px`);

      const arrow = document.querySelector<HTMLElement>(
        '.goomy-case-challenge .case-challenge-scene-wrap--desktop .case-challenge-arrow[data-note-id="active-controls"]',
      );
      arrow?.style.setProperty('--case-arrow-top', `${values.activeControlsArrow.y}px`);
    };

    applyValues();
    document.addEventListener('astro:page-load', applyValues);

    return () => {
      document.removeEventListener('astro:page-load', applyValues);
    };
  }, [values.activeControls.y, values.activeControlsArrow.y]);

  return <DialRoot position="top-right" defaultOpen theme="system" />;
}
