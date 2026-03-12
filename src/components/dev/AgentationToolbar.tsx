import { useEffect } from 'react';
import { Agentation, type Annotation } from 'agentation';

interface Props {
  endpoint?: string;
}

const fallbackEndpoint = 'http://localhost:4747';

export default function AgentationToolbar({ endpoint = fallbackEndpoint }: Props) {
  if (import.meta.env.PROD) {
    return null;
  }

  useEffect(() => {
    const marker = 'block page interactions';

    const findBlockInteractionsCheckbox = () => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      return checkboxes.find((checkbox) => {
        const ariaLabel = checkbox.getAttribute('aria-label')?.toLowerCase() ?? '';
        const nearbyText = [
          checkbox.closest('label')?.textContent,
          checkbox.parentElement?.textContent,
          checkbox.parentElement?.parentElement?.textContent,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return ariaLabel.includes(marker) || nearbyText.includes(marker);
      }) as HTMLInputElement | undefined;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.altKey && event.shiftKey && event.code === 'KeyB')) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      event.preventDefault();
      const checkbox = findBlockInteractionsCheckbox();
      if (!checkbox) {
        console.warn('[Agentation] "Block page interactions" toggle not found');
        return;
      }

      checkbox.click();
      console.info('[Agentation] Block page interactions', { enabled: checkbox.checked });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSessionCreated = (sessionId: string) => {
    console.info('[Agentation] session created', { sessionId, endpoint });
  };

  const handleSubmit = (_output: string, annotations: Annotation[]) => {
    console.info('[Agentation] submitted annotations', {
      endpoint,
      count: annotations.length,
      ids: annotations.map((annotation) => annotation.id),
    });
  };

  return <Agentation endpoint={endpoint} onSessionCreated={handleSessionCreated} onSubmit={handleSubmit} />;
}
